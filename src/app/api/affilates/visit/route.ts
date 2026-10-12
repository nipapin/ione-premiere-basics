import { query } from "@/app/database/postgre";

export async function POST(request: Request) {
	const headers = { "Cache-Control": "no-store" };
	let origin: URL;
	try { origin = new URL(request.headers.get("origin") || ""); } catch { return new Response(null, { status: 403, headers }); }
	// Next's internal URL can use localhost behind a proxy; compare the browser's host.
	if (!["http:", "https:"].includes(origin.protocol) || origin.host !== (request.headers.get("host") || new URL(request.url).host)) return new Response(null, { status: 403, headers });
	if (/bot|crawler|spider|preview/i.test(request.headers.get("user-agent") || "")) return new Response(null, { status: 204, headers });
	const body = await request.json().catch(() => null);
	if (!body || typeof body.code !== "string" || body.code.length > 200 || typeof body.visitId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.visitId)) return new Response(null, { status: 400, headers });
	try {
		await query(`INSERT INTO odin_referral_visits(code,visit_id)
			SELECT code,$2::uuid FROM odin_affiliate_links WHERE code=$1
			ON CONFLICT DO NOTHING`, [body.code, body.visitId]);
		return new Response(null, { status: 204, headers });
	} catch {
		return new Response(null, { status: 503, headers });
	}
}
