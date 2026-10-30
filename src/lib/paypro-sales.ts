import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { query } from "@/app/database/postgre";
import { normalizePayproOrder, saveSales } from "../../db/paypro-sales.mjs";

export async function recordPayproSale(fields: Record<string, string>) {
	if (fields.TEST_MODE === "1") return null;
	const key = process.env.PAYPRO_VALIDATION_KEY;
	const signature = fields.SIGNATURE;
	if (!key || !signature || !/^[a-f0-9]{64}$/i.test(signature)) throw new Error("Invalid PayPro sales signature");
	const expected = createHash("sha256").update([fields.ORDER_ID, fields.ORDER_STATUS, fields.ORDER_TOTAL_AMOUNT, fields.CUSTOMER_EMAIL, key, fields.TEST_MODE, fields.IPN_TYPE_NAME].join("")).digest();
	if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) throw new Error("Invalid PayPro sales signature");
	// Non-financial IPNs can also change access and must be authenticated before
	// the entitlement worker is allowed to infer a cancellation from them.
	if (!["OrderCharged", "SubscriptionChargeSucceed", "TrialCharge", "OrderRefunded", "OrderPartiallyRefunded", "OrderChargedBack", "OrderChargebackIsWon", "OrderChargedBackWon"].includes(fields.IPN_TYPE_NAME)) return null;
	const orderId = Number(fields.ORDER_ID);
	if (!Number.isSafeInteger(orderId) || orderId <= 0) throw new Error("Invalid PayPro order ID");
	// Resolve financial amounts through authenticated PayPro API; IPN amounts are
	// never used as an unverifiable replacement for actual order details.
	const response = await fetch("https://store.payproglobal.com/api/Orders/GetOrderDetails", {
		method: "POST", redirect: "error", signal: AbortSignal.timeout(15000), headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ orderId, dateFormat: "a", vendorAccountId: Number(process.env.PAYPRO_VENDOR_ACCOUNT_ID), apiSecretKey: process.env.PAYPRO_API_SECRET_KEY }),
	});
	const data = await response.json();
	if (!response.ok || data.isSuccess !== true || Number(data.response?.orderId) !== orderId) throw new Error("Unable to verify PayPro sales order");
	const attribution = await query("SELECT subscription_id,affilate FROM subscriptions WHERE nullif(affilate,'') IS NOT NULL");
	const refs = new Map<string, string>(attribution.map((row: { subscription_id: string; affilate: string }) => [String(row.subscription_id), row.affilate]));
	const rows = normalizePayproOrder(data.response, refs);
	await saveSales({ query }, rows, "paypro_webhook");
	return { order: data.response, rows };
}
