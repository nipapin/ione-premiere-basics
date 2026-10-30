import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { randomUUID, createHmac } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import * as cinecom from '../../db/cinecom.mjs';
import { deliverCinecomEvents } from '../../db/cinecom-worker.mjs';
import { normalizePayproOrder } from '../../db/paypro-sales.mjs';
import { referralCookie, referralFromLink, readReferralAttribution } from '../../src/lib/referral-attribution.ts';

const require = createRequire(import.meta.url);
const { PGlite } = require('@electric-sql/pglite');
const { NextRequest } = require('next/server');
const ts = require('typescript');
const root = fileURLToPath(new URL('../../', import.meta.url));
const buyer = { user_id: '00000000-0000-4000-8000-000000000001', email: 'buyer@test.invalid', name: 'Buyer' };
const migration = readFileSync(new URL('../../db/migrations/2026_10_30_001_cinecom_webhooks.sql', import.meta.url), 'utf8');

function loader(mocks = {}) {
  const cache = new Map();
  function load(name) {
    if (name === 'server-only') return {};
    if (name === '@/lib/cinecom') return cinecom;
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (!name.startsWith('@/')) return require(name);
    if (cache.has(name)) return cache.get(name).exports;
    const filename = path.join(root, 'src', name.slice(2) + '.ts');
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const module = { exports: {} }; cache.set(name, module);
    const localRequire = createRequire(filename);
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename })(dependency => dependency.startsWith('.') ? localRequire(dependency) : load(dependency), module, module.exports);
    return module.exports;
  }
  return load;
}

async function database(t, beforeMigration = async () => {}) {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`CREATE TABLE users(user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text UNIQUE,name text,lastname text,password text,confirmtoken text,paypro_customer_id text);
    CREATE TABLE subscriptions(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid, subscription_id bigint UNIQUE,
      product_id bigint,order_id bigint,status text,invoice text,is_trial boolean DEFAULT false,trial_period_till text,next_charge_date text,
      quantity integer,customer_id text,order_item_name text,seats text[],affilate text,management_source text DEFAULT 'paypro',management_disabled boolean DEFAULT false);
    CREATE TABLE payments(user_id uuid,date text,amount numeric,status text,affilate text);
    CREATE TABLE odin_sales(subscription_id bigint,currency text,paid_at timestamptz);
    INSERT INTO users(user_id,email,name) VALUES('${buyer.user_id}','${buyer.email}','${buyer.name}');`);
  await beforeMigration(db);
  await db.exec(`BEGIN;${migration}COMMIT;`);
  return db;
}

const events = async db => (await db.query('SELECT body FROM odin_cinecom_events ORDER BY sequence')).rows.map(row => JSON.parse(row.body));
const cookieStore = attribution => ({ get: name => name === referralCookie ? { value: encodeURIComponent(JSON.stringify(attribution)) } : undefined });
const link = (ref = 'cinecom', cid = 'campaign-a') => ({ ref, cid, attributedAt: new Date().toISOString() });
async function checkout(db, referral = 'cinecom', cid = 'campaign-a') {
  const id = randomUUID();
  await db.query('INSERT INTO odin_referral_checkouts(id,user_id,referral,cid) VALUES($1,$2,$3,$4)', [id, buyer.user_id, referral, cid]);
  return id;
}
function order(id, checkoutId, productId = 111867, cycle = 1) {
  return { orderId: id, orderStatusName: 'Processed', createdAt: '2026-10-30T12:00:00Z', billingCurrencyCode: 'EUR', isTestMode: false,
    billingTotalPrice: 191, billingTotalTaxes: 38.2, customer: { customerId: 123, email: buyer.email },
    customFields: { 'x-odin-affiliate': 'cinecom', 'x-odin-attribution-id': checkoutId },
    orderItems: [{ orderItemId: id * 10, productId, subscriptionId: productId === 113887 ? 0 : 100, subscriptionBillingCycle: cycle,
      orderItemName: 'Odin', quantity: 1, billingPrice: 191, billingPriceRefund: 0 }] };
}

