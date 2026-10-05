import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createOdinSubscriptionManagement } from '../../src/lib/odin-subscription-management.ts';
import { createMotionflowManagement } from '../../src/lib/motionflow-management.ts';
import { createCepAuth } from '../../src/lib/cep-auth.ts';
import { payproSubscriptionManagement } from '../../src/lib/paypro-subscription-management.ts';
import { isSubscriptionActive } from '../../src/lib/subscription-date.ts';

const ids = ['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003'];
const db = new PGlite();
const query = async (sql, args) => { const r = await db.query(sql, args); return { ...r, rowCount: r.affectedRows ?? r.rows.length }; };
let queue = Promise.resolve();
const pool = { query, connect: async () => {
  const previous = queue; let release;
  queue = new Promise(resolve => { release = resolve; });
  await previous; return { query, release };
} };
const calls = [];
let billingFailure = false;
let configFailure = false;
let holdBilling;
const service = createOdinSubscriptionManagement(pool, {
  validate() { if (configFailure) throw new Error('PAYPRO_NOT_CONFIGURED'); },
  async change(id, action, reason) {
    calls.push({ id, action, reason });
    if (holdBilling) await holdBilling;
    if (billingFailure) throw new Error('PAYPRO_UNAVAILABLE');
    return { status: action === 'suspend' ? 'suspended' : 'active', next_charge_date: '2099-02-01T00:00:00.000Z' };
  },
});
const details = createMotionflowManagement(pool);
const auth = createCepAuth(pool);
const change = (action, extra = {}) => service.change({ user_id: ids[0], actor: 'admin@test.invalid', reason: 'Support', action, ...extra });
let manualId;

before(async () => {
  // Match the production UUID/numeric schema, including the missing ID default.
  await db.exec(`CREATE TABLE users (user_id uuid PRIMARY KEY,email text,name text,lastname text);
    INSERT INTO users VALUES ('${ids[0]}','owner@test.invalid','Owner',''),('${ids[1]}','invited@test.invalid','Invited',''),('${ids[2]}','manual@test.invalid','Manual','');
    CREATE TABLE subscriptions (id integer PRIMARY KEY,user_id uuid NOT NULL,subscription_id numeric NOT NULL,status text NOT NULL,
      next_charge_date text NOT NULL,invoice text NOT NULL,is_trial boolean NOT NULL DEFAULT false,trial_period_till text,
      quantity integer NOT NULL DEFAULT 1,customer_id numeric NOT NULL,order_item_name text,seats text[] NOT NULL DEFAULT ARRAY[''],
      next_quantity integer NOT NULL DEFAULT 1,order_id numeric,product_id numeric,finished boolean,affilate text);
    INSERT INTO subscriptions (id,user_id,subscription_id,status,next_charge_date,invoice,customer_id,order_item_name,seats,quantity)
      VALUES (107,'${ids[0]}',900043,'active','2/1/2099+12:00+AM','invoice',123,'Paid Odin',ARRAY['owner@test.invalid','invited@test.invalid'],2);`);
  for (const migration of ['2026_09_29_odin_cep_auth.sql','2026_09_30_002_motionflow_management.sql','2026_10_05_001_subscription_management.sql']) {
    await db.exec(await readFile(new URL('../../db/migrations/' + migration, import.meta.url), 'utf8'));
  }
});
after(() => db.close());

test('issue creates a real non-billing subscription and retries cannot duplicate it', async () => {
  const input = { user_id: ids[2], expires_at: '2099-01-01T00:00:00Z', plan_name: 'Odin Pro annual gift', request_id: randomUUID() };
  await change('subscription_issue', input);
  await change('subscription_issue', input);
  const rows = (await query('SELECT * FROM subscriptions WHERE user_id=$1', [ids[2]])).rows;
  assert.equal(rows.length, 1);
  manualId = rows[0].id;
  assert.ok(manualId > 107);
  assert.equal(Number(rows[0].subscription_id), -manualId);
  assert.equal(rows[0].management_source, 'manual');
  assert.equal(rows[0].order_id, null);
  assert.deepEqual(rows[0].seats, ['manual@test.invalid']);
  assert.equal(isSubscriptionActive(rows[0]), true);
  assert.equal((await details.detail(ids[2])).subscription_active, true);
  assert.equal((await auth.profile({ id: 'device', user_id: ids[2] })).subscription.active, true);
  assert.equal((await query('SELECT * FROM odin_motionflow_audit WHERE user_id=$1', [ids[2]])).rows.length, 1);
  assert.equal(calls.length, 0);
  await assert.rejects(change('subscription_issue', { ...input, plan_name: 'Changed on retry' }), /INVALID_INPUT/);
  await assert.rejects(change('subscription_issue', { ...input, user_id: ids[1] }), /INVALID_INPUT/);
});

