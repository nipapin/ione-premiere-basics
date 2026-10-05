import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createCepAuth, normalizeCode } from '../../src/lib/cep-auth.ts';
import { cepReturnPath } from '../../src/lib/cep-return.ts';
import { odinCatalog, odinPackUrl } from '../../src/lib/cep-market.ts';

const db = new PGlite();
let queue = Promise.resolve();
const query = async (sql, args) => {
  const result = await db.query(sql, args);
  return { ...result, rowCount: result.affectedRows ?? result.rows.length };
};
// A single PostgreSQL connection: serialize transactions as a real pool would.
const pool = { query, connect: async () => {
  const previous = queue;
  let release;
  queue = new Promise(resolve => { release = resolve; });
  await previous;
  return { query, release };
} };
const auth = createCepAuth(pool, 2);
const start = (usp) => auth.start({ usp, device: { user: usp, os: 'Windows' }, ip: '127.0.0.1' });
async function login(usp, userId = '1') {
  const session = await start(usp);
  await auth.confirm(session.code, userId, 'approve');
  return { session, result: await auth.claim(session.code, session.device_code) };
}
before(async () => {
  await db.exec(`CREATE TABLE users (user_id integer PRIMARY KEY, email text, name text);
    INSERT INTO users VALUES (1, 'one@example.test', 'One'), (2, 'two@example.test', 'Two');
    CREATE TABLE subscriptions (id serial PRIMARY KEY, user_id integer, status text, order_item_name text, next_charge_date timestamptz, seats text[]);`);
  await db.exec(await readFile(new URL('../../db/migrations/2026_09_29_odin_cep_auth.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../../db/migrations/2026_10_05_001_subscription_management.sql', import.meta.url), 'utf8'));
});
after(() => db.close());

test('validation rejects external redirects and malformed codes', () => {
  assert.equal(normalizeCode('abcd1234'), 'ABCD1234');
  assert.equal(normalizeCode('A'.repeat(100)), null);
  for (const path of ['https://evil.test/cep/login?code=ABCD1234', 'https://evil.test/?cep=ABCD1234', '//evil.test', '/account', '/cep/login?code=invalid', '/?cep=invalid', '/pricing?cep=ABCD1234']) assert.equal(cepReturnPath(path), undefined);
  assert.equal(cepReturnPath('/cep/login?code=abcd1234&next=https://evil.test'), '/?cep=ABCD1234');
  assert.equal(cepReturnPath('/?cep=abcd1234&next=https://evil.test'), '/?cep=ABCD1234');
});
test('pending, wrong secret, denial and expiration never issue tokens', async () => {
  const session = await start('denied');
  assert.equal((await auth.claim(session.code, session.device_code)).status, 'pending');
  assert.equal((await auth.claim(session.code, '0'.repeat(64))).status, 'expired');
  assert.equal((await auth.claim(session.code, undefined)).status, 'expired');
  await auth.confirm(session.code, '1', 'deny');
  assert.equal((await auth.claim(session.code, session.device_code)).status, 'denied');
  assert.equal(await auth.confirm(session.code, '1', 'approve'), null);
  const expired = await start('expired');
  await query("UPDATE odin_cep_auth_sessions SET expires_at = NOW() - INTERVAL '1 second' WHERE code = $1", [expired.code]);
  assert.equal(await auth.confirm(expired.code, '1', 'approve'), null);
  assert.equal((await auth.claim(expired.code, expired.device_code)).status, 'expired');
});
test('approved token is claimed once, stored hashed and restored through /me', async () => {
  const session = await start('first');
  await auth.confirm(session.code, '1', 'approve');
  const claims = await Promise.all([auth.claim(session.code, session.device_code), auth.claim(session.code, session.device_code)]);
  assert.equal(claims.filter(c => c.status === 'complete').length, 1);
  assert.equal(claims.filter(c => c.status === 'expired').length, 1);
  const result = claims.find(c => c.token);
  const identity = await auth.authenticate(`Bearer ${result.token}`);
  assert.ok(identity);
  const profile = await auth.profile(identity);
  assert.equal(profile.user.id, '1');
  assert.equal(profile.tier, 'free');
  assert.equal(profile.devices[0].current, true);
  assert.equal(await auth.authenticate(`Bearer ${result.token}wrong`), null);
  const stored = await query('SELECT token_hash FROM odin_cep_devices WHERE id = $1', [identity.id]);
  assert.notEqual(stored.rows[0].token_hash, result.token);
  assert.equal(stored.rows[0].token_hash.length, 64);
});
test('device limit, cross-account replacement rejection, replacement and revocation', async () => {
  const second = await login('second');
  assert.equal(second.result.status, 'complete');
  const third = await login('third');
  assert.equal(third.result.status, 'device_limit');
  assert.equal(third.result.devices.length, 2);
  const other = await login('other', '2');
  const otherIdentity = await auth.authenticate(`Bearer ${other.result.token}`);
  const rejected = await auth.claim(third.session.code, third.session.device_code, otherIdentity.id);
  assert.equal(rejected.status, 'expired');
  assert.ok(await auth.authenticate(`Bearer ${other.result.token}`));
  const secondIdentity = await auth.authenticate(`Bearer ${second.result.token}`);
  const replaced = await auth.claim(third.session.code, third.session.device_code, secondIdentity.id);
  assert.equal(replaced.status, 'complete');
  assert.equal(await auth.authenticate(`Bearer ${second.result.token}`), null);
  const identity = await auth.authenticate(`Bearer ${replaced.token}`);
  assert.equal(await auth.revoke('2', identity.id), false);
  assert.equal(await auth.revoke('1', identity.id), true);
  assert.equal(await auth.authenticate(`Bearer ${replaced.token}`), null);
});
test('same machine reuses its seat and subscription includes invited seats', async () => {
  const first = await login('first');
  assert.equal(first.result.status, 'complete');
  const identity = await auth.authenticate(`Bearer ${first.result.token}`);
  await query("INSERT INTO subscriptions (user_id,status,order_item_name,next_charge_date,seats) VALUES (2, 'Active', 'Odin Pro', NOW() + INTERVAL '1 month', ARRAY['one@example.test'])");
  const profile = await auth.profile(identity);
  assert.equal(profile.tier, 'subscribed');
  assert.equal(profile.subscription.active, true);
  await query("UPDATE odin_cep_devices SET expires_at = NOW() - INTERVAL '1 second' WHERE id = $1", [identity.id]);
  assert.equal(await auth.authenticate(`Bearer ${first.result.token}`), null);
});
test('rate limit is persisted', async () => {
  assert.equal(await auth.rateLimit('ip-test', 'device', 1, 300), true);
  assert.equal(await auth.rateLimit('ip-test', 'device', 1, 300), false);
});

