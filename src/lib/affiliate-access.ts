import "server-only";
import { query } from "@/app/database/postgre";
import type { AffiliateLink } from "@/types/affiliates";

export const defaultAffiliateLinks = ["cinecom", "premierebasics", "aftereffectsbasics"];

// Only server-configured account UUIDs and verified administrators grant access.
export function getAffiliateLinks(user: { user_id: string; is_admin?: boolean } | null): string[] {
	if (!user) return [];
	let access: Record<string, string[]> = {};
	if (process.env.ODIN_AFFILIATE_ACCESS) {
		try {
			const parsed: unknown = JSON.parse(process.env.ODIN_AFFILIATE_ACCESS);
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
			for (const links of Object.values(parsed)) {
				if (!Array.isArray(links) || links.some(link => typeof link !== "string" || !link.trim() || link !== link.trim() || link.length > 200)) throw new Error();
			}
			access = parsed as Record<string, string[]>;
		} catch {
			throw new Error("ODIN_AFFILIATE_ACCESS must map account UUIDs to arrays of referral codes");
		}
	}
	const links = user.is_admin
		? [...defaultAffiliateLinks, ...Object.values(access).flat()]
		: Object.hasOwn(access, user.user_id) ? access[user.user_id] : [];
	return [...new Set(links)];
}

export async function getAccountAffiliateLinks(user: { user_id: string; is_admin?: boolean } | null): Promise<AffiliateLink[]> {
	if (!user) return [];
	const legacy = getAffiliateLinks(user);
	const managed: AffiliateLink[] = user.is_admin
		? await query("SELECT code, label FROM odin_affiliate_links ORDER BY created_at, code")
		: await query(`SELECT DISTINCT l.code,l.label FROM odin_affiliate_links l
			LEFT JOIN odin_affiliate_partner_links pl ON pl.code=l.code
			LEFT JOIN odin_affiliate_partners p ON p.id=pl.partner_id
			WHERE (l.owner_user_id=$1 AND pl.partner_id IS NULL) OR p.user_id=$1 ORDER BY l.code`, [user.user_id]);
	const links = new Map<string, AffiliateLink>(legacy.map(code => [code, { code, label: code }]));
	for (const link of managed) links.set(link.code, link);
	return [...links.values()];
}