test('manual disable, extend and restore affect website and CEP without a PayPro request', async () => {
  const target = { user_id: ids[2], subscription_id: manualId };
  await change('subscription_disable', target);
  assert.equal((await details.detail(ids[2])).subscription_active, false);
  assert.equal((await auth.profile({ id: 'device', user_id: ids[2] })).subscription.active, false);
  await change('subscription_update', { ...target, expires_at: '2099-03-01T00:00:00Z', plan_name: 'Extended gift' });
  let row = (await query('SELECT * FROM subscriptions WHERE id=$1', [manualId])).rows[0];
  assert.equal(row.management_disabled, true);
  assert.equal(row.order_item_name, 'Extended gift');
  assert.equal(row.next_charge_date, '2099-03-01T00:00:00.000Z');
  await change('subscription_enable', target);
  assert.equal((await details.detail(ids[2])).subscription_active, true);
  await query("UPDATE subscriptions SET next_charge_date='2000-01-01T00:00:00Z' WHERE id=$1", [manualId]);
  assert.equal((await auth.profile({ id: 'device', user_id: ids[2] })).subscription.active, false);
  assert.equal(calls.length, 0);
});

test('owner scope, invalid inputs and missing billing configuration fail before changing records', async () => {
  const before = (await query('SELECT * FROM subscriptions ORDER BY id')).rows;
  for (const target of [{ user_id: ids[1], subscription_id: 107 }, { subscription_id: manualId }, { subscription_id: 99999 }]) {
    await assert.rejects(change('subscription_disable', target), /NOT_FOUND/);
  }
  await assert.rejects(change('subscription_update', { subscription_id: 107, plan_name: 'Fake billing', expires_at: '2099-01-01T00:00:00Z' }), /MANUAL_SUBSCRIPTION_REQUIRED/);
  for (const extra of [{ expires_at: 'invalid' }, { expires_at: '2000-01-01T00:00:00Z' }, { plan_name: '' }, { request_id: 'invalid' }]) {
    await assert.rejects(change('subscription_issue', { plan_name: 'Gift', expires_at: '2099-01-01T00:00:00Z', request_id: randomUUID(), ...extra }), /INVALID_INPUT/);
  }
  configFailure = true;
  await assert.rejects(change('subscription_disable', { subscription_id: 107 }), /PAYPRO_NOT_CONFIGURED/);
  configFailure = false;
  assert.deepEqual((await query('SELECT * FROM subscriptions ORDER BY id')).rows, before);
  assert.equal(calls.length, 0);
});

test('paid disable stops billing using the provider ID and blocks owner and invited seats', async () => {
  await change('subscription_disable', { subscription_id: 107 });
  assert.equal(calls[0].id, 900043);
  assert.equal(calls[0].action, 'suspend');
  for (const userId of ids.slice(0, 2)) {
    assert.equal((await details.detail(userId)).subscription_active, false);
    assert.equal((await auth.profile({ id: 'device', user_id: userId })).subscription.active, false);
  }
  const row = (await query('SELECT * FROM subscriptions WHERE id=107')).rows[0];
  assert.equal(row.management_billing_state, 'suspended');
  assert.equal(row.next_charge_date, '2/1/2099+12:00+AM');
  assert.equal(row.invoice, 'invoice');
  assert.equal(row.quantity, 2);
  await change('subscription_disable', { subscription_id: 107 });
  assert.equal(calls.length, 1);
  // A late payment webhook cannot silently remove the administrative block.
  await query("UPDATE subscriptions SET status='active',next_charge_date='2099-05-01T00:00:00Z' WHERE id=107");
  assert.equal((await details.detail(ids[0])).subscription_active, false);
});

test('paid restore resumes billing only after confirmation; failures stay visible and retryable', async () => {
  billingFailure = true;
  await assert.rejects(change('subscription_enable', { subscription_id: 107 }), /PAYPRO_UNAVAILABLE/);
  let row = (await query('SELECT * FROM subscriptions WHERE id=107')).rows[0];
  assert.equal(row.management_disabled, true);
  assert.equal(row.management_billing_state, 'failed');
  assert.equal(row.management_billing_action, 'renew');
  billingFailure = false;
  await change('subscription_enable', { subscription_id: 107 });
  row = (await query('SELECT * FROM subscriptions WHERE id=107')).rows[0];
  assert.equal(row.management_disabled, false);
  assert.equal(row.management_billing_state, 'active');
  assert.equal(row.next_charge_date, '2099-02-01T00:00:00.000Z');
  for (const userId of ids.slice(0, 2)) assert.equal((await auth.profile({ id: 'device', user_id: userId })).subscription.active, true);
  await change('subscription_enable', { subscription_id: 107 });
  assert.equal(calls.length, 3);
});

