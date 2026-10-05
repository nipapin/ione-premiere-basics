import type { Pool } from "pg";
import { parseSubscriptionDate } from "./subscription-date.ts";

export function effectiveCepAccess(
  subscribed: boolean,
  override: { mode: string; expires_at: string | Date | null } | undefined,
  now = Date.now(),
): boolean {
  if (!override) return subscribed;
  if (override.mode === "deny") return false;
  return new Date(override.expires_at ?? 0).getTime() > now || subscribed;
}

export function createMotionflowManagement(pool: Pool) {
  async function detail(userId: string) {
    const user = (await pool.query(`SELECT user_id::text AS id, email, name, lastname FROM users WHERE user_id::text = $1`, [userId])).rows[0];
    if (!user) return null;
    const subscriptions = (await pool.query(`SELECT id, user_id::text AS owner_id, status, order_item_name,
      next_charge_date, quantity FROM subscriptions WHERE user_id::text = $1 OR $2 = ANY(seats) ORDER BY id DESC`, [userId, user.email])).rows;
    const devices = (await pool.query(`SELECT id, device->>'user' AS name, device->>'os' AS os,
      last_seen_at, expires_at FROM odin_cep_devices
      WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW() ORDER BY last_seen_at DESC`, [userId])).rows;
    const override = (await pool.query(`SELECT mode, expires_at, updated_at FROM odin_motionflow_access WHERE user_id = $1`, [userId])).rows[0] ?? null;
    const audit = (await pool.query(`SELECT id, actor, action, reason, created_at FROM odin_motionflow_audit
      WHERE user_id = $1 ORDER BY id DESC LIMIT 20`, [userId])).rows;
    const normalizedSubscriptions = subscriptions.map(s => ({ ...s, next_charge_date: parseSubscriptionDate(s.next_charge_date)?.toISOString() ?? null }));
    const subscribed = normalizedSubscriptions.some(s => s.next_charge_date !== null && Date.parse(s.next_charge_date) > Date.now());
    return { user, subscriptions: normalizedSubscriptions, devices, override, audit, subscription_active: subscribed,
      extension_access: effectiveCepAccess(subscribed, override ?? undefined) };
  }

  async function list(q: string, page: number) {
    const search = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    const where = `($1 = '' OR email ILIKE $2 OR name ILIKE $2 OR lastname ILIKE $2 OR user_id::text = $1)`;
    const total = Number((await pool.query(`SELECT COUNT(*) AS total FROM users WHERE ${where}`, [q, search])).rows[0].total);
    const users = (await pool.query(`SELECT user_id::text AS id, email, name, lastname FROM users
      WHERE ${where} ORDER BY email, user_id LIMIT 25 OFFSET $3`, [q, search, (page - 1) * 25])).rows;
    return { users, total, page, page_size: 25 };
  }

  async function change(input: { user_id: string; actor: string; action: string; reason: string; expires_at?: string; device_id?: string }) {
    if (!input.user_id || input.user_id.length > 128 || !input.actor?.trim() || input.actor.length > 254 || !input.reason?.trim() || input.reason.length > 500) throw new Error("INVALID_INPUT");
    if (!["grant", "revoke", "reset", "revoke_device"].includes(input.action)) throw new Error("INVALID_INPUT");
    if (input.action === "grant" && (!input.expires_at || !Number.isFinite(Date.parse(input.expires_at)) || Date.parse(input.expires_at) <= Date.now())) throw new Error("INVALID_INPUT");
    if (input.action === "revoke_device" && (!input.device_id || input.device_id.length > 128)) throw new Error("INVALID_INPUT");
    const db = await pool.connect();
    try {
      await db.query("BEGIN");
      const user = await db.query("SELECT user_id FROM users WHERE user_id::text = $1 FOR UPDATE", [input.user_id]);
      if (!user.rows.length) throw new Error("NOT_FOUND");
      let before: unknown;
      let after: unknown;
      if (input.action === "revoke_device") {
        before = (await db.query(`SELECT id, revoked_at FROM odin_cep_devices WHERE id = $1 AND user_id = $2 FOR UPDATE`, [input.device_id, input.user_id])).rows[0];
        if (!before) throw new Error("NOT_FOUND");
        after = (await db.query(`UPDATE odin_cep_devices SET revoked_at = COALESCE(revoked_at, NOW()) WHERE id = $1 AND user_id = $2 RETURNING id, revoked_at`, [input.device_id, input.user_id])).rows[0];
      } else {
        before = (await db.query("SELECT mode, expires_at FROM odin_motionflow_access WHERE user_id = $1", [input.user_id])).rows[0] ?? null;
        if (input.action === "reset") {
          await db.query("DELETE FROM odin_motionflow_access WHERE user_id = $1", [input.user_id]);
          after = null;
        } else {
          after = (await db.query(`INSERT INTO odin_motionflow_access (user_id, mode, expires_at) VALUES ($1, $2, $3)
            ON CONFLICT (user_id) DO UPDATE SET mode = EXCLUDED.mode, expires_at = EXCLUDED.expires_at, updated_at = NOW()
            RETURNING mode, expires_at`, [input.user_id, input.action === "grant" ? "allow" : "deny", input.action === "grant" ? new Date(input.expires_at!).toISOString() : null])).rows[0];
        }
      }
      await db.query(`INSERT INTO odin_motionflow_audit (user_id, actor, action, reason, before_state, after_state)
        VALUES ($1, $2, $3, $4, $5, $6)`, [input.user_id, input.actor, input.action, input.reason.trim(), JSON.stringify(before), JSON.stringify(after)]);
      await db.query("COMMIT");
    } catch (error) { await db.query("ROLLBACK"); throw error; }
    finally { db.release(); }
    return { ok: true };
  }
  return { list, detail, change };
}
