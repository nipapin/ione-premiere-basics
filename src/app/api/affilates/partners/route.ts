import { query } from "@/app/database/postgre";
import { validateSession } from "@/lib/session";
import { validateCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
	try {
		const session = await validateSession();
		if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
		const user = (await query("SELECT is_admin FROM users WHERE user_id=$1", [session.user_id]))[0];
		if (!user?.is_admin) return Response.json({ error: "Forbidden" }, { status: 403 });
		const body = await request.json().catch(() => null);
		if (!body || typeof body.csrfToken !== "string" || !(await validateCsrfToken(body.csrfToken))) return Response.json({ error: "Invalid security token" }, { status: 403 });
		if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 80) return Response.json({ error: "Enter a name up to 80 characters" }, { status: 400 });
		const partner = (await query("INSERT INTO odin_affiliate_partners(name) VALUES($1) RETURNING id,name", [body.name.trim()]))[0];
		return Response.json(partner, { status: 201 });
	} catch {
		return Response.json({ error: "Unable to save partner. Please try again." }, { status: 500 });
	}
}
