import "server-only";
import { createHash } from "node:crypto";
import type { Pool } from "pg";
import { verifyPayproSignature } from "@/lib/paypro-signature";

const plans: Record<string, string> = {"111867": "Monthly", "113886": "Yearly", "113887": "Lifetime"};
const confirmed = new Set(["OrderCharged", "SubscriptionChargeSucceed", "TrialCharge"]);
const revoked = new Set(["OrderRefunded", "OrderChargedBack", "SubscriptionChargeFailed", "SubscriptionSuspended", "SubscriptionTerminated", "SubscriptionFinished"]);
const testAccessMs = 24 * 60 * 60 * 1000;

/** Signed sandbox IPNs grant bounded local access; no sales or external events. */
export async function recordPayproTestPayment(fields: Record<string, string>, pool: Pool, now = new Date()) {
 if (fields.TEST_MODE !== "1") throw new Error("INVALID_TEST_ORDER");
 verifyPayproSignature(fields);
 const event = fields.IPN_TYPE_NAME;
 if (!confirmed.has(event) && !revoked.has(event)) return {ignored: true};
 const email = fields.CUSTOMER_EMAIL?.trim().toLowerCase();
 if (!email || !plans[fields.PRODUCT_ID] || !/^\d+$/.test(fields.ORDER_ID || "") || !/^\d+$/.test(fields.ORDER_ITEM_ID || "")) throw new Error("INVALID_TEST_ORDER");
 const custom = Object.fromEntries((fields.ORDER_CUSTOM_FIELDS || "").split(",").filter(value => value.includes("=")).map(value => {
  const i = value.indexOf("="); return [value.slice(0, i).trim(), value.slice(i + 1).trim()];
 }));
 const checkout = custom["x-odin-checkout-id"];
 if (checkout && !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(checkout)) throw new Error("INVALID_TEST_ORDER");
 // PayPro can use zero IDs in test mode. A checkout UUID distinguishes repeat tests.
 // Old test checkouts without a UUID deduplicate by account, product and provider IDs.
 const key = createHash("sha256").update(JSON.stringify([email, fields.PRODUCT_ID, checkout || `${fields.ORDER_ID}:${fields.ORDER_ITEM_ID}`])).digest("hex");
 const db = await pool.connect();
 try {
  await db.query("BEGIN");
  const user = (await db.query("SELECT user_id,email FROM users WHERE lower(email)=$1 FOR UPDATE", [email])).rows[0];
  if (!user) throw new Error("TEST_ACCOUNT_NOT_FOUND");
  const existing = (await db.query("SELECT * FROM subscriptions WHERE test_order_key=$1 FOR UPDATE", [key])).rows[0];
  if (existing && String(existing.user_id) !== String(user.user_id)) throw new Error("INVALID_TEST_ORDER");
  if (!existing) {
   const id = (await db.query("SELECT nextval(COALESCE(pg_get_serial_sequence('subscriptions','id'),'odin_managed_subscription_id')) AS id")).rows[0].id;
   const active = confirmed.has(event);
   await db.query(`INSERT INTO subscriptions
    (id,user_id,order_id,subscription_id,status,invoice,is_trial,next_charge_date,quantity,next_quantity,customer_id,order_item_name,seats,product_id,affilate,management_source,management_disabled,is_test,test_order_key)
    OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$3,$4,'',false,$5,1,1,0,$6,$7,$8,NULL,'manual',$9,true,$10)`,
    [id, user.user_id, -Number(id), active ? "active" : "cancelled", new Date(now.getTime() + (active ? testAccessMs : 0)).toISOString(), `[TEST] Odin Pro ${plans[fields.PRODUCT_ID]}`, [user.email], fields.PRODUCT_ID, !active, key]);
  } else if (revoked.has(event)) {
   await db.query("UPDATE subscriptions SET status='cancelled',management_disabled=true,next_charge_date=$1 WHERE id=$2 AND is_test=true", [now.toISOString(), existing.id]);
  }
  // Retries and late charge notifications never extend or restore cancelled test access.
  await db.query("COMMIT");
  return {test: true};
 } catch (error) {
  await db.query("ROLLBACK");
  throw error;
 } finally {db.release();}
}
