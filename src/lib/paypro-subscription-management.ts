import { parseSubscriptionDate } from "./subscription-date.ts";

function credentials() {
  const vendorAccountId = Number(process.env.PAYPRO_VENDOR_ACCOUNT_ID);
  const apiSecretKey = process.env.PAYPRO_API_SECRET_KEY?.trim();
  if (!Number.isSafeInteger(vendorAccountId) || vendorAccountId <= 0 || !apiSecretKey) throw new Error("PAYPRO_NOT_CONFIGURED");
  return { vendorAccountId, apiSecretKey };
}

// Only return sanitized state: PayPro responses echo our API secret in `request`.
export const payproSubscriptionManagement = {
  validate: credentials,
  async change(subscriptionId: number, action: "suspend" | "renew", reason: string) {
    const auth = credentials();
    const signal = AbortSignal.timeout(12000);
    async function request(method: string, extra: Record<string, unknown> = {}) {
      const response = await fetch(`https://store.payproglobal.com/api/Subscriptions/${method}`, {
        method: "POST", redirect: "error", cache: "no-store", signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, subscriptionId, ...extra }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.isSuccess !== true) throw new Error("PAYPRO_UNAVAILABLE");
      return data.response;
    }
    async function details() {
      const data = await request("GetSubscriptionDetails", { dateFormat: "a" });
      const status = typeof data?.status === "string" ? data.status.toLowerCase() : "";
      if (!["active", "suspended", "terminated", "finished"].includes(status)) throw new Error("PAYPRO_UNAVAILABLE");
      return { status, next_charge_date: parseSubscriptionDate(data.nextPayment)?.toISOString() ?? null };
    }
    let state = await details();
    // Reconcile retries after a lost response before making another billing call.
    if (action === "suspend" && state.status !== "active") return state;
    if (action === "renew" && state.status === "active") return state;
    if (action === "renew" && state.status !== "suspended") throw new Error("PAYPRO_CANNOT_RENEW");
    await request(action === "suspend" ? "Suspend" : "Renew", { reasonText: reason, ...(action === "suspend" ? { sendCustomerNotification: false } : {}) });
    state = await details();
    if (action === "suspend" ? state.status === "active" : state.status !== "active") throw new Error("PAYPRO_UNAVAILABLE");
    return state;
  },
};
