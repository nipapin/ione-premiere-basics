import { query } from "@/app/database/postgre";
import { getAffiliateLinks } from "@/lib/affiliate-access";
import { getAffiliateStatistics } from "@/lib/affiliate-statistics";
import { validateSession } from "@/lib/session";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
	try {
		const session = await validateSession();
		if (!session) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
		const user = (await query("SELECT user_id, is_admin FROM users WHERE user_id = $1", [session.user_id]))[0];
		const links = getAffiliateLinks(user || null);
		if (!links.length) return Response.json({ error: "Forbidden" }, { status: 403, headers });
		return Response.json(await getAffiliateStatistics(links), { headers });
	} catch (error) {
		console.error("Unable to load affiliate statistics", error);
		return Response.json({ error: "Unable to load affiliate statistics" }, { status: 500, headers });
	}
}
