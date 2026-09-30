import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import { createMotionflowManagement, effectiveCepAccess } from '../../src/lib/motionflow-management.ts';
import { integrationAuthorized } from '../../src/lib/motionflow-integration-auth.ts';
import { createCepAuth } from '../../src/lib/cep-auth.ts';
import { odinCatalog, odinPackUrl, odinDiffUrl } from '../../src/lib/cep-market.ts';

const db = new PGlite();
const query = async (sql, args) => { const r = await db.query(sql, args); return { ...r, rowCount: r.affectedRows ?? r.rows.length }; };
const pool = { query, connect: async () => ({ query, release() {} }) };
const management = createMotionflowManagement(pool);
const auth = createCepAuth(pool);
const mutation = (action, extra = {}) => management.change({ user_id: '1', actor: 'admin@test.invalid', reason: 'Support request', action, ...extra });
const require = createRequire(import.meta.url);
async function routeModule(path, mocks) {
  const source = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(specifier => {
    if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
    if (specifier.startsWith('@/')) throw new Error(`Unmocked dependency: ${specifier}`);
    return require(specifier);
  }, module, module.exports);
  return module.exports;
}

before(async () => {
  await db.exec(`CREATE TABLE users (user_id integer PRIMARY KEY, email text, name text, lastname text);
    INSERT INTO users VALUES (1, 'first@test.invalid', 'First', 'User'), (2, 'second@test.invalid', 'Second', 'User');
    CREATE TABLE subscriptions (id serial PRIMARY KEY, user_id integer, status text, order_item_name text, next_charge_date text, quantity integer, seats text[]);
    INSERT INTO subscriptions (user_id, status, order_item_name, next_charge_date, quantity, seats)
      VALUES (2, 'active', 'Odin Pro', '2099-01-01T00:00:00Z', 2, ARRAY['first@test.invalid']);`);
  await db.exec(await readFile(new URL('../../db/migrations/2026_09_29_odin_cep_auth.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../../db/migrations/2026_09_30_002_motionflow_management.sql', import.meta.url), 'utf8'));
});
after(() => db.close());

