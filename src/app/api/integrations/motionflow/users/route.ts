import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/database/pool";
import { integrationAuthorized } from "@/lib/motionflow-integration-auth";
import { createMotionflowManagement } from "@/lib/motionflow-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const service = createMotionflowManagement(pool);
async function handle(req: NextRequest) {
  if (!integrationAuthorized(req.headers.get("authorization"), process.env.MOTIONFLOW_MANAGEMENT_SECRET)) return json({ error: "UNAUTHORIZED" }, 401);
  if (process.env.MOTIONFLOW_MANAGEMENT_ENABLED !== "true") return json({ error: "MANAGEMENT_DISABLED" }, 503);
  try {
    if (req.method === "GET") {
      const id = req.nextUrl.searchParams.get("user_id");
      if (id) {
        if (id.length > 128) return json({ error: "INVALID_INPUT" }, 400);
        const result = await service.detail(id);
        return result ? json(result) : json({ error: "NOT_FOUND" }, 404);
      }
      const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 200);
      const page = Number(req.nextUrl.searchParams.get("page") || 1);
      if (!Number.isSafeInteger(page) || page < 1 || page > 100000) return json({ error: "INVALID_INPUT" }, 400);
      return json(await service.list(q, page));
    }
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body) ||
      ["user_id", "actor", "action", "reason"].some(k => typeof body[k] !== "string") ||
      ["expires_at", "device_id", "plan_name", "request_id"].some(k => body[k] !== undefined && typeof body[k] !== "string") ||
      (body.subscription_id !== undefined && (!Number.isSafeInteger(body.subscription_id) || body.subscription_id <= 0))) return json({ error: "INVALID_INPUT" }, 400);
    return json(await service.change(body));
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const safe = ["NOT_FOUND", "INVALID_INPUT", "MANUAL_SUBSCRIPTION_REQUIRED", "SUBSCRIPTION_BUSY", "PAYPRO_NOT_CONFIGURED", "PAYPRO_CANNOT_RENEW", "PAYPRO_UNAVAILABLE"].includes(code) ? code : "MANAGEMENT_UNAVAILABLE";
    return json({ error: safe }, code === "NOT_FOUND" ? 404 : ["INVALID_INPUT", "MANUAL_SUBSCRIPTION_REQUIRED"].includes(code) ? 400 : code === "SUBSCRIPTION_BUSY" ? 409 : 503);
  }
}
export const GET = handle;
export const POST = handle;