function paymentRoute(db, t) {
  const controls = { failQueue: false };
  let currentOrder;
  const query = (sql, args) => {
    if (controls.failQueue && sql.includes('INSERT INTO odin_cinecom_events')) throw new Error('Simulated queue outage');
    return db.query(sql, args);
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => { assert.equal(url, 'https://api.get-atomx.com/atomx/v1/webhook_esubs'); return Response.json({}); };
  t.after(() => { globalThis.fetch = originalFetch; });
  const route = loader({
    '@/app/database/pool': { pool: { connect: async () => ({ query, release() {} }) } },
    '@/lib/paypro-sales': { recordPayproSale: async fields => ['OrderCharged','SubscriptionChargeSucceed','OrderRefunded','OrderPartiallyRefunded'].includes(fields.IPN_TYPE_NAME)
      ? { order: currentOrder, rows: normalizePayproOrder(currentOrder) } : null },
    '@/lib/email': { sendEmail: async () => {} },
    'next/server': { NextResponse: Response },
  })('@/app/api/payment/route');
  controls.notify = async (value, overrides = {}) => {
    currentOrder = value;
    const item = value.orderItems[0];
    const fields = { TEST_MODE: '0', IPN_TYPE_NAME: 'OrderCharged', ORDER_ID: String(value.orderId), ORDER_ITEM_ID: String(item.orderItemId),
      PRODUCT_ID: String(item.productId), PRODUCT_QUANTITY: '1', SUBSCRIPTION_ID: item.subscriptionId ? String(item.subscriptionId) : '',
      SUBSCRIPTION_NEXT_CHARGE_DATE: '2099-01-01', CUSTOMER_EMAIL: buyer.email, CUSTOMER_ID: '123', ORDER_ITEM_NAME: 'Odin',
      IS_ON_TRIAL_PERIOD: '0', ORDER_STATUS: 'Processed', ORDER_CUSTOM_FIELDS: 'x-odin-affiliate=cinecom', ...overrides };
    return route.POST(new Request('https://odin.test/api/payment', { method: 'POST', body: new URLSearchParams(fields) }));
  };
  return controls;
}

test('referral cookies replace ref and cid together, reach the same request, expire and ignore prefetches', () => {
  const { proxy } = loader()('@/proxy');
  const request = new NextRequest('https://odin.test/signup?ref=cinecom&cid=new%2B%3D%2C');
  request.cookies.set(referralCookie, cookieStore(link('other', 'old')).get(referralCookie).value);
  const response = proxy(request);
  assert.deepEqual(readReferralAttribution(response.cookies).cid, 'new+=,');
  assert.equal(response.cookies.get('odin-pro-affiliate').value, 'cinecom');
  assert.equal(response.cookies.get(referralCookie).httpOnly, true);
  assert.ok(response.cookies.get(referralCookie).expires > new Date(Date.now() + 179 * 86400000));
  assert.ok(response.headers.get('x-middleware-request-cookie').includes('odin-pro-attribution='));
  const cleared = proxy(new NextRequest('https://odin.test/?ref=cinecom'));
  assert.equal(readReferralAttribution(cleared.cookies).cid, null);
  assert.equal(proxy(new NextRequest('https://odin.test/?ref=cinecom', { headers: { 'next-router-prefetch': '1' } })).headers.get('set-cookie'), null);
  assert.equal(referralFromLink(new URLSearchParams('ref=invalid%20link')), null);
  assert.equal(referralFromLink(new URLSearchParams({ ref: 'cinecom', cid: 'x'.repeat(513) })), null);
  assert.equal(readReferralAttribution(cookieStore({ ...link(), attributedAt: '2020-01-01T00:00:00Z' })), null);
});

test('latest saved attribution wins; missing cid clears an old campaign and stale device cookies cannot overwrite it', async t => {
  const db = await database(t);
  await cinecom.saveReferralAttribution(db, buyer.user_id, { ...link(), attributedAt: '2026-01-01T00:00:00Z' });
  await cinecom.saveReferralAttribution(db, buyer.user_id, { ...link('other', null), attributedAt: '2026-02-01T00:00:00Z' });
  const saved = await cinecom.saveReferralAttribution(db, buyer.user_id, { ...link(), attributedAt: '2026-01-15T00:00:00Z' });
  assert.deepEqual(saved, { referral: 'other', cid: null });
});

test('migration enrolls only existing active Cinecom subscriptions with numeric provider IDs', async t => {
  const db = await database(t, db => db.exec(`INSERT INTO subscriptions(user_id,subscription_id,product_id,affilate,next_charge_date)
    VALUES('${buyer.user_id}',100,111867,'cinecom','2/1/2099+12:00+AM'),('${buyer.user_id}',101,113886,'cinecom','malformed');
    INSERT INTO odin_sales VALUES(100,'EUR',NOW());`));
  const state = (await db.query('SELECT * FROM odin_cinecom_access')).rows[0];
  assert.equal(state.active, true); assert.equal(state.currency, 'EUR'); assert.equal(state.cid, null);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM odin_referral_subscriptions')).rows[0].count, 1);
  assert.deepEqual(await events(db), []);
});

test('registration queues Free once and rolls the account back if its event cannot be persisted', async t => {
  const db = await database(t);
  let failQueue = false;
  const query = (sql, args) => {
    if (failQueue && sql.includes('INSERT INTO odin_cinecom_events')) throw new Error('Queue unavailable');
    return db.query(sql, args);
  };
  const create = loader({ '@/app/database/pool': { pool: { connect: async () => ({ query, release() {} }) } },
    '@/app/database/postgre': {}, '@/lib/csrf': { validateCsrfToken: async () => true }, '@/lib/email': {},
    '@/lib/session': { createSession: async () => {} }, bcrypt: { hash: async () => 'test-password-hash' },
    'next/headers': { cookies: async () => cookieStore(link()) },
  })('@/actions/user').create;
  await create('New Customer', 'new@test.invalid', 'password', 'csrf');
  const [event] = await events(db);
  assert.equal(event.type, 'free_plan_started'); assert.equal(event.amount_cents, 0); assert.equal(event.plan, 'free');
  assert.equal(event.cid, 'campaign-a'); assert.deepEqual(event.customer, { email: 'new@test.invalid', first_name: 'New' });
  await assert.rejects(create('New Customer', 'new@test.invalid', 'password', 'csrf'));
  assert.equal((await events(db)).length, 1);
  failQueue = true;
  await assert.rejects(create('Failed Customer', 'failed@test.invalid', 'password', 'csrf'), /Queue unavailable/);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM users WHERE email='failed@test.invalid'")).rows[0].count, 0);
});

test('Creator starts once, keeps checkout cid across renewals and switches, and refunds report only new amounts excluding VAT', async t => {
  const db = await database(t); const route = paymentRoute(db, t); const id = await checkout(db);
  const first = order(1, id);
  assert.equal((await route.notify(first)).status, 200);
  assert.equal((await route.notify(first)).status, 200);
  await cinecom.saveReferralAttribution(db, buyer.user_id, link('other', 'new-campaign'));
  const renewal = order(2, undefined, 111867, 2);
  assert.equal((await route.notify(renewal, { IPN_TYPE_NAME: 'SubscriptionChargeSucceed' })).status, 200);
  const yearly = order(3, undefined, 113886);
  assert.equal((await route.notify(yearly)).status, 200);
  assert.equal((await events(db)).length, 1);
  assert.equal((await events(db))[0].amount_cents, 19100);
  assert.equal((await events(db))[0].currency, 'EUR');
  for (const refund of [50, 50, 80, 50, 191]) {
    yearly.orderStatusName = refund === 191 ? 'Refunded' : 'PartiallyRefunded';
    yearly.orderItems[0].billingPriceRefund = refund;
    assert.equal((await route.notify(yearly, { IPN_TYPE_NAME: refund === 191 ? 'OrderRefunded' : 'OrderPartiallyRefunded' })).status, 200);
  }
  await cinecom.reconcileCinecomAccess(db); await cinecom.reconcileCinecomAccess(db);
  const all = await events(db);
  assert.deepEqual(all.map(event => event.type), ['subscription_started','refunded','refunded','refunded','subscription_cancelled']);
  assert.deepEqual(all.filter(event => event.type === 'refunded').map(event => event.amount_cents), [5000,3000,11100]);
  assert.ok(all.every(event => event.cid === 'campaign-a'));
  assert.equal(all.at(-1).plan, 'creator_yearly');
});

test('Lifetime purchase retries do not duplicate access; a full refund revokes the same license', async t => {
  const db = await database(t); const route = paymentRoute(db, t); const paid = order(1, await checkout(db), 113887);
  assert.equal((await route.notify(paid)).status, 200); assert.equal((await route.notify(paid)).status, 200);
  paid.orderStatusName = 'Refunded'; paid.orderItems[0].billingPriceRefund = 191;
  assert.equal((await route.notify(paid, { IPN_TYPE_NAME: 'OrderRefunded' })).status, 200);
  const subscriptions = (await db.query('SELECT * FROM subscriptions')).rows;
  assert.equal(subscriptions.length, 1); assert.equal(cinecom.hasPaidAccess(subscriptions), false);
  assert.deepEqual((await events(db)).map(event => event.type), ['lifetime_purchased','refunded']);
});

test('stopping renewal retains access; administrative blocks cancel only when no other paid access remains', async t => {
  const db = await database(t); const route = paymentRoute(db, t); const paid = order(1, await checkout(db));
  await route.notify(paid);
  await route.notify(paid, { IPN_TYPE_NAME: 'SubscriptionFinished', SUBSCRIPTION_NEXT_CHARGE_DATE: '' });
  await cinecom.reconcileCinecomAccess(db); assert.equal((await events(db)).length, 1);
  await db.query("UPDATE subscriptions SET management_disabled=true");
  await db.query("INSERT INTO subscriptions(user_id,subscription_id,product_id,status) VALUES($1,200,113887,'active')", [buyer.user_id]);
  await cinecom.reconcileCinecomAccess(db); assert.equal((await events(db)).length, 1);
  await db.query("UPDATE subscriptions SET status='cancelled' WHERE product_id=113887");
  await cinecom.reconcileCinecomAccess(db); await cinecom.reconcileCinecomAccess(db);
  assert.equal((await events(db)).at(-1).type, 'subscription_cancelled'); assert.equal((await events(db)).length, 2);
});

test('LicenseRequested does not suppress the first paid start; expiry cancels once and stale charges cannot re-arm it', async t => {
  const db = await database(t); const route = paymentRoute(db, t); const paid = order(1, await checkout(db));
  assert.equal((await route.notify(paid, { IPN_TYPE_NAME: 'LicenseRequested' })).status, 200);
  assert.deepEqual(await events(db), []);
  assert.equal((await route.notify(paid)).status, 200);
  assert.equal((await events(db))[0].type, 'subscription_started');
  const expiredAt = new Date(Date.now() - 60000).toISOString();
  await db.query('UPDATE subscriptions SET next_charge_date=$1', [expiredAt]);
  await db.query('UPDATE odin_cinecom_access SET access_until=$1', [expiredAt]);
  await cinecom.reconcileCinecomAccess(db); await cinecom.reconcileCinecomAccess(db);
  assert.equal((await events(db)).length, 2);
  assert.equal((await events(db)).at(-1).occurred_at, expiredAt);
  assert.equal((await route.notify(paid, { SUBSCRIPTION_NEXT_CHARGE_DATE: expiredAt })).status, 200);
  await cinecom.reconcileCinecomAccess(db);
  assert.equal((await events(db)).length, 2);
  const newSubscription = order(2, await checkout(db)); newSubscription.orderItems[0].subscriptionId = 101;
  assert.equal((await route.notify(newSubscription)).status, 200);
  assert.equal((await events(db)).at(-1).type, 'subscription_started');
  assert.equal((await db.query('SELECT generation FROM odin_cinecom_access')).rows[0].generation, 2);
});

test('queue failure returns 503 and atomically rolls back access; test orders and other referrals emit no Cinecom events', async t => {
  const db = await database(t); const route = paymentRoute(db, t); const paid = order(1, await checkout(db));
  route.failQueue = true;
  assert.equal((await route.notify(paid)).status, 503);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM subscriptions')).rows[0].count, 0);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM odin_referral_orders')).rows[0].count, 0);
  route.failQueue = false;
  assert.equal((await route.notify(paid, { TEST_MODE: '1' })).status, 200);
  assert.deepEqual(await events(db), []);
  paid.customFields['x-odin-attribution-id'] = await checkout(db, 'other', null);
  assert.equal((await route.notify(paid)).status, 200); assert.deepEqual(await events(db), []);
});

