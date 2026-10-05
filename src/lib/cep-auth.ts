import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { effectiveCepAccess } from "./motionflow-management.ts";
import { isSubscriptionActive, parseSubscriptionDate } from "./subscription-date.ts";

export const CEP_CLIENT = "odin-cep";
export const CODE_TTL = 300;
export const POLL_INTERVAL = 3;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export const normalizeCode = (value: unknown) => typeof value === "string" && /^[A-F0-9]{8}$/.test(value.trim().toUpperCase()) ? value.trim().toUpperCase() : null;
const validSecret = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const expired = () => ({ status: "expired", message: "Code expired or already used. Restart sign-in in the panel." });

export function createCepAuth(pool: Pool, deviceLimit = 3) {
  async function transaction<T>(work: (db: PoolClient) => Promise<T>): Promise<T> {
    const db = await pool.connect();
    try {
      await db.query("BEGIN");
      const result = await work(db);
      await db.query("COMMIT");
      return result;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    } finally { db.release(); }
  }

  async function rateLimit(ip: string, action: string, max: number, seconds: number) {
    const bucket = Math.floor(Date.now() / (seconds * 1000));
    const key = hash(`${ip}:${action}:${bucket}`);
    const result = await pool.query(`INSERT INTO odin_cep_rate_limits (key, hits, expires_at)
      VALUES ($1, 1, NOW() + $2 * INTERVAL '1 second')
      ON CONFLICT (key) DO UPDATE SET hits = odin_cep_rate_limits.hits + 1 RETURNING hits`, [key, seconds]);
    return result.rows[0].hits <= max;
  }

  async function start(input: { usp: string; device: Record<string, string>; ip: string }) {
    // Only hashes of panel secrets and access tokens are persisted.
    await pool.query("DELETE FROM odin_cep_auth_sessions WHERE expires_at < NOW()");
    await pool.query("DELETE FROM odin_cep_rate_limits WHERE expires_at < NOW()");
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomBytes(4).toString("hex").toUpperCase();
      const deviceCode = randomBytes(32).toString("hex");
      const inserted = await pool.query(`INSERT INTO odin_cep_auth_sessions
        (code, secret_hash, fingerprint, device, ip, expires_at)
        VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '5 minutes')
        ON CONFLICT (code) DO NOTHING RETURNING code`,
        [code, hash(deviceCode), hash(input.usp), JSON.stringify(input.device), input.ip]);
      if (inserted.rowCount) return { code, device_code: deviceCode, interval: POLL_INTERVAL, expires_in: CODE_TTL };
    }
    throw new Error("Could not allocate login code");
  }

  async function info(code: string) {
    const { rows } = await pool.query(`SELECT code, status, device, expires_at <= NOW() AS expired
      FROM odin_cep_auth_sessions WHERE code = $1`, [code]);
    const row = rows[0];
    return row ? { code, status: row.expired ? "expired" : row.status, device: row.device, client: CEP_CLIENT } : null;
  }

  async function confirm(code: string, userId: string, action: "approve" | "deny") {
    const { rows } = await pool.query(`UPDATE odin_cep_auth_sessions
      SET status = $2, user_id = $3
      WHERE code = $1 AND status = 'pending' AND expires_at > NOW() RETURNING status`,
      [code, action === "deny" ? "denied" : "approved", userId]);
    return rows[0] ? { ok: true, status: rows[0].status } : null;
  }

  async function devices(userId: string, db: Pool | PoolClient = pool) {
    const { rows } = await db.query(`SELECT id, ip, device::text AS user_fingerprint,
      device->>'user' AS name, last_seen_at FROM odin_cep_devices
      WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW() ORDER BY last_seen_at DESC`, [userId]);
    return rows;
  }

  async function claim(code: string, secret: unknown, revokeDeviceId?: string) {
    if (!validSecret(secret)) return expired();
    return transaction(async (db) => {
      const { rows } = await db.query(`SELECT *, expires_at <= NOW() AS expired
        FROM odin_cep_auth_sessions WHERE code = $1 FOR UPDATE`, [code]);
      const session = rows[0];
      if (!session || session.expired || !timingSafeEqual(Buffer.from(session.secret_hash, "hex"), Buffer.from(hash(secret), "hex"))) return expired();
      if (session.status === "pending") return { status: "pending" };
      if (session.status === "denied") return { status: "denied" };
      if (!["approved", "device_limit"].includes(session.status) || !session.user_id) return expired();
      // Serialize all device claims for this account, including different login codes.
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`odin-cep:${session.user_id}`]);
      const userResult = await db.query("SELECT user_id::text AS id, email, name FROM users WHERE user_id::text = $1", [session.user_id]);
      const user = userResult.rows[0];
      if (!user) return expired();
      const existing = await db.query(`SELECT id FROM odin_cep_devices
        WHERE user_id = $1 AND fingerprint = $2 AND revoked_at IS NULL AND expires_at > NOW()`, [session.user_id, session.fingerprint]);
      if (revokeDeviceId) {
        if (session.status !== "device_limit") return expired();
        const removed = await db.query(`UPDATE odin_cep_devices SET revoked_at = NOW()
          WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL RETURNING id`, [revokeDeviceId, session.user_id]);
        if (!removed.rowCount) return { status: "expired", message: "Device not found in this account. Restart sign-in." };
      }
      const currentDevices = await devices(session.user_id, db);
      if (!existing.rowCount && currentDevices.length >= deviceLimit) {
        await db.query("UPDATE odin_cep_auth_sessions SET status = 'device_limit' WHERE code = $1", [code]);
        return { status: "device_limit", device_limit: deviceLimit, devices: currentDevices };
      }
      const token = `odincep_${randomBytes(32).toString("hex")}`;
      if (existing.rowCount) {
        await db.query(`UPDATE odin_cep_devices SET token_hash = $2, device = $3, ip = $4,
          last_seen_at = NOW(), expires_at = NOW() + INTERVAL '30 days' WHERE id = $1`,
          [existing.rows[0].id, hash(token), session.device, session.ip]);
      } else {
        await db.query(`INSERT INTO odin_cep_devices (id, user_id, fingerprint, token_hash, device, ip)
          VALUES ($1, $2, $3, $4, $5, $6)`, [randomUUID(), session.user_id, session.fingerprint, hash(token), session.device, session.ip]);
      }
      await db.query("UPDATE odin_cep_auth_sessions SET status = 'complete', claimed_at = NOW() WHERE code = $1", [code]);
      return { status: "complete", token, user };
    });
  }

  async function authenticate(authorization: string | null) {
    const token = authorization?.match(/^Bearer (odincep_[a-f0-9]{64})$/)?.[1];
    if (!token) return null;
    const { rows } = await pool.query(`UPDATE odin_cep_devices SET last_seen_at = NOW()
      WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() RETURNING id, user_id`, [hash(token)]);
    return rows[0] as { id: string; user_id: string } | undefined ?? null;
  }

  async function revoke(userId: string, deviceId: string) {
    const result = await pool.query(`UPDATE odin_cep_devices SET revoked_at = NOW()
      WHERE user_id = $1 AND id = $2 AND revoked_at IS NULL RETURNING id`, [userId, deviceId]);
    return Boolean(result.rowCount);
  }

  async function profile(identity: { id: string; user_id: string }) {
    const { rows } = await pool.query("SELECT user_id::text AS id, email, name FROM users WHERE user_id::text = $1", [identity.user_id]);
    const user = rows[0];
    if (!user) return null;
    // Match the site's current entitlement rule, including invited subscription seats.
    const subscriptions = await pool.query(`SELECT status, order_item_name, next_charge_date, management_disabled FROM subscriptions
      WHERE user_id::text = $1 OR $2 = ANY(seats)`, [user.id, user.email]);
    const subscription = subscriptions.rows.find(sub => isSubscriptionActive(sub));
    const override = process.env.MOTIONFLOW_MANAGEMENT_ENABLED === "true"
      ? (await pool.query("SELECT mode, expires_at FROM odin_motionflow_access WHERE user_id = $1", [user.id])).rows[0]
      : undefined;
    const active = effectiveCepAccess(Boolean(subscription), override);
    const manual = override?.mode === "allow" && new Date(override.expires_at).getTime() > Date.now();
    return {
      user, tier: active ? "subscribed" : "free",
      subscription: { active, plan: active ? (subscription?.order_item_name ?? "Odin Pro — manual access") : null,
        status: !active ? null : subscription?.status ?? (manual ? "manual" : null),
        renews_at: !active ? null : parseSubscriptionDate(subscription?.next_charge_date)?.toISOString() ?? (manual ? override.expires_at : null) },
      purchases: [], entitlements: { free_pack_slots: 0, ai_generations_limit: active ? 100 : 0 },
      subscribe_url: "https://odin-pro.com/pricing", manage_subscription_url: "https://odin-pro.com/account",
      devices: (await devices(user.id)).map((device) => ({ ...device, current: device.id === identity.id })),
    };
  }
  return { start, info, confirm, claim, authenticate, revoke, profile, rateLimit };
}
