import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import { createCepAuth } from '../../../src/lib/cep-auth.ts';
import { addCalendarMonths } from '../../../db/ai-entitlements.mjs';

export const accounts = Object.fromEntries(['trial','paid','seat','expired','zero','enough','insufficient','admin'].map((name, i) => [name, {
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
  email: `${name}@odin-test.invalid`, name, admin: name === 'admin',
}]));

export async function createOdinDatabase(beforeBillingMigration, database) {
  const db = database ?? new PGlite();
  await db.exec(`CREATE TABLE users(user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT NOW(),email text UNIQUE,name text DEFAULT '',lastname text DEFAULT '',
    password text,confirmtoken text,emailconfirmed boolean DEFAULT true,paypro_customer_id numeric,is_admin boolean DEFAULT false);
    CREATE TABLE subscriptions(id integer PRIMARY KEY,user_id uuid,subscription_id numeric UNIQUE,status text,
    next_charge_date text,invoice text,is_trial boolean DEFAULT false,trial_period_till text,
    quantity integer DEFAULT 1,next_quantity integer DEFAULT 1,customer_id numeric,order_item_name text,
    seats text[] DEFAULT ARRAY[''],order_id numeric,product_id numeric,finished boolean,affilate text);
    CREATE TABLE payments(user_id uuid,date text,amount numeric,status text,affilate text);`);
  const migrationRoot = new URL('../../../db/migrations/', import.meta.url);
  for (const name of (await readdir(migrationRoot)).filter(name => name.endsWith('.sql')).sort()) {
    if (name === '2026_11_10_001_ai_billing_periods.sql' && beforeBillingMigration) await beforeBillingMigration(db);
    await db.exec(`BEGIN;${await readFile(new URL(name, migrationRoot), 'utf8')}COMMIT;`);
  }
  let queue = Promise.resolve();
  const query = async (sql, args) => {
    const result = await db.query(sql, args);
    return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  const pool = db.pool ?? { query, connect: async () => {
    const previous = queue;
    let release;
    queue = new Promise(resolve => { release = resolve; });
    await previous;
    return { query, release };
  } };
  return { db, pool, auth: createCepAuth(pool), close: () => db.close() };
}

export async function seedOdinAccounts(fixture) {
  const { db } = fixture;
  for (const user of Object.values(accounts)) {
    await db.query(`INSERT INTO users(user_id,email,name,is_admin,created_at) VALUES($1,$2,$3,$4,'2024-05-23T12:00:00Z')`,
      [user.id,user.email,user.name,user.admin]);
  }
  const paidAt = new Date(Date.now() - 86400000);
  const until = addCalendarMonths(paidAt, 1).toISOString();
  for (const name of ['paid','zero','enough','insufficient']) {
    const user = accounts[name];
    await db.query(`INSERT INTO subscriptions(user_id,subscription_id,status,next_charge_date,order_item_name,seats,product_id,
      ai_billing_anchor,ai_last_paid_at,ai_paid_until,ai_billing_confirmed)
      VALUES($1,$2,'active',$3::text,'Odin Monthly',$4,111867,$5,$5,$3::text::timestamptz,true)`,
      [user.id,100+Object.keys(accounts).indexOf(name),until,name === 'paid' ? [user.email,accounts.seat.email] : [user.email],paidAt.toISOString()]);
  }
  await db.query(`INSERT INTO subscriptions(user_id,subscription_id,status,next_charge_date,order_item_name,seats,product_id,ai_billing_confirmed)
    VALUES($1,999,'cancelled','2000-01-01','Odin Monthly',$2,111867,true)`, [accounts.expired.id,[accounts.expired.email]]);
  return fixture;
}

export async function signInDevice(fixture, name) {
  const user = accounts[name];
  const session = await fixture.auth.start({ usp: `isolated-${name}`, device: { user: name, os: 'Test' }, ip: '127.0.0.1' });
  await fixture.auth.confirm(session.code, user.id, 'approve');
  const result = await fixture.auth.claim(session.code, session.device_code);
  if (result.status !== 'complete') throw new Error('Test device login failed');
  const identity = await fixture.auth.authenticate(`Bearer ${result.token}`);
  return { token: result.token, identity, profile: await fixture.auth.profile(identity) };
}
