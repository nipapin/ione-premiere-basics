import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/subscription-date";
import { validateSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || (body.user_id && body.user_id !== session.user_id) || (body.reason !== undefined && (typeof body.reason !== "string" || body.reason.length > 500))) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const subscription = (await query("SELECT * FROM subscriptions WHERE user_id=$1 ORDER BY id DESC", [session.user_id])).find((sub: any) => isSubscriptionActive(sub));
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (subscription.management_source === "manual") return NextResponse.json({ error: "MANUAL_SUBSCRIPTION_NO_BILLING" }, { status: 400 });
  const subscriptionId = Number(subscription.subscription_id);
  const vendorAccountId = Number(process.env.PAYPRO_VENDOR_ACCOUNT_ID);
  if (!Number.isSafeInteger(subscriptionId) || subscriptionId <= 0 || !Number.isSafeInteger(vendorAccountId) || vendorAccountId <= 0 || !process.env.PAYPRO_API_SECRET_KEY) return NextResponse.json({ error: "PAYPRO_NOT_CONFIGURED" }, { status: 503 });
  try {
    const response = await fetch("https://store.payproglobal.com/api/Subscriptions/Finish", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(12000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sendCustomerNotification: true, reasonText: body.reason?.trim() || "Cancelled by subscription owner", subscriptionId, vendorAccountId, apiSecretKey: process.env.PAYPRO_API_SECRET_KEY }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.isSuccess !== true) return NextResponse.json({ error: "PAYPRO_UNAVAILABLE" }, { status: 502 });
    await query("UPDATE subscriptions SET finished=true WHERE id=$1", [subscription.id]);
    return NextResponse.json({ message: "Subscription finished" });
  } catch {
    return NextResponse.json({ error: "PAYPRO_UNAVAILABLE" }, { status: 502 });
  }
}
