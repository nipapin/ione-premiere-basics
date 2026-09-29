import { NextRequest, NextResponse } from "next/server";
import { cepAuth } from "@/lib/cep-service";
import { CEP_CLIENT, normalizeCode } from "@/lib/cep-auth";
import { validateSession } from "@/lib/session";
import { odinCatalog, odinPackUrl, odinDiffUrl } from "@/lib/cep-market";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const fail = (message: string, status = 400) => json({ error: message, message }, status);

async function handle(req: NextRequest, context: Context) {
  const route = (await context.params).path.join("/");
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim().slice(0, 128);
  if (route.startsWith("auth/")) {
    const start = route === "auth/device";
    if (!await cepAuth.rateLimit(ip, start ? "start" : "poll", start ? 10 : 180, start ? 900 : 300)) {
      return json({ error: "RATE_LIMITED", message: "Too many requests. Please try again shortly." }, 429);
    }
  }
  const raw = req.method === "POST" ? await req.json().catch(() => null) : {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fail("Invalid request body");
  const body = raw as Record<string, unknown>;
  const client = body.client ?? req.nextUrl.searchParams.get("client");
  if (client && client !== CEP_CLIENT) return fail("Unknown CEP client");

  if (route === "auth/device" && req.method === "POST") {
    if (body.client !== CEP_CLIENT || typeof body.usp !== "string" || !body.usp.trim() || body.usp.length > 4096) return fail("Invalid client or device fingerprint");
    const device: Record<string, string> = {};
    if (body.device && typeof body.device === "object") {
      for (const key of ["user", "os", "mac"]) {
        const value = (body.device as Record<string, unknown>)[key];
        if (typeof value === "string") device[key] = value.slice(0, 256);
      }
    }
    const session = await cepAuth.start({ usp: body.usp, device, ip });
    const url = new URL("/cep/login", process.env.NEXT_PUBLIC_APP_URL || "https://odin-pro.com");
    url.search = new URLSearchParams({ code: session.code, client: CEP_CLIENT }).toString();
    return json({ ...session, verification_url: url.toString() });
  }
  if (route === "auth/confirm") {
    // Cookie-authenticated consent must come from this website, never a CEP origin.
    if (req.method === "POST") {
      const expectedOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL || req.url).origin;
      if (req.headers.get("origin") !== expectedOrigin) return fail("Invalid request origin", 403);
    }
    const user = await validateSession();
    if (!user) return fail("Sign in first", 401);
    const code = normalizeCode(req.method === "GET" ? req.nextUrl.searchParams.get("code") : body.code);
    if (!code) return fail("Invalid code");
    if (req.method === "GET") {
      const info = await cepAuth.info(code);
      return info ? json(info) : fail("Code not found", 404);
    }
    if (body.action !== "approve" && body.action !== "deny") return fail("Invalid action");
    const result = await cepAuth.confirm(code, String(user.user_id), body.action);
    return result ? json(result) : fail("Code expired or already confirmed", 409);
  }
  if (["auth/token", "auth/replace-device"].includes(route) && req.method === "POST") {
    const code = normalizeCode(body.code);
    if (!code) return json({ status: "expired", message: "Invalid code" }, 400);
    const replace = route === "auth/replace-device";
    if (replace && (typeof body.revoke_device_id !== "string" || body.revoke_device_id.length > 64)) return fail("Invalid device");
    return json(await cepAuth.claim(code, body.device_code, replace ? body.revoke_device_id as string : undefined));
  }
  if ((["market", "market/download"].includes(route) && req.method === "GET") || (route === "market/diff" && req.method === "POST")) {
    const identity = await cepAuth.authenticate(req.headers.get("authorization"));
    if (!identity) return fail("UNAUTHORIZED", 401);
    const profile = await cepAuth.profile(identity);
    if (!profile) return fail("UNAUTHORIZED", 401);
    if (!await cepAuth.rateLimit(identity.user_id, route, 60, 300)) return fail("RATE_LIMITED", 429);
    const host = req.nextUrl.searchParams.get("host");
    if (host && !["AE", "PR"].includes(host)) return fail("Invalid host");
    const catalog = await odinCatalog(profile.subscription.active, route === "market" ? host : null);
    if (route === "market") return json({ ...catalog, Packages: catalog.Packages.map(pack => ({
      ...pack, install_url: new URL(pack.install_url, process.env.NEXT_PUBLIC_APP_URL || "https://odin-pro.com").toString(),
    })) });
    if (!profile.subscription.active) return fail("SUBSCRIPTION_REQUIRED", 403);
    const packId = route === "market/diff" ? String(body.pack_id) : req.nextUrl.searchParams.get("pack_id");
    const pack = catalog.Packages.find(pack => String(pack.id) === packId);
    if (!pack) return fail("Pack not found", 404);
    if (route === "market/diff") {
      if (!body.manifest || typeof body.manifest !== "object" || JSON.stringify(body.manifest).length > 8 * 1024 * 1024) return fail("Invalid manifest");
      const url = await odinDiffUrl(pack.primary_type, body.manifest);
      if (!url) return fail("NO_DIFF_SOURCE", 409);
      return new NextResponse(null, { status: 303, headers: { Location: url, "Cache-Control": "no-store" } });
    }
    return new NextResponse(null, { status: 302, headers: {
      Location: await odinPackUrl(pack.primary_type), "Cache-Control": "no-store",
    } });
  }
  if ((route === "me" && req.method === "GET") || (route === "devices/revoke" && req.method === "POST")) {
    const identity = await cepAuth.authenticate(req.headers.get("authorization"));
    if (!identity) return fail("UNAUTHORIZED", 401);
    if (route === "me") {
      const profile = await cepAuth.profile(identity);
      return profile ? json(profile) : fail("UNAUTHORIZED", 401);
    }
    if (typeof body.device_id !== "string" || body.device_id.length > 64) return fail("Invalid device");
    return await cepAuth.revoke(identity.user_id, body.device_id) ? json({ ok: true }) : fail("Device not found", 404);
  }
  return fail("Endpoint not available", 404);
}

function cors(req: NextRequest, response: NextResponse) {
  const origin = req.headers.get("origin");
  if (origin && (origin === "null" || /^http:\/\/(localhost|127\.0\.0\.1):(4020|5020)$/.test(origin))) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Vary", "Origin");
  }
  return response;
}
async function dispatch(req: NextRequest, context: Context) {
  try { return cors(req, await handle(req, context)); }
  catch (error) {
    console.error("[odin-cep] Request failed", error instanceof Error ? error.message : "Unknown error");
    return cors(req, fail("Could not complete the request. Please try again.", 500));
  }
}
export const GET = dispatch;
export const POST = dispatch;
export async function OPTIONS(req: NextRequest) { return cors(req, new NextResponse(null, { status: 204 })); }
