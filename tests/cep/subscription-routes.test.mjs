import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(new URL('../../package.json', import.meta.url));
const ts = require('typescript');
function loader(mocks) {
  const cache = new Map();
  function load(name) {
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
const req = body => new Request('https://odin.test/api/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const expired = { id: 110, next_charge_date: '2000-01-01', management_source: 'paypro' };
const blocked = { id: 109, next_charge_date: '2099-01-01', management_source: 'paypro', management_disabled: true };
const manual = { id: 108, subscription_id: -108, next_charge_date: '2099-01-01', management_source: 'manual', seats: ['owner@test.invalid'] };
const paid = { id: 107, subscription_id: '900043', next_charge_date: '2/1/2099+12:00+AM', management_source: 'paypro' };

test('website chooses valid manual/paid entitlements, excludes blocked and expired primary and invited records', async () => {
  let owned = [expired, blocked, manual, paid]; let invited = [];
  const load = loader({ '@/app/database/postgre': { query: async sql => sql.includes('FROM users') ? [{ email: 'owner@test.invalid' }] : sql.includes('ANY(seats)') ? invited : owned }, 'next/headers': { cookies: async () => ({ get: () => ({ value: 'owner' }) }) } });
  const detail = load('@/app/api/subscription/details/route');
  const check = load('@/app/api/subscription/check/route');
  assert.equal((await (await detail.POST(req({ user_id: 'owner' }))).json()).id, manual.id);
  assert.equal((await (await check.GET(req({}))).json()).id, manual.id);
  owned = [expired, blocked]; invited = [blocked, expired, paid];
  assert.equal((await (await detail.POST(req({ user_id: 'owner' }))).json()).type, 'invite');
  assert.equal((await check.GET(req({}))).status, 404);
  invited = [expired, blocked];
  assert.equal((await (await detail.POST(req({ user_id: 'owner' }))).json()).type, 'none');
});

test('manual subscription cannot call PayPro product, payment, finish or seat APIs', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Manual subscription reached billing'); };
  try {
    const load = loader({ '@/app/database/postgre': { query: async sql => sql.includes('FROM users') ? [{ email: 'owner@test.invalid' }] : [expired, blocked, manual] }, '@/lib/session': { validateSession: async () => ({ user_id: 'owner' }) }, 'next/headers': { cookies: async () => ({ get: () => ({ value: 'owner' }) }) } });
    assert.equal(await (await load('@/app/api/subscription/product/route').GET()).json(), null);
    assert.equal((await load('@/app/api/subscription/product/route').POST(req({ quantity: 3, charge: 0 }))).status, 400);
    assert.equal((await load('@/app/api/subscription/payment-details/route').GET(req({}))).status, 400);
    assert.equal((await load('@/app/api/subscription/finish/route').POST(req({ user_id: 'owner' }))).status, 400);
    assert.equal((await load('@/app/api/subscription/add-seats/route').POST(req({ quantity: 1 }))).status, 400);
  } finally { globalThis.fetch = original; }
});

test('legacy AtomX grants manual access without pricing requests and respects disable/expiry', async () => {
  const original = globalThis.fetch; const secret = process.env.ATOMX_SECRET;
  process.env.ATOMX_SECRET = 'fixture';
  let rows = [expired, blocked, manual];
  const user = { id: 1, user_id: 'owner', email: 'owner@test.invalid', password: 'fixture' };
  const route = loader({ bcrypt: { compareSync: () => true }, '@/app/database/postgre': { query: async sql => sql.includes('FROM users') ? user : sql.includes('ANY(seats)') ? [] : rows } })('@/app/api/dumb-query/route');
  globalThis.fetch = async () => { throw new Error('Manual subscription reached pricing'); };
  const post = type => route.POST(new Request('https://odin.test/api/dumb-query', { method: 'POST', headers: { 'Content-Type': 'application/json', 'AtomX-Secure-Check': 'fixture' }, body: JSON.stringify({ type, uuid: 'owner', email: user.email, password: 'fixture' }) }));
  try {
    for (const type of ['login', 'recheck']) {
      const data = await (await post(type)).json();
      assert.equal(data.status, 'active'); assert.equal(data.price, 0);
    }
    rows = [expired, blocked, { ...manual, management_disabled: true }];
    for (const type of ['login', 'recheck']) assert.equal((await (await post(type)).json()).status, null);
  } finally { globalThis.fetch = original; if (secret === undefined) delete process.env.ATOMX_SECRET; else process.env.ATOMX_SECRET = secret; }
});

test('owner cancellation awaits PayPro confirmation and uses remote ID; failure never writes success', async () => {
  const original = globalThis.fetch;
  const saved = [process.env.PAYPRO_VENDOR_ACCOUNT_ID, process.env.PAYPRO_API_SECRET_KEY];
  process.env.PAYPRO_VENDOR_ACCOUNT_ID = '123'; process.env.PAYPRO_API_SECRET_KEY = 'private';
  const calls = []; const updates = []; let session = null; let success = false;
  const route = loader({ '@/lib/session': { validateSession: async () => session }, '@/app/database/postgre': { query: async (sql, args) => { if (sql.startsWith('UPDATE')) { updates.push(args); return []; } return [expired, blocked, paid]; } } })('@/app/api/subscription/finish/route');
  globalThis.fetch = async (_url, options) => { calls.push(JSON.parse(options.body)); return Response.json({ isSuccess: success, request: { apiSecretKey: 'private' } }); };
  try {
    assert.equal((await route.POST(req({ user_id: 'owner' }))).status, 401);
    session = { user_id: 'owner' };
    assert.equal((await route.POST(req({ user_id: 'other' }))).status, 400);
    assert.equal((await route.POST(req({ user_id: 'owner' }))).status, 502);
    assert.equal(updates.length, 0);
    assert.equal(calls[0].subscriptionId, 900043);
    success = true;
    const response = await route.POST(req({ user_id: 'owner', reason: '' }));
    assert.equal(response.status, 200);
    assert.equal(JSON.stringify(await response.json()).includes('private'), false);
    assert.deepEqual(updates, [[107]]);
  } finally {
    globalThis.fetch = original;
    for (const [key, value] of [['PAYPRO_VENDOR_ACCOUNT_ID', saved[0]], ['PAYPRO_API_SECRET_KEY', saved[1]]]) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
