import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as salesData from '../../db/paypro-sales.mjs';
const require = createRequire(import.meta.url);
const { PGlite } = require('@electric-sql/pglite');
const ts = require('typescript');
const root = fileURLToPath(new URL('../../', import.meta.url));
function loader(mocks) {
  const cache = new Map();
  function load(name) {
    if (name === 'server-only') return {};
    if (name === '../../db/paypro-sales.mjs') return salesData;
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (!name.startsWith('@/')) return require(name);
    if (cache.has(name)) return cache.get(name).exports;
    const filename = path.join(root, 'src', name.slice(2) + '.ts');
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const module = { exports: {} }; cache.set(name, module);
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename })(load, module, module.exports);
    return module.exports;
  }
  return load;
}
const admin = '00000000-0000-4000-8000-000000000001', partnerUser = '00000000-0000-4000-8000-000000000002';
const order = (id, overrides = {}) => ({ orderId: id, orderStatusName: 'Processed', createdAt: '2026-10-05T12:00:00', billingCurrencyCode: 'USD', balanceCurrencyCode: 'USD', balanceTotalPrice: 19, balanceRefundedAmount: 0, isTestMode: false,
  customer: { customerId: id, email: 'buyer@test.invalid' }, customFields: [{ customFieldKey: 'x-odin-affiliate', customFieldValue: 'cinecom' }],
  orderItems: [{ orderItemId: id * 10, productId: 111867, orderItemName: 'Odin Pro monthly', quantity: 1, subscriptionId: id, billingPrice: 19, billingPriceRefund: 0, balanceVendorAmount: 17.50, balancePayProAmount: 1.50 }], ...overrides });
async function database() {
  const db = new PGlite();
  await db.exec(`CREATE TABLE users(user_id uuid PRIMARY KEY,is_admin boolean,email text);
    INSERT INTO users VALUES('${admin}',true,'admin@test.invalid'),('${partnerUser}',false,'partner@test.invalid');
    CREATE TABLE subscriptions(id int,affilate text,subscription_id numeric,status text,next_charge_date text,product_id numeric,quantity int,is_trial boolean,management_source text,management_disabled boolean);
    INSERT INTO subscriptions VALUES(1,'cinecom',1,'active','2099-01-01',111867,3,false,'paypro',false),
      (2,'cinecom',2,'active','',113887,1,false,'paypro',false),
      (3,'cinecom',3,'active','2000-01-01',111867,1,false,'paypro',false),
      (4,'cinecom',4,'on-hold','2099-01-01',111867,1,false,'paypro',false),
      (5,'cinecom',5,'active','2099-01-01',111867,1,true,'paypro',false),
      (6,'cinecom',6,'active','2099-01-01',111867,1,false,'manual',false);
    CREATE TABLE payments(affilate text);`);
  for (const migration of ['2026_10_11_001_affiliate_links.sql', '2026_10_12_001_sales_dashboard.sql', '2026_10_12_002_referral_visits.sql']) await db.exec(readFileSync(new URL('../../db/migrations/' + migration, import.meta.url), 'utf8'));
  return db;
}

test('PayPro amounts use cents, source currencies, actual fees and negative refund costs; test orders and non-Odin products never enter sales', () => {
  assert.equal(salesData.amount('27.055'), 27.06);
  assert.equal(salesData.amount('-2.02'), -2.02);
  assert.throws(() => salesData.amount('NaN'));
  assert.throws(() => salesData.utcDate('2026-02-30T12:00:00'));
  assert.equal(salesData.utcDate('2026-10-05T12:00:00'), '2026-10-05T12:00:00.000Z');
  assert.deepEqual(salesData.normalizePayproOrder(order(1, { isTestMode: true })), []);
  assert.deepEqual(salesData.normalizePayproOrder(order(1, { orderItems: [{ productId: 999 }] })), []);
  const refunded = order(1, { orderStatusName: 'Refunded', billingCurrencyCode: 'EUR' });
  refunded.orderItems[0].billingPriceRefund = 19;
  refunded.orderItems[0].balanceVendorAmount = -2.02;
  const [row] = salesData.normalizePayproOrder(refunded, new Map([['1', 'premierebasics']]));
  assert.equal(row.currency, 'EUR'); assert.equal(row.balanceCurrency, 'USD');
  assert.equal(row.referral, 'premierebasics'); assert.equal(row.netAmount, -2.02);
  assert.equal(row.buyerLabel, 'b***@test.invalid'); assert.equal(row.refundedAmount, 19);
  assert.equal(Object.hasOwn(row, 'customer'), false);
});

