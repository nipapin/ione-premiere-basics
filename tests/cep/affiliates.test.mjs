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
    const { getAffiliateLinks } = loader({ '@/app/database/postgre': {} })('@/lib/affiliate-access');
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
      CREATE TABLE odin_affiliate_links(code text PRIMARY KEY,label text,owner_user_id text,created_at timestamptz DEFAULT NOW());
      CREATE TABLE odin_affiliate_partners(id uuid,name text,user_id text);
      CREATE TABLE odin_affiliate_partner_links(partner_id uuid,code text);
      CREATE TABLE subscriptions(affilate text,status text,is_trial boolean,quantity integer);
      INSERT INTO subscriptions VALUES ('cinecom','active',false,3),('cinecom','cancelled',false,1),
        ('cinecom','on-hold',false,1),('cinecom','active',true,1),('cinecom','failed',false,1),
        ('premierebasics','active',false,99),('unconfigured','active',false,20),(NULL,'active',false,5);
      CREATE TABLE payments(affilate text,status text,amount numeric);
      INSERT INTO payments VALUES ('cinecom','Processed',12),('cinecom','Declined',90),
        ('premierebasics','Processed',50);`);
    process.env.ODIN_AFFILIATE_ACCESS = JSON.stringify({ partner: ['cinecom', 'aftereffectsbasics'] });
    const route = loader({ '@/app/database/postgre': { query }, '@/lib/session': { validateSession: async () => session }, '@/lib/csrf': {} })('@/app/api/affilates/route');
    assert.equal((await route.GET()).status, 401);
    assert.equal(calls.length, 0);
    session = { user_id: 'outsider' };
    assert.equal((await route.GET()).status, 403);
    assert.equal(calls.length, 2);
    session = { user_id: 'deleted' };
    assert.equal((await route.GET()).status, 403);
    session = { user_id: 'partner' };
    const response = await route.GET(new Request('https://odin.test/api/affilates?user_id=admin&ref=premierebasics'));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.deepEqual(await response.json(), [
      { affiliate: 'cinecom', label: 'cinecom', subscriptions: 5, licenses: 7, trials: 1, statuses: { active: 2, cancelled: 1, 'on-hold': 1, failed: 1 }, oneTimeOrders: 1 },
      { affiliate: 'aftereffectsbasics', label: 'aftereffectsbasics', subscriptions: 0, licenses: 0, trials: 0, statuses: {}, oneTimeOrders: 0 },
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
      '@/lib/paypro-sales': { recordPayproSale: async () => {} },
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

test('links persist, reserved codes cannot be claimed, and only authorized accounts can create or choose owners', async () => {
  const db = new PGlite();
  const saved = process.env.ODIN_AFFILIATE_ACCESS;
  const admin = '00000000-0000-4000-8000-000000000001';
  const partner = '00000000-0000-4000-8000-000000000002';
  const outsider = '00000000-0000-4000-8000-000000000003';
  const owner = '00000000-0000-4000-8000-000000000004';
  let session = null;
  const query = async (sql, args) => (await db.query(sql, args)).rows;
  const mocks = {
    '@/app/database/postgre': { query },
    '@/lib/session': { validateSession: async () => session },
    '@/lib/csrf': { validateCsrfToken: async token => token === 'valid' },
  };
  const route = loader(mocks)('@/app/api/affilates/route');
  const post = body => route.POST(new Request('https://odin.test/api/affilates', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csrfToken: 'valid', ...body }),
  }));
  try {
    await db.exec(`CREATE TABLE users(user_id uuid PRIMARY KEY,email text,is_admin boolean);
      INSERT INTO users VALUES ('${admin}','admin@test.invalid',true),('${partner}','partner@test.invalid',false),
        ('${outsider}','outsider@test.invalid',false),('${owner}','owner@test.invalid',false);
      CREATE TABLE subscriptions(affilate text,status text,is_trial boolean,quantity integer);
      INSERT INTO subscriptions VALUES ('old-campaign','active',false,2);
      CREATE TABLE payments(affilate text,status text,amount numeric);
      INSERT INTO payments VALUES ('old-payment','Processed',10);`);
    await db.exec(readFileSync(new URL('../../db/migrations/2026_10_11_001_affiliate_links.sql', import.meta.url), 'utf8'));
    await db.exec(readFileSync(new URL('../../db/migrations/2026_10_12_001_sales_dashboard.sql', import.meta.url), 'utf8'));
    assert.equal((await query('SELECT * FROM odin_affiliate_links')).length, 5);
    assert.equal((await query('SELECT * FROM subscriptions')).length, 1);
    assert.equal((await query('SELECT * FROM payments')).length, 1);
    assert.equal((await query("SELECT owner_user_id FROM odin_affiliate_links WHERE code = 'old-campaign'"))[0].owner_user_id, null);
    process.env.ODIN_AFFILIATE_ACCESS = JSON.stringify({ [partner]: ['cinecom'], [owner]: ['reserved-config'] });
    assert.equal((await post({ code: 'new-link' })).status, 401);
    session = { user_id: outsider };
    assert.equal((await post({ code: 'new-link' })).status, 403);
    session = { user_id: admin };
    assert.equal((await post({ code: 'new-link', csrfToken: 'wrong' })).status, 403);
    for (const code of ['', 'ab', '-bad', 'bad-', 'bad/code', 'bad code', 'a'.repeat(65), 5]) {
      assert.equal((await post({ code })).status, 400);
    }
    assert.equal((await post({ code: 'new-link', label: 'x'.repeat(81) })).status, 400);
    assert.equal((await post({ code: 'new-link', ownerEmail: 'missing@test.invalid' })).status, 400);
    for (const code of ['cinecom', 'old-campaign', 'old-payment', 'reserved-config']) {
      assert.equal((await post({ code })).status, 409);
    }
    // Webhooks may have stored another historical code after the migration.
    await db.exec("INSERT INTO payments VALUES ('new-history','Processed',20)");
    assert.equal((await post({ code: 'new-history' })).status, 409);
    const created = await post({ code: ' YouTube-October ', label: 'YouTube October', ownerEmail: ' OWNER@TEST.INVALID ' });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), { code: 'youtube-october', label: 'YouTube October' });
    assert.equal((await query("SELECT owner_user_id,created_by FROM odin_affiliate_links WHERE code='youtube-october'"))[0].owner_user_id, owner);
    assert.equal((await post({ code: 'youtube-october', ownerEmail: 'outsider@test.invalid' })).status, 409);
    const raced = await Promise.all([post({ code: 'concurrent-link' }), post({ code: 'concurrent-link' })]);
    assert.deepEqual(raced.map(response => response.status).sort(), [201, 409]);
    session = { user_id: partner };
    assert.equal((await post({ code: 'partner-other', ownerEmail: 'owner@test.invalid' })).status, 403);
    const own = await post({ code: 'partner-own', ownerUserId: admin });
    assert.equal(own.status, 201);
    assert.equal((await query("SELECT owner_user_id FROM odin_affiliate_links WHERE code='partner-own'"))[0].owner_user_id, partner);
    const partnerStats = await (await route.GET()).json();
    assert.deepEqual(partnerStats.map(row => row.affiliate), ['cinecom', 'partner-own']);
    assert.equal(partnerStats.some(row => row.affiliate === 'youtube-october'), false);
    // A newly assigned owner has access without any environment allowlist.
    delete process.env.ODIN_AFFILIATE_ACCESS;
    session = { user_id: owner };
    const persisted = await (await loader(mocks)('@/app/api/affilates/route').GET()).json();
    assert.deepEqual(persisted, [{ affiliate: 'youtube-october', label: 'YouTube October', subscriptions: 0, licenses: 0, trials: 0, statuses: {}, oneTimeOrders: 0 }]);
    assert.equal((await post({ code: 'owner-followup' })).status, 201);
    await db.exec("INSERT INTO payments VALUES ('youtube-october','Processed',30)");
    assert.equal((await (await route.GET()).json()).find(row => row.affiliate === 'youtube-october').oneTimeOrders, 1);
    session = { user_id: outsider };
    assert.equal((await route.GET()).status, 403);
    await query('DELETE FROM users WHERE user_id=$1', [owner]);
    assert.equal((await query("SELECT owner_user_id FROM odin_affiliate_links WHERE code='youtube-october'"))[0].owner_user_id, null);
    session = { user_id: admin };
    assert.equal((await post({ code: 'youtube-october' })).status, 409);
  } finally {
    await db.close();
    if (saved === undefined) delete process.env.ODIN_AFFILIATE_ACCESS; else process.env.ODIN_AFFILIATE_ACCESS = saved;
  }
});
