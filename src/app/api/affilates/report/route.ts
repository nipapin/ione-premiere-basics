import { query } from "@/app/database/postgre";
import { validateSession } from "@/lib/session";
import { getSalesReport, salesPeriod } from "@/lib/sales-report";

const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
	try {
		const session = await validateSession();
		if (!session) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
		const user = (await query("SELECT user_id,is_admin FROM users WHERE user_id=$1", [session.user_id]))[0];
		if (!user) return Response.json({ error: "Forbidden" }, { status: 403, headers });
		const params = new URL(request.url).searchParams;
		const partnerId = params.get("partner");
		if (partnerId && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(partnerId)) return Response.json({ error: "Invalid partner" }, { status: 400, headers });
		const partners = await query("SELECT id,name,user_id FROM odin_affiliate_partners WHERE ($1::boolean OR user_id=$2) ORDER BY created_at,name", [user.is_admin === true, user.user_id]);
		const selected = partnerId ? partners.find((partner: { id: string }) => partner.id === partnerId) : null;
		if ((partnerId && !selected) || (!partnerId && !user.is_admin)) return Response.json({ error: "Forbidden" }, { status: 403, headers });
		const allLinks = await query("SELECT p.partner_id,l.code,l.label FROM odin_affiliate_partner_links p JOIN odin_affiliate_links l ON l.code=p.code WHERE p.partner_id=ANY($1::uuid[]) ORDER BY l.code", [partners.map((partner: { id: string }) => partner.id)]);
		const codes = selected ? allLinks.filter((link: { partner_id: string }) => link.partner_id === partnerId).map((link: { code: string }) => link.code) : null;
		const selectedCode = params.get("link");
		const visibleLinks = selected ? allLinks.filter((link: { partner_id: string }) => link.partner_id === partnerId) : await query("SELECT code,label FROM odin_affiliate_links ORDER BY created_at DESC,code");
		if (selectedCode && !visibleLinks.some((link: {code: string}) => link.code === selectedCode)) return Response.json({ error: "Invalid link" }, { status: 400, headers });
		const page = Number(params.get("page") || 1);
		if (!Number.isSafeInteger(page) || page < 1) return Response.json({ error: "Invalid page" }, { status: 400, headers });
		const period = salesPeriod(params);
		const report = await getSalesReport(selectedCode ? [selectedCode] : codes, period, page);
		const partnerSummaries = selected ? [] : await Promise.all(partners.map(async (partner: { id: string; name: string }) => {
			const partnerLinks = allLinks.filter((link: { partner_id: string }) => link.partner_id === partner.id);
			return { id: partner.id, name: partner.name, links: partnerLinks, summary: (await getSalesReport(partnerLinks.map((link: { code: string }) => link.code), period)).summary };
		}));
		return Response.json({ ...report, partner: selected ? { id: selected.id, name: selected.name } : null, links: visibleLinks, partners: partnerSummaries, isAdmin: user.is_admin === true }, { headers });
	} catch (error) {
		if (error instanceof Error && error.message === "INVALID_PERIOD") return Response.json({ error: "Choose a valid date range." }, { status: 400, headers });
		console.error("Unable to load sales report", error instanceof Error ? error.message : "Unknown error");
		return Response.json({ error: "Unable to load the sales report." }, { status: 500, headers });
	}
}