test('historical imports and webhook retries never double count; date periods, refunds and currencies are exact', async () => {
  const db = await database();
  try {
    const paid = order(1), refunded = order(2, { orderStatusName: 'Refunded' });
    refunded.orderItems[0].billingPriceRefund = 19; refunded.orderItems[0].balanceVendorAmount = -2;
    const euro = order(3, { billingCurrencyCode: 'EUR', balanceTotalPrice: 22 });
    euro.orderItems[0].balanceVendorAmount = 20.50;
    const old = order(4, { createdAt: '2026-09-30T23:59:59' });
    const future = order(5, { createdAt: '2026-11-01T00:00:00' });
    const canceled = order(6, { orderStatusName: 'Canceled' });
    const zero = order(7); zero.orderItems[0].billingPrice = 0;
    for (const item of [paid, refunded, euro, old, future, canceled, zero, paid]) await salesData.saveSales(db, salesData.normalizePayproOrder(item));
    assert.equal((await db.query('SELECT count(*) FROM odin_sales')).rows[0].count, 7);
    const api = loader({ '@/app/database/postgre': { query: async (sql, args) => (await db.query(sql, args)).rows } })('@/lib/sales-report');
    const period = api.salesPeriod(new URLSearchParams('period=month'), new Date('2026-10-12T00:00:00Z'));
    const report = await api.getSalesReport(['cinecom'], period);
    assert.equal(report.summary.transactions, 3); assert.equal(report.summary.buyers, 2);
    assert.deepEqual(report.summary.currencies, [{ currency: 'EUR', gross: 19, refunds: 0, revenue: 19 }, { currency: 'USD', gross: 38, refunds: 19, revenue: 19 }]);
    assert.equal(report.summary.balances[0].net, 36);
    assert.equal(report.summary.balances[0].revenue, 41);
    assert.equal(report.summary.activeSubscriptions, 2); assert.equal(report.summary.activeLicenses, 4);
    assert.equal(report.payments.length, 3);
    assert.deepEqual((await api.getSalesReport([], period)).summary.currencies, []);
    assert.equal(api.salesPeriod(new URLSearchParams('period=custom&from=2026-10-05&to=2026-10-05')).to, '2026-10-06T00:00:00.000Z');
    assert.throws(() => api.salesPeriod(new URLSearchParams('period=custom&from=2026-02-30&to=2026-03-01')), /INVALID_PERIOD/);
    assert.throws(() => api.salesPeriod(new URLSearchParams('period=custom&from=2026-10-06&to=2026-10-05')), /INVALID_PERIOD/);
  } finally { await db.close(); }
});

