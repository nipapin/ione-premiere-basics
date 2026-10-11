import { query } from "@/app/database/postgre";
import { getAccountAffiliateLinks, getAffiliateLinks } from "@/lib/affiliate-access";
import { getAffiliateStatistics } from "@/lib/affiliate-statistics";
import { validateSession } from "@/lib/session";
import { validateCsrfToken } from "@/lib/csrf";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
	try {
		const session = await validateSession();
		if (!session) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
		const user = (await query("SELECT user_id, is_admin FROM users WHERE user_id = $1", [session.user_id]))[0];
		const links = await getAccountAffiliateLinks(user || null);
		if (!links.length) return Response.json({ error: "Forbidden" }, { status: 403, headers });
		const statistics = await getAffiliateStatistics(links.map(link => link.code));
		return Response.json(statistics.map((item, index) => ({ ...item, label: links[index].label })), { headers });
	} catch (error) {
		console.error("Unable to load affiliate statistics", error);
		return Response.json({ error: "Unable to load affiliate statistics" }, { status: 500, headers });
	}
}

export async function POST(request: Request) {
	try {
		const session = await validateSession();
		if (!session) return Response.json({ error: "Please log in again." }, { status: 401, headers });
		const user = (await query("SELECT user_id, is_admin FROM users WHERE user_id = $1", [session.user_id]))[0];
		if (!user || (!user.is_admin && !(await getAccountAffiliateLinks(user)).length)) {
			return Response.json({ error: "This account cannot create referral links." }, { status: 403, headers });
		}
		const body = await request.json().catch(() => null);
		if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Invalid request." }, { status: 400, headers });
		if (typeof body.csrfToken !== "string" || !(await validateCsrfToken(body.csrfToken))) {
			return Response.json({ error: "Please try again. The security token has expired." }, { status: 403, headers });
		}
		if (typeof body.code !== "string" || (body.label !== undefined && typeof body.label !== "string") || (body.ownerEmail !== undefined && typeof body.ownerEmail !== "string")) {
			return Response.json({ error: "Invalid link details." }, { status: 400, headers });
		}
		const code = body.code.trim().toLowerCase();
		const label = body.label?.trim() || code;
		const ownerEmail = body.ownerEmail?.trim().toLowerCase() || "";
		if (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(code) || label.length > 80 || ownerEmail.length > 254) {
			return Response.json({ error: "Use a code of 3–64 lowercase letters, numbers or hyphens, and a name up to 80 characters." }, { status: 400, headers });
		}
		if (!user.is_admin && ownerEmail) return Response.json({ error: "Only administrators can choose another account." }, { status: 403, headers });
		let ownerUserId = user.user_id;
		if (ownerEmail) {
			const owners = await query("SELECT user_id FROM users WHERE lower(email) = $1", [ownerEmail]);
			if (owners.length !== 1) return Response.json({ error: "Enter the email of an existing, unique account." }, { status: 400, headers });
			ownerUserId = owners[0].user_id;
		}
		// Configured legacy codes and codes with sales cannot be claimed as new links.
		if (getAffiliateLinks({ user_id: user.user_id, is_admin: true }).includes(code)) {
			return Response.json({ error: "This referral code is already in use. Choose another." }, { status: 409, headers });
		}
		const created = await query(`INSERT INTO odin_affiliate_links (code, label, owner_user_id, created_by)
			SELECT $1, $2, $3, $4
			WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE affilate = $1)
			AND NOT EXISTS (SELECT 1 FROM payments WHERE affilate = $1)
			ON CONFLICT (code) DO NOTHING RETURNING code, label`, [code, label, ownerUserId, user.user_id]);
		if (!created.length) return Response.json({ error: "This referral code is already in use. Choose another." }, { status: 409, headers });
		return Response.json(created[0], { status: 201, headers });
	} catch (error) {
		console.error("Unable to create affiliate link", error);
		return Response.json({ error: "Unable to create the link. Please try again." }, { status: 500, headers });
	}
}
