import pg from 'pg';
import { createHmac, randomUUID } from 'node:crypto';
import { databaseConfig } from './config.mjs';
import { reconcileCinecomAccess } from './cinecom.mjs';

const endpoint = 'https://cinecom.net/webhooks/odin';

export async function deliverCinecomEvents(pool, { secret, send = fetch, now = Date.now, random = Math.random, limit = 20 }) {
    if (!secret) throw new Error('Cinecom delivery secret is missing');
    for (let index = 0; index < limit; index++) {
      const token = randomUUID();
      const event = (await pool.query(`WITH candidate AS (
        SELECT e.id FROM odin_cinecom_events e WHERE e.delivered_at IS NULL AND e.next_attempt_at <= NOW()
          AND (e.locked_until IS NULL OR e.locked_until < NOW())
          AND NOT EXISTS (SELECT 1 FROM odin_cinecom_events previous WHERE previous.user_id=e.user_id
            AND previous.sequence < e.sequence AND previous.delivered_at IS NULL)
        ORDER BY e.sequence LIMIT 1 FOR UPDATE OF e SKIP LOCKED
      ) UPDATE odin_cinecom_events e SET locked_until=NOW()+INTERVAL '1 minute',lock_token=$1,attempts=attempts+1
        FROM candidate WHERE e.id=candidate.id RETURNING e.*`, [token])).rows[0];
      if (!event) break;
      let status = null;
      try {
        const t = Math.floor(now() / 1000).toString();
        const signature = createHmac('sha256', secret).update(`${t}.${event.body}`).digest('hex');
        const response = await send(endpoint, { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000),
          headers: { 'Content-Type': 'application/json', 'Odin-Signature': `t=${t},v1=${signature}` }, body: event.body });
        status = response.status;
        await response.body?.cancel();
      } catch { /* Timeout/network failures follow the same durable retry path. */ }
      if (status === 200) {
        await pool.query(`UPDATE odin_cinecom_events SET delivered_at=NOW(),last_status=200,locked_until=NULL,lock_token=NULL
          WHERE id=$1 AND lock_token=$2`, [event.id, token]);
      } else {
        const seconds = Math.min(21600, 30 * 2 ** Math.min(event.attempts - 1, 10)) + Math.floor(random() * 15);
        await pool.query(`UPDATE odin_cinecom_events SET next_attempt_at=NOW()+($1 * INTERVAL '1 second'),last_status=$2,locked_until=NULL,lock_token=NULL
          WHERE id=$3 AND lock_token=$4`, [seconds, status, event.id, token]);
      }
    }
}

export function startCinecomWorker() {
  // Local development does not contact the partner. Production starts the
  // worker with the web server, so no separate scheduler needs provisioning.
  if (process.env.NODE_ENV !== 'production' || process.env.CINECOM_WEBHOOK_ENABLED === 'false') return;
  if (!process.env.CINECOM_WEBHOOK_SECRET) {
    console.warn('[cinecom] Delivery is paused: CINECOM_WEBHOOK_SECRET is missing.');
    return;
  }
  const pool = new pg.Pool({ ...databaseConfig(process.env), max: 2, connectionTimeoutMillis: 5000, query_timeout: 15000 });
  pool.on('error', () => console.error('[cinecom] Database connection interrupted; queued events are retained.'));
  let busy = false;

  async function tick() {
    if (busy) return;
    busy = true;
    try {
      const db = await pool.connect();
      try {
        await db.query('BEGIN');
        await reconcileCinecomAccess(db);
        await db.query('COMMIT');
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      } finally { db.release(); }
      await deliverCinecomEvents(pool, { secret: process.env.CINECOM_WEBHOOK_SECRET });
    } catch {
      // Never log payloads, responses or secrets. Missing migrations and database
      // outages are retried without acknowledging any events.
      console.error('[cinecom] Processing delayed; pending events will be retried.');
    } finally { busy = false; }
  }
  const interval = setInterval(() => { void tick(); }, 15000);
  interval.unref();
  void tick();
}
