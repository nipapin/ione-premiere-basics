import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');

function loader(mocks) {
  const cache = new Map();
  function load(name) {
    if (name === 'server-only') return {};
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (!name.startsWith('@/')) return require(name);
    if (cache.has(name)) return cache.get(name).exports;
    const filename = path.join(root, 'src', name.slice(2) + '.ts');
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const module = { exports: {} }; cache.set(name, module);
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename })(load, module, module.exports);
    return module.exports;
  }
  return load;
}

test('affiliate access uses exact accounts and referral codes and rejects invalid configuration', () => {
  const saved = process.env.ODIN_AFFILIATE_ACCESS;
  try {
    const { getAffiliateLinks } = loader({})('@/lib/affiliate-access');
    delete process.env.ODIN_AFFILIATE_ACCESS;
    assert.deepEqual(getAffiliateLinks(null), []);
    assert.deepEqual(getAffiliateLinks({ user_id: 'partner' }), []);
    assert.deepEqual(getAffiliateLinks({ user_id: 'admin', is_admin: true }), ['cinecom', 'premierebasics', 'aftereffectsbasics']);
    process.env.ODIN_AFFILIATE_ACCESS = JSON.stringify({ partner: ['cinecom', 'cinecom', 'new-link'], second: ['premierebasics'] });
    assert.deepEqual(getAffiliateLinks({ user_id: 'partner' }), ['cinecom', 'new-link']);
    assert.deepEqual(getAffiliateLinks({ user_id: 'second' }), ['premierebasics']);
    assert.deepEqual(getAffiliateLinks({ user_id: 'toString' }), []);
    assert.deepEqual(getAffiliateLinks({ user_id: 'unrelated', name: 'Jordy' }), []);
    assert.ok(getAffiliateLinks({ user_id: 'admin', is_admin: true }).includes('new-link'));
    for (const config of ['invalid', 'null', '[]', '{"partner":"cinecom"}', '{"partner":[1]}', '{"partner":[""]}', '{"partner":[" cinecom"]}']) {
      process.env.ODIN_AFFILIATE_ACCESS = config;
      assert.throws(() => getAffiliateLinks({ user_id: 'partner' }), /ODIN_AFFILIATE_ACCESS/);
    }
  } finally {
    if (saved === undefined) delete process.env.ODIN_AFFILIATE_ACCESS; else process.env.ODIN_AFFILIATE_ACCESS = saved;
  }
});