test('bridge rejects missing, short or incorrect secrets', () => {
  assert.equal(integrationAuthorized(null, undefined), false);
  assert.equal(integrationAuthorized('Bearer short', 'short'), false);
  assert.equal(integrationAuthorized('Bearer ' + 'a'.repeat(32), 'b'.repeat(32)), false);
  assert.equal(integrationAuthorized('Bearer ' + 'a'.repeat(32), 'a'.repeat(32)), true);
});
test('search escapes wildcards and details include invited seats without secrets', async () => {
  assert.equal((await management.list('First', 1)).total, 1);
  assert.equal((await management.list('%', 1)).total, 0);
  const d = await management.detail('1');
  assert.equal(d.subscription_active, true);
  assert.equal(d.extension_access, true);
  assert.equal(d.subscriptions[0].owner_id, '2');
  assert.deepEqual(Object.keys(d.user).sort(), ['email', 'id', 'lastname', 'name']);
  assert.equal(await management.detail('missing'), null);
});
test('deny and reset affect CEP access, preserve payment rows, and audit the actor', async () => {
  process.env.MOTIONFLOW_MANAGEMENT_ENABLED = 'true';
  const before = (await query('SELECT * FROM subscriptions')).rows;
  await mutation('revoke');
  assert.equal((await management.detail('1')).extension_access, false);
  assert.equal((await auth.profile({ id: 'device', user_id: '1' })).subscription.active, false);
  await mutation('reset');
  assert.equal((await auth.profile({ id: 'device', user_id: '1' })).subscription.active, true);
  assert.deepEqual((await query('SELECT * FROM subscriptions')).rows, before);
  const audit = (await management.detail('1')).audit;
  assert.equal(audit.length, 2);
  assert.equal(audit[0].actor, 'admin@test.invalid');
  delete process.env.MOTIONFLOW_MANAGEMENT_ENABLED;
});
test('grant expires back to billing and invalid changes leave no audit or access rows', async () => {
  assert.equal(effectiveCepAccess(false, { mode: 'allow', expires_at: '2000-01-01' }), false);
  assert.equal(effectiveCepAccess(true, { mode: 'allow', expires_at: '2000-01-01' }), true);
  await mutation('grant', { expires_at: '2099-01-01T00:00:00Z' });
  assert.equal((await management.detail('1')).override.mode, 'allow');
  const count = (await query('SELECT count(*) FROM odin_motionflow_audit')).rows[0].count;
  await assert.rejects(mutation('grant', { expires_at: 'invalid' }), /INVALID_INPUT/);
  await assert.rejects(mutation('revoke', { reason: '' }), /INVALID_INPUT/);
  await assert.rejects(mutation('revoke', { user_id: 'missing' }), /NOT_FOUND/);
  assert.equal((await query('SELECT count(*) FROM odin_motionflow_audit')).rows[0].count, count);
});
test('device revocation is scoped to its Odin account and never returns token hashes', async () => {
  await query(`INSERT INTO odin_cep_devices (id, user_id, fingerprint, token_hash, device, ip)
    VALUES ('d1','1','f1','secret-hash','{"user":"Desktop","os":"Windows"}','127.0.0.1'),
      ('d2','2','f2','other-hash','{}','127.0.0.1')`);
  const detail = await management.detail('1');
  assert.equal(JSON.stringify(detail).includes('secret-hash'), false);
  await assert.rejects(mutation('revoke_device', { device_id: 'd2' }), /NOT_FOUND/);
  assert.equal((await query("SELECT revoked_at FROM odin_cep_devices WHERE id='d2'")).rows[0].revoked_at, null);
  await mutation('revoke_device', { device_id: 'd1' });
  assert.equal((await management.detail('1')).devices.length, 0);
});
test('failed audit rolls back the access change', async () => {
  const prior = (await management.detail('1')).override;
  await query("ALTER TABLE odin_motionflow_audit ADD CONSTRAINT test_actor CHECK (actor <> 'audit-failure')");
  await assert.rejects(mutation('revoke', { actor: 'audit-failure' }));
  assert.deepEqual((await management.detail('1')).override, prior);
  await query('ALTER TABLE odin_motionflow_audit DROP CONSTRAINT test_actor');
});
test('Odin management route is closed without secret/flag and rejects malformed bodies', async () => {
  const { NextRequest } = require('next/server');
  const route = await routeModule('../../src/app/api/integrations/motionflow/users/route.ts', {
    '@/app/database/pool': { pool },
    '@/lib/motionflow-management': { createMotionflowManagement },
    '@/lib/motionflow-integration-auth': { integrationAuthorized },
  });
  try {
    delete process.env.MOTIONFLOW_MANAGEMENT_ENABLED;
    delete process.env.MOTIONFLOW_MANAGEMENT_SECRET;
    const url = 'https://odin.test/api/integrations/motionflow/users';
    assert.equal((await route.GET(new NextRequest(url))).status, 401);
    process.env.MOTIONFLOW_MANAGEMENT_SECRET = 'a'.repeat(32);
    const headers = { Authorization: 'Bearer ' + 'a'.repeat(32), 'Content-Type': 'application/json' };
    assert.equal((await route.GET(new NextRequest(url, { headers }))).status, 503);
    process.env.MOTIONFLOW_MANAGEMENT_ENABLED = 'true';
    assert.equal((await route.GET(new NextRequest(url + '?page=-1', { headers }))).status, 400);
    assert.equal((await route.GET(new NextRequest(url + '?q=First', { headers }))).status, 200);
    assert.equal((await route.POST(new NextRequest(url, { method: 'POST', headers, body: JSON.stringify({ user_id: {}, action: 'revoke' }) }))).status, 400);
  } finally {
    delete process.env.MOTIONFLOW_MANAGEMENT_ENABLED;
    delete process.env.MOTIONFLOW_MANAGEMENT_SECRET;
  }
});
test('CEP route never signs paid downloads for non-subscribers; only managed demos are free', async () => {
  const { NextRequest } = require('next/server');
  let authenticated = false;
  let managed = true;
  let version = '1.2.0';
  let signed = 0;
  const route = await routeModule('../../src/app/api/cep/[...path]/route.ts', {
    '@/lib/cep-service': { cepAuth: { authenticate: async () => authenticated ? { user_id: '1' } : null, profile: async () => ({ subscription: { active: false } }), rateLimit: async () => true } },
    '@/lib/cep-auth': { CEP_CLIENT: 'odin-cep', normalizeCode: () => null },
    '@/lib/session': { validateSession: async () => null },
    '@/lib/motionflow-catalog': { usesMotionflowCatalog: () => managed },
    '@/lib/cep-market': {
      odinCatalog: async () => ({ Packages: [{ id: 275, primary_type: 'PR', version }] }),
      odinPackUrl: async (host, fetcher, id) => { assert.equal(id, 275); signed++; return 'https://packs.test/demo.zip'; },
    },
  });
  const get = () => route.GET(new NextRequest('https://odin.test/api/cep/market/download?pack_id=275'), { params: Promise.resolve({ path: ['market', 'download'] }) });
  assert.equal((await get()).status, 401);
  authenticated = true;
  assert.equal((await get()).status, 403);
  assert.equal(signed, 0);
  version = 'DEMO';
  assert.equal((await get()).status, 302);
  assert.equal(signed, 1);
  managed = false;
  assert.equal((await get()).status, 403);
  assert.equal(signed, 1);
});
test('managed catalog preserves IDs, uses only configured backend, and validates download hosts', async () => {
  Object.assign(process.env, { MOTIONFLOW_CATALOG_ENABLED: 'true', MOTIONFLOW_CATALOG_ORIGIN: 'https://motionflow.test', MOTIONFLOW_CATALOG_SECRET: 'x'.repeat(32), MOTIONFLOW_DOWNLOAD_HOSTS: 'packs.test' });
  try {
    const requests = [];
    const fetcher = async (url, options) => {
      requests.push([url.toString(), options]);
      return Response.json(url.pathname.endsWith('catalog') ? { Packages: [{ id: 542, name: 'Odin Pro', pack_name: 'Odin Pro', version: '1.2.0', primary_type: 'PR', image_url: '' }] } : { url: 'https://packs.test/pack.zip?signature=test' });
    };
    const catalog = await odinCatalog(true, 'PR', fetcher);
    assert.equal(catalog.Packages[0].id, 542);
    assert.equal(await odinPackUrl('PR', fetcher, 542), 'https://packs.test/pack.zip?signature=test');
    assert.equal(await odinDiffUrl('PR', [], () => { throw new Error('Legacy must not be called'); }), null);
    assert.ok(requests.every(([url, options]) => url.startsWith('https://motionflow.test/') && options.redirect === 'error'));
    assert.ok(requests[1][0].includes('pack_id=542'));
    await assert.rejects(odinPackUrl('PR', async () => Response.json({ url: 'https://evil.test/pack.zip' }), 542), /Unexpected download host/);
  } finally {
    for (const key of ['MOTIONFLOW_CATALOG_ENABLED', 'MOTIONFLOW_CATALOG_ORIGIN', 'MOTIONFLOW_CATALOG_SECRET', 'MOTIONFLOW_DOWNLOAD_HOSTS']) delete process.env[key];
  }
});