test('all admins see global revenue and every partner; partners can only read their assigned report; edits require admin and CSRF', async () => {
  const db = await database(); let session = null;
  try {
    const partner = (await db.query("SELECT id FROM odin_affiliate_partners WHERE name='Jordy'")).rows[0];
    await db.query('UPDATE odin_affiliate_partners SET user_id=$1 WHERE id=$2', [partnerUser, partner.id]);
    await db.query("INSERT INTO odin_affiliate_partner_links VALUES($1,'cinecom')", [partner.id]);
    await salesData.saveSales(db, salesData.normalizePayproOrder(order(1)));
    await salesData.saveSales(db, salesData.normalizePayproOrder(order(2, { customFields: [] })));
    const load = loader({ '@/app/database/postgre': { query: async (sql, args) => (await db.query(sql, args)).rows }, '@/lib/session': { validateSession: async () => session }, '@/lib/csrf': { validateCsrfToken: async token => token === 'valid' } });
    const route = load('@/app/api/affilates/report/route');
    const request = suffix => new Request('https://odin.test/api/affilates/report?period=all' + suffix);
    assert.equal((await route.GET(request(''))).status, 401);
    session = { user_id: partnerUser };
    assert.equal((await route.GET(request(''))).status, 403);
    assert.equal((await route.GET(request('&partner=' + partner.id))).status, 200);
    const other = (await db.query("SELECT id FROM odin_affiliate_partners WHERE name='Tymon'")).rows[0];
    assert.equal((await route.GET(request('&partner=' + other.id))).status, 403);
    assert.equal((await route.GET(request('&partner=' + partner.id + '&link=premierebasics'))).status, 400);
    session = { user_id: admin };
    const report = await (await route.GET(request(''))).json();
    assert.equal(report.summary.transactions, 2); assert.equal(report.partners.length, 2);
    assert.equal(report.partners.find(row => row.name === 'Jordy').summary.transactions, 1);
    assert.equal((await route.GET(new Request('https://odin.test/api/affilates/report?period=custom&from=bad&to=bad'))).status, 400);
    const patch = load('@/app/api/affilates/partners/[id]/route');
    const update = body => patch.PATCH(new Request('https://odin.test', { method: 'PATCH', body: JSON.stringify(body) }), { params: Promise.resolve({ id: partner.id }) });
    assert.equal((await update({ codes: ['cinecom'], csrfToken: 'wrong' })).status, 403);
    assert.equal((await update({ codes: ['cinecom'], ownerEmail: '', csrfToken: 'valid' })).status, 200);
    session = { user_id: partnerUser };
    assert.equal((await route.GET(request('&partner=' + partner.id))).status, 403);
    assert.equal((await update({ codes: ['premierebasics'], csrfToken: 'valid' })).status, 403);
  } finally { await db.close(); }
});

test('displayed revenue sums actual Net across all pages and links, including refunds and Net with an unknown fee', async () => {
  const db = await database();
  try {
    for (let id = 1; id <= 26; id++) {
      const item = order(id);
      if (id === 1) item.orderItems[0].balancePayProAmount = null;
      if (id === 2) {
        item.billingCurrencyCode = 'EUR'; item.balanceTotalPrice = 22;
        item.orderItems[0].balanceVendorAmount = 20.50;
      }
      if (id === 26) {
        item.orderStatusName = 'Refunded';
        item.orderItems[0].billingPriceRefund = 19; item.orderItems[0].balanceVendorAmount = -2;
      }
      await salesData.saveSales(db, salesData.normalizePayproOrder(item));
    }
    const euroBalance = order(27, { balanceCurrencyCode: 'EUR' });
    euroBalance.orderItems[0].balanceVendorAmount = 9.99;
    await salesData.saveSales(db, salesData.normalizePayproOrder(euroBalance));
    const unknownNet = order(28);
    unknownNet.orderItems[0].balanceVendorAmount = null;
    await salesData.saveSales(db, salesData.normalizePayproOrder(unknownNet));

    const load = loader({ '@/app/database/postgre': { query: async (sql, args) => (await db.query(sql, args)).rows } });
    const api = load('@/lib/sales-report'), { netSalesRevenue } = load('@/lib/sales-revenue');
    const period = api.salesPeriod(new URLSearchParams('period=all'));
    const report = await api.getSalesReport(null, period);
    assert.equal(report.payments.length, 25); assert.equal(report.totalRows, 28);
    assert.equal(netSalesRevenue(report.summary, 'USD'), 438.50);
    assert.equal(netSalesRevenue(report.summary, 'EUR'), 9.99);
    assert.equal(netSalesRevenue(report.linkSummaries.cinecom, 'USD'), 438.50);
    assert.equal(netSalesRevenue((await api.getSalesReport(['cinecom'], period)).summary, 'USD'), 438.50);
    const secondPage = await api.getSalesReport(null, period, 2);
    assert.equal(secondPage.payments.length, 3);
    assert.equal(netSalesRevenue(secondPage.summary, 'USD'), 438.50);
    assert.equal(secondPage.payments.find(payment => String(payment.orderId) === '1').net, 17.50);
    assert.equal(netSalesRevenue((await api.getSalesReport([], period)).summary, 'USD'), 0);
    assert.equal(netSalesRevenue(undefined, 'USD'), 0);
  } finally { await db.close(); }
});

