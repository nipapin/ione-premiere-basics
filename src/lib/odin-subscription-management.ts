import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { payproSubscriptionManagement } from "./paypro-subscription-management.ts";

type Input = { user_id: string; actor: string; action: string; reason: string; subscription_id?: number; expires_at?: string; plan_name?: string; request_id?: string };
export const subscriptionActions = ["subscription_issue", "subscription_update", "subscription_disable", "subscription_enable"];
const snapshot = (row: Record<string, unknown> | null) => row && Object.fromEntries([
  "id", "user_id", "subscription_id", "status", "order_item_name", "next_charge_date", "management_source", "management_disabled", "management_billing_state", "management_billing_action",
].map(key => [key, row[key]]));

export function createOdinSubscriptionManagement(pool: Pool, billing = payproSubscriptionManagement) {
  async function transaction<T>(work: (db: PoolClient) => Promise<T>) {
    const db = await pool.connect();
    try { await db.query("BEGIN"); const result = await work(db); await db.query("COMMIT"); return result; }
    catch (error) { await db.query("ROLLBACK"); throw error; }
    finally { db.release(); }
  }
  async function audit(db: PoolClient, input: Input, before: unknown, after: unknown, action = input.action) {
    await db.query(`INSERT INTO odin_motionflow_audit (user_id, actor, action, reason, before_state, after_state)
      VALUES ($1,$2,$3,$4,$5,$6)`, [input.user_id, input.actor, action, input.reason.trim(), JSON.stringify(before), JSON.stringify(after)]);
  }
  async function change(input: Input) {
    if (!input.user_id?.trim() || input.user_id.length > 128 || !input.actor?.trim() || input.actor.length > 254 || !input.reason?.trim() || input.reason.length > 500 || !subscriptionActions.includes(input.action)) throw new Error("INVALID_INPUT");
    const edits = ["subscription_issue", "subscription_update"].includes(input.action);
    if (edits && (!input.expires_at || !Number.isFinite(Date.parse(input.expires_at)) || Date.parse(input.expires_at) <= Date.now() || !input.plan_name?.trim() || input.plan_name.length > 200)) throw new Error("INVALID_INPUT");
    if (input.action !== "subscription_issue" && (!Number.isSafeInteger(input.subscription_id) || input.subscription_id! <= 0)) throw new Error("INVALID_INPUT");
    if (input.action === "subscription_issue" && (typeof input.request_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.request_id))) throw new Error("INVALID_INPUT");
    const pending = await transaction(async db => {
      const user = (await db.query("SELECT user_id, email FROM users WHERE user_id::text = $1 FOR UPDATE", [input.user_id])).rows[0];
      if (!user) throw new Error("NOT_FOUND");
      if (input.action === "subscription_issue") {
        const existing = (await db.query("SELECT * FROM subscriptions WHERE management_issue_key=$1", [input.request_id])).rows[0];
        if (existing) {
          if (String(existing.user_id) !== input.user_id || existing.order_item_name !== input.plan_name!.trim() || existing.next_charge_date !== new Date(input.expires_at!).toISOString()) throw new Error("INVALID_INPUT");
          return null;
        }
        const id = (await db.query("SELECT nextval('odin_managed_subscription_id') AS id")).rows[0].id;
        const after = (await db.query(`INSERT INTO subscriptions
          (id,user_id,subscription_id,status,invoice,is_trial,next_charge_date,quantity,next_quantity,customer_id,order_item_name,seats,management_source,management_issue_key)
          VALUES ($1,$2,$3,'active','',false,$4,1,1,0,$5,$6,'manual',$7) RETURNING *`,
          [id, input.user_id, -Number(id), new Date(input.expires_at!).toISOString(), input.plan_name!.trim(), [user.email], input.request_id])).rows[0];
        await audit(db, input, null, snapshot(after));
        return null;
      }
      // Invited users may see a subscription, but only its owner can manage it.
      const before = (await db.query("SELECT * FROM subscriptions WHERE id = $1 AND user_id::text = $2 FOR UPDATE", [input.subscription_id, input.user_id])).rows[0];
      if (!before) throw new Error("NOT_FOUND");
      if (before.management_billing_state === "pending" && new Date(before.management_operation_started_at).getTime() > Date.now() - 60000) throw new Error("SUBSCRIPTION_BUSY");
      if (input.action === "subscription_update") {
        if (before.management_source !== "manual") throw new Error("MANUAL_SUBSCRIPTION_REQUIRED");
        const after = (await db.query(`UPDATE subscriptions SET next_charge_date=$1,order_item_name=$2 WHERE id=$3 RETURNING *`,
          [new Date(input.expires_at!).toISOString(), input.plan_name!.trim(), before.id])).rows[0];
        await audit(db, input, snapshot(before), snapshot(after));
        return null;
      }
      const disabled = input.action === "subscription_disable";
      if (before.management_source === "manual") {
        const after = (await db.query(`UPDATE subscriptions SET management_disabled=$1,status=$2 WHERE id=$3 RETURNING *`, [disabled, disabled ? "cancelled" : "active", before.id])).rows[0];
        await audit(db, input, snapshot(before), snapshot(after));
        return null;
      }
      const remoteId = Number(before.subscription_id);
      if (!Number.isSafeInteger(remoteId) || remoteId <= 0) throw new Error("INVALID_INPUT");
      billing.validate();
      if (disabled && before.management_disabled && ["suspended", "finished", "terminated"].includes(before.management_billing_state)) return null;
      if (!disabled && !before.management_disabled && before.management_billing_state === "active") return null;
      const operation = randomUUID();
      const action = disabled ? "suspend" as const : "renew" as const;
      const after = (await db.query(`UPDATE subscriptions SET management_disabled=true,management_billing_state='pending',
        management_billing_action=$1,management_operation_id=$2,management_operation_started_at=NOW() WHERE id=$3 RETURNING *`, [action, operation, before.id])).rows[0];
      await audit(db, input, snapshot(before), snapshot(after));
      return { id: before.id, remoteId, operation, action };
    });
    if (!pending) return { ok: true };
    // The pending operation and access block are durable before contacting PayPro.
    // On a crash, retry reconciles the remote status rather than charging twice.
    try {
      const result = await billing.change(pending.remoteId, pending.action, input.reason);
      await transaction(async db => {
        const before = (await db.query("SELECT * FROM subscriptions WHERE id=$1 AND management_operation_id=$2 FOR UPDATE", [pending.id, pending.operation])).rows[0];
        if (!before) throw new Error("SUBSCRIPTION_BUSY");
        const after = (await db.query(`UPDATE subscriptions SET management_disabled=$1,management_billing_state=$2,status=$3,
          next_charge_date=COALESCE($4,next_charge_date) WHERE id=$5 RETURNING *`,
          [pending.action === "suspend", result.status, pending.action === "renew" ? "active" : result.status === "suspended" ? "on-hold" : "cancelled", pending.action === "renew" ? result.next_charge_date : null, pending.id])).rows[0];
        await audit(db, input, snapshot(before), snapshot(after), "subscription_billing_confirmed");
      });
      return { ok: true };
    } catch (error) {
      await transaction(async db => {
        const before = (await db.query("SELECT * FROM subscriptions WHERE id=$1 AND management_operation_id=$2 FOR UPDATE", [pending.id, pending.operation])).rows[0];
        if (!before) return;
        const after = (await db.query("UPDATE subscriptions SET management_disabled=true,management_billing_state='failed' WHERE id=$1 RETURNING *", [pending.id])).rows[0];
        await audit(db, input, snapshot(before), snapshot(after), "subscription_billing_failed");
      });
      const code = error instanceof Error ? error.message : "";
      throw new Error(["PAYPRO_NOT_CONFIGURED", "PAYPRO_CANNOT_RENEW", "SUBSCRIPTION_BUSY"].includes(code) ? code : "PAYPRO_UNAVAILABLE");
    }
  }
  return { change };
}