test('API protects historical statistics, scopes both tables, includes inactive records and zero-sales links', async () => {
  const db = new PGlite();
  const saved = process.env.ODIN_AFFILIATE_ACCESS;
  let session = null;
  const calls = [];
  const query = async (sql, args) => { calls.push([sql, args]); return (await db.query(sql, args)).rows; };
  try {
    await db.exec(`CREATE TABLE users(user_id text PRIMARY KEY,is_admin boolean);
      INSERT INTO users VALUES ('partner',false),('outsider',false),('admin',true);
      CREATE TABLE subscriptions(affilate text,status text,is_trial boolean,quantity integer);
      INSERT INTO subscriptions VALUES ('cinecom','active',false,3),('cinecom','cancelled',false,1),
        ('cinecom','on-hold',false,1),('cinecom','active',true,1),('cinecom','failed',false,1),
        ('premierebasics','active',false,99),('unconfigured','active',false,20),(NULL,'active',false,5);
      CREATE TABLE payments(affilate text,status text,amount numeric);
      INSERT INTO payments VALUES ('cinecom','Processed',12),('cinecom','Declined',90),
        ('premierebasics','Processed',50);`);
    process.env.ODIN_AFFILIATE_ACCESS = JSON.stringify({ partner: ['cinecom', 'aftereffectsbasics'] });
    const route = loader({ '@/app/database/postgre': { query }, '@/lib/session': { validateSession: async () => session } })('@/app/api/affilates/route');
    assert.equal((await route.GET()).status, 401);
    assert.equal(calls.length, 0);
    session = { user_id: 'outsider' };
    assert.equal((await route.GET()).status, 403);
    assert.equal(calls.length, 1);
    session = { user_id: 'deleted' };
    assert.equal((await route.GET()).status, 403);
    session = { user_id: 'partner' };
    const response = await route.GET(new Request('https://odin.test/api/affilates?user_id=admin&ref=premierebasics'));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.deepEqual(await response.json(), [
      { affiliate: 'cinecom', subscriptions: 5, licenses: 7, trials: 1, statuses: { active: 2, cancelled: 1, 'on-hold': 1, failed: 1 }, oneTimeOrders: 1 },
      { affiliate: 'aftereffectsbasics', subscriptions: 0, licenses: 0, trials: 0, statuses: {}, oneTimeOrders: 0 },
    ]);
    for (const [, args] of calls.filter(([sql]) => sql.includes('ANY('))) assert.deepEqual(args, [['cinecom', 'aftereffectsbasics']]);
    session = { user_id: 'admin' };
    const admin = await (await route.GET()).json();
    assert.equal(admin.find(row => row.affiliate === 'premierebasics').licenses, 99);
    assert.equal(admin.some(row => row.affiliate === 'unconfigured'), false);
  } finally {
    await db.close();
    if (saved === undefined) delete process.env.ODIN_AFFILIATE_ACCESS; else process.env.ODIN_AFFILIATE_ACCESS = saved;
  }
});

test('renewal webhook preserves the stored referral when custom fields omit or empty it', async () => {
  const db = new PGlite();
  const originalFetch = globalThis.fetch;
  try {
    await db.exec(`CREATE TABLE users(user_id text PRIMARY KEY,email text,paypro_customer_id text);
      INSERT INTO users VALUES ('buyer','buyer@test.invalid',NULL);
      CREATE TABLE subscriptions(subscription_id text,status text,next_charge_date text,order_item_name text,
        is_trial boolean,trial_period_till text,product_id text,affilate text);
      INSERT INTO subscriptions VALUES ('100','active','2099-01-01','Odin',false,'','113886','cinecom');`);
    globalThis.fetch = async () => Response.json({});
    const route = loader({
      '@/app/database/postgre': { query: async (sql, args, options) => {
        const rows = (await db.query(sql, args)).rows; return options?.single ? rows[0] : rows;
      } },
      '@/lib/email': { sendEmail: async () => {} },
      'next/server': { NextResponse: Response },
    })('@/app/api/payment/route');
    for (const custom of [undefined, 'x-odin-affiliate=', 'x-odin-affiliate=premierebasics']) {
      const fields = { IPN_TYPE_NAME: 'SubscriptionChargeSucceed', PRODUCT_ID: '113886', ORDER_ID: '10',
        ORDER_ITEM_ID: '11', HASH: 'test', SUBSCRIPTION_ID: '100', SUBSCRIPTION_NEXT_CHARGE_DATE: '2099-02-01',
        CUSTOMER_EMAIL: 'buyer@test.invalid', ORDER_ITEM_NAME: 'Odin', PRODUCT_QUANTITY: '1',
        IS_ON_TRIAL_PERIOD: '0', TRIAL_PERIOD_TILL: '', CUSTOMER_ID: '1' };
      if (custom !== undefined) fields.ORDER_CUSTOM_FIELDS = custom;
      const response = await route.POST(new Request('https://odin.test/api/payment', {
        method: 'POST', body: new URLSearchParams(fields),
      }));
      assert.equal(response.status, 200);
      assert.equal((await db.query('SELECT affilate FROM subscriptions')).rows[0].affilate,
        custom?.includes('premierebasics') ? 'premierebasics' : 'cinecom');
    }
  } finally { globalThis.fetch = originalFetch; await db.close(); }
});