test('catalog isolates Odin host packs and grants install only to subscribers', async () => {
  const request = async (url, options) => {
    assert.equal(new URL(url).searchParams.get('king'), 'Premiere Basics');
    assert.equal(options.headers.Authorization, undefined);
    return Response.json({ market: { Packages: [
      { id: 275, name: 'Odin Pro for Premiere Pro', author: 'Premiere Basics', primary_type: 'PR', image_url: 'http://example.test/odin.jpg' },
      { id: 283, name: 'Odin Pro for After Effects', author: 'Premiere Basics', primary_type: 'AE', image_url: 'https://example.test/ae.jpg' },
      { id: 1, name: 'Other', author: 'Other', primary_type: 'PR', image_url: '' },
    ] } });
  };
  const free = await odinCatalog(false, 'PR', request);
  assert.equal(free.Packages.length, 1);
  assert.equal(free.Packages[0].action, 'buy');
  assert.equal(free.Packages[0].covered_by_subscription, false);
  assert.equal(free.Packages[0].image_url, 'https://example.test/odin.jpg');
  const paid = await odinCatalog(true, 'AE', request);
  assert.equal(paid.Packages[0].id, 283);
  assert.equal(paid.Packages[0].action, 'install');
  assert.equal(paid.Packages[0].install_url, '/api/cep/market/download?pack_id=283');
  await assert.rejects(odinCatalog(true, 'PR', async () => Response.json({})), /Invalid Odin catalog/);
});

test('pack downloads map Adobe host IDs and reject unexpected redirect hosts', async () => {
  const expected = 'https://odin-pro.4dd38e93681ae447cac2c65dca9aef09.r2.cloudflarestorage.com/PR.zip?signature=test';
  for (const [host, adobe] of [['AE', 'AEFT'], ['PR', 'PPRO']]) {
    assert.equal(await odinPackUrl(host, async url => {
      assert.equal(new URL(url).searchParams.get('host'), adobe);
      return Response.json({ success: true, url: expected });
    }), expected);
  }
  for (const url of ['https://evil.test/pack.zip', expected.replace('https:', 'http:'), expected.replace('https://', 'https://user:password@')]) {
    await assert.rejects(odinPackUrl('PR', async () => Response.json({ success: true, url })), /Unexpected Odin download host/);
  }
});