test('delivery retries every non-200 and network failure with stable bytes, fresh signatures, and customer ordering', async t => {
  const db = await database(t); const secret = 'test-only-cinecom-secret';
  await cinecom.enqueueCinecomEvent(db, { key: 'first', user: buyer, type: 'free_plan_started', plan: 'free', cid: 'campaign-a' });
  await cinecom.enqueueCinecomEvent(db, { key: 'second', user: buyer, type: 'lifetime_purchased', plan: 'lifetime', amountCents: 19100 });
  const calls = []; const statuses = [204,302,500,null,200,200];
  for (let index = 0; index < statuses.length; index++) {
    await deliverCinecomEvents(db, { secret, now: () => 1800000000000 + index * 1000, random: () => 0, limit: 1,
      send: async (url, request) => {
        assert.equal(url, 'https://cinecom.net/webhooks/odin'); assert.equal(request.redirect, 'manual');
        assert.equal(request.headers['Content-Type'], 'application/json'); calls.push(request);
        const t = String(1800000000 + index);
        assert.equal(request.headers['Odin-Signature'], `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${request.body}`).digest('hex')}`);
        if (statuses[index] === null) throw new Error('Simulated network failure');
        return new Response(null, { status: statuses[index] });
      } });
    if (index < 4) {
      assert.equal((await db.query('SELECT delivered_at FROM odin_cinecom_events WHERE event_key=\'first\'')).rows[0].delivered_at, null);
      assert.equal((await db.query('SELECT attempts FROM odin_cinecom_events WHERE event_key=\'second\'')).rows[0].attempts, 0);
    }
    await db.query("UPDATE odin_cinecom_events SET next_attempt_at=NOW()-INTERVAL '1 second'");
  }
  assert.ok(calls.slice(0,5).every(call => call.body === calls[0].body));
  assert.notEqual(calls[0].body, calls[5].body);
  assert.equal((await db.query('SELECT count(*)::int AS count FROM odin_cinecom_events WHERE delivered_at IS NOT NULL')).rows[0].count, 2);
});

test('a live delivery lease cannot be claimed twice and an expired lease recovers with capped backoff', async t => {
  const db = await database(t);
  await cinecom.enqueueCinecomEvent(db, { key: 'leased', user: buyer, type: 'free_plan_started', plan: 'free' });
  await db.query("UPDATE odin_cinecom_events SET locked_until=NOW()+INTERVAL '1 minute',lock_token=$1,attempts=50", [randomUUID()]);
  let calls = 0;
  const options = { secret: 'test-only', limit: 1, random: () => 0, send: async () => { calls++; return new Response(null, { status: 503 }); } };
  await deliverCinecomEvents(db, options); assert.equal(calls, 0);
  await db.query("UPDATE odin_cinecom_events SET locked_until=NOW()-INTERVAL '1 minute'");
  await deliverCinecomEvents(db, options); assert.equal(calls, 1);
  const event = (await db.query('SELECT *,EXTRACT(EPOCH FROM next_attempt_at-NOW()) AS delay FROM odin_cinecom_events')).rows[0];
  assert.equal(event.attempts, 51); assert.equal(event.lock_token, null); assert.equal(event.last_status, 503);
  assert.ok(Number(event.delay) > 21590 && Number(event.delay) <= 21600);
});