test('billing changes reject concurrent writes and recover a stale pending operation', async () => {
  let release; holdBilling = new Promise(resolve => { release = resolve; });
  const saving = change('subscription_disable', { subscription_id: 107 });
  while ((await query('SELECT management_billing_state FROM subscriptions WHERE id=107')).rows[0].management_billing_state !== 'pending') await new Promise(resolve => setTimeout(resolve, 1));
  await assert.rejects(change('subscription_enable', { subscription_id: 107 }), /SUBSCRIPTION_BUSY/);
  release(); holdBilling = null; await saving;
  await query("UPDATE subscriptions SET management_billing_state='pending',management_operation_started_at=NOW()-INTERVAL '2 minutes' WHERE id=107");
  await change('subscription_disable', { subscription_id: 107 });
  assert.equal((await query('SELECT management_billing_state FROM subscriptions WHERE id=107')).rows[0].management_billing_state, 'suspended');
});

test('failed audit rolls back issue and never sends a paid mutation', async () => {
  await query("ALTER TABLE odin_motionflow_audit ADD CONSTRAINT test_actor CHECK (actor <> 'audit-failure')");
  const count = (await query('SELECT COUNT(*) AS count FROM subscriptions')).rows[0].count;
  const previousCalls = calls.length;
  try {
    await assert.rejects(change('subscription_issue', { actor: 'audit-failure', plan_name: 'Gift', expires_at: '2099-01-01T00:00:00Z', request_id: randomUUID() }));
    await assert.rejects(change('subscription_enable', { actor: 'audit-failure', subscription_id: 107 }));
    assert.equal((await query('SELECT COUNT(*) AS count FROM subscriptions')).rows[0].count, count);
    assert.equal(calls.length, previousCalls);
  } finally { await query('ALTER TABLE odin_motionflow_audit DROP CONSTRAINT test_actor'); }
});

test('PayPro adapter confirms status, reconciles retries and never returns echoed credentials', async () => {
  const originalFetch = globalThis.fetch;
  const originalVendor = process.env.PAYPRO_VENDOR_ACCOUNT_ID;
  const originalSecret = process.env.PAYPRO_API_SECRET_KEY;
  process.env.PAYPRO_VENDOR_ACCOUNT_ID = '123'; process.env.PAYPRO_API_SECRET_KEY = 'private-secret';
  let remoteStatus = 'Active'; const requests = [];
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body); requests.push({ url, body });
    assert.equal(body.subscriptionId, 900043);
    assert.equal(body.vendorAccountId, 123);
    if (url.endsWith('/Suspend')) remoteStatus = 'Suspended';
    if (url.endsWith('/Renew')) remoteStatus = 'Active';
    return Response.json({ isSuccess: true, request: body, response: { status: remoteStatus, nextPayment: '2099-02-01T00:00:00.000' } });
  };
  try {
    const result = await payproSubscriptionManagement.change(900043, 'suspend', 'Support');
    assert.equal(result.status, 'suspended');
    assert.equal(JSON.stringify(result).includes('private-secret'), false);
    assert.equal(requests.find(r => r.url.endsWith('/Suspend')).body.sendCustomerNotification, false);
    await payproSubscriptionManagement.change(900043, 'suspend', 'Retry');
    assert.equal(requests.filter(r => r.url.endsWith('/Suspend')).length, 1);
    await payproSubscriptionManagement.change(900043, 'renew', 'Restore');
    assert.equal(remoteStatus, 'Active');
    remoteStatus = 'Finished';
    await assert.rejects(payproSubscriptionManagement.change(900043, 'renew', 'Restore'), /PAYPRO_CANNOT_RENEW/);
    globalThis.fetch = async () => Response.json({ isSuccess: false, request: { apiSecretKey: 'private-secret' } });
    await assert.rejects(payproSubscriptionManagement.change(900043, 'suspend', 'Support'), /^Error: PAYPRO_UNAVAILABLE$/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalVendor === undefined) delete process.env.PAYPRO_VENDOR_ACCOUNT_ID; else process.env.PAYPRO_VENDOR_ACCOUNT_ID = originalVendor;
    if (originalSecret === undefined) delete process.env.PAYPRO_API_SECRET_KEY; else process.env.PAYPRO_API_SECRET_KEY = originalSecret;
  }
});