test('financial webhooks verify signature before API calls and persist only authenticated provider details', async () => {
  const db = await database(); const originalFetch = globalThis.fetch;
  const saved = process.env.PAYPRO_VALIDATION_KEY;
  try {
    process.env.PAYPRO_VALIDATION_KEY = 'fixture-key';
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ isSuccess: true, request: { apiSecretKey: 'must-not-store' }, response: order(1) }); };
    const service = loader({ '@/app/database/postgre': { query: async (sql, args) => (await db.query(sql, args)).rows } })('@/lib/paypro-sales');
    const fields = { ORDER_ID: '1', ORDER_STATUS: 'Processed', ORDER_TOTAL_AMOUNT: '19', CUSTOMER_EMAIL: 'buyer@test.invalid', TEST_MODE: '0', IPN_TYPE_NAME: 'OrderCharged' };
    await assert.rejects(service.recordPayproSale(fields), /signature/); assert.equal(calls, 0);
    fields.SIGNATURE = createHash('sha256').update('1Processed19buyer@test.invalidfixture-key0OrderCharged').digest('hex');
    await service.recordPayproSale(fields); await service.recordPayproSale(fields);
    assert.equal((await db.query('SELECT count(*) FROM odin_sales')).rows[0].count, 1);
    assert.equal(JSON.stringify((await db.query('SELECT * FROM odin_sales')).rows).includes('must-not-store'), false);
  } finally { globalThis.fetch = originalFetch; if (saved === undefined) delete process.env.PAYPRO_VALIDATION_KEY; else process.env.PAYPRO_VALIDATION_KEY = saved; await db.close(); }
});

test('referral visits reject cross-origin requests, ignore unknown codes and bots, deduplicate refreshes and respect report dates', async () => {
  const db = await database();
  try {
    const load = loader({ '@/app/database/postgre': { query: async (sql, args) => (await db.query(sql, args)).rows } });
    const visit = load('@/app/api/affilates/visit/route');
    const id = '00000000-0000-4000-8000-000000000010';
    const request = (code, origin = 'https://odin.test', agent = 'Browser') => new Request('https://odin.test/api/affilates/visit', { method: 'POST', headers: { origin, 'user-agent': agent }, body: JSON.stringify({ code, visitId: id }) });
    assert.equal((await visit.POST(request('cinecom', 'https://elsewhere.test'))).status, 403);
    assert.equal((await visit.POST(new Request('http://localhost:3100/api/affilates/visit', {method: 'POST', headers: {origin: 'http://127.0.0.1:3100', host: '127.0.0.1:3100'}, body: JSON.stringify({code: 'unknown-code', visitId: id})}))).status, 204);
    assert.equal((await visit.POST(request('cinecom', 'https://odin.test', 'Googlebot'))).status, 204);
    assert.equal((await visit.POST(request('unknown-code'))).status, 204);
    assert.equal((await db.query('SELECT count(*) FROM odin_referral_visits')).rows[0].count, 0);
    for (let retry = 0; retry < 3; retry++) assert.equal((await visit.POST(request('cinecom'))).status, 204);
    await visit.POST(request('premierebasics'));
    await db.query("UPDATE odin_referral_visits SET visited_at='2026-10-05T12:00:00Z'");
    const api = load('@/lib/sales-report');
    const period = api.salesPeriod(new URLSearchParams('period=custom&from=2026-10-05&to=2026-10-05'));
    const report = await api.getSalesReport(null, period);
    assert.equal(report.summary.visits, 2);
    assert.equal(report.linkSummaries.cinecom.visits, 1);
    assert.equal((await api.getSalesReport(['cinecom'], period)).summary.visits, 1);
    assert.equal((await api.getSalesReport([], period)).summary.visits, 0);
    assert.equal((await api.getSalesReport(null, api.salesPeriod(new URLSearchParams('period=custom&from=2026-10-06&to=2026-10-06')))).summary.visits, 0);
  } finally { await db.close(); }
});
