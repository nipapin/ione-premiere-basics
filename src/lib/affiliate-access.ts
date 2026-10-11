import "server-only";

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
