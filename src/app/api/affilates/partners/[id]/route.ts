import { query } from "@/app/database/postgre";
import { validateSession } from "@/lib/session";
import { validateCsrfToken } from "@/lib/csrf";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
	try {
		const session = await validateSession();
		if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
		const user = (await query("SELECT is_admin FROM users WHERE user_id=$1", [session.user_id]))[0];
		if (!user?.is_admin) return Response.json({ error: "Forbidden" }, { status: 403 });
		const { id } = await context.params;
		if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) return Response.json({ error: "Invalid partner" }, { status: 400 });
		const body = await request.json().catch(() => null);
		if (!body || typeof body.csrfToken !== "string" || !(await validateCsrfToken(body.csrfToken))) return Response.json({ error: "Invalid security token" }, { status: 403 });
		if (!Array.isArray(body.codes) || body.codes.length > 200 || body.codes.some((code: unknown) => typeof code !== "string")) return Response.json({ error: "Invalid referral links" }, { status: 400 });
		const partner = (await query("SELECT id FROM odin_affiliate_partners WHERE id=$1", [id]))[0];
		if (!partner) return Response.json({ error: "Partner not found" }, { status: 404 });
		const codes = [...new Set(body.codes)];
		if (body.ownerEmail !== undefined && typeof body.ownerEmail !== "string") return Response.json({ error: "Invalid email" }, { status: 400 });
		let ownerId: string | null | undefined;
		if (body.ownerEmail !== undefined) {
			ownerId = null;
			if (body.ownerEmail.trim()) {
				const owners = await query("SELECT user_id FROM users WHERE lower(email)=$1", [body.ownerEmail.trim().toLowerCase()]);
				if (owners.length !== 1) return Response.json({ error: "Enter an existing account email" }, { status: 400 });
				ownerId = owners[0].user_id;
			}
		}
		const known = await query("SELECT code FROM odin_affiliate_links WHERE code=ANY($1::text[])", [codes]);
		if (known.length !== codes.length) return Response.json({ error: "Unknown referral link" }, { status: 400 });
		await query(`WITH updated AS (UPDATE odin_affiliate_partners SET user_id=CASE WHEN $3::boolean THEN $4::uuid ELSE user_id END WHERE id=$1),
			removed AS (DELETE FROM odin_affiliate_partner_links WHERE partner_id=$1 AND NOT(code=ANY($2::text[])))
			INSERT INTO odin_affiliate_partner_links(partner_id,code) SELECT $1,unnest($2::text[]) ON CONFLICT DO NOTHING`, [id, codes, body.ownerEmail !== undefined, ownerId ?? null]);
		return Response.json({ updated: true });
	} catch {
		return Response.json({ error: "Unable to save partner. Please try again." }, { status: 500 });
	}
}
