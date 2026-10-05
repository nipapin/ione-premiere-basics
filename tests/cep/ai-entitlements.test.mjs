import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createCepAuth } from "../../src/lib/cep-auth.ts";

const db = new PGlite();
const pool = { query: async (sql, args) => {
  const result = await db.query(sql, args);
  return { ...result, rowCount: result.affectedRows ?? result.rows.length };
} };
const auth = createCepAuth(pool);
before(async () => {
  await db.exec(`CREATE TABLE users (user_id integer PRIMARY KEY, email text, name text);
    INSERT INTO users VALUES (1, 'owner@test.invalid', 'Owner'), (2, 'seat@test.invalid', 'Seat'), (3, 'free@test.invalid', 'Free');
    CREATE TABLE subscriptions (id serial PRIMARY KEY, user_id integer, status text, order_item_name text, next_charge_date timestamptz, seats text[]);`);
  for (const file of ["2026_09_29_odin_cep_auth.sql", "2026_09_30_002_motionflow_management.sql", "2026_10_05_001_subscription_management.sql"]) {
    await db.exec(await readFile(new URL("../../db/migrations/" + file, import.meta.url), "utf8"));
  }
  await db.exec(`INSERT INTO subscriptions (user_id,status,order_item_name,next_charge_date,seats)
    VALUES (1,'Active','Odin Pro',NOW() + INTERVAL '1 month',ARRAY['seat@test.invalid']);`);
});
after(() => db.close());

test("paid Odin owners and invited seats receive 100 generations; free accounts get zero", async () => {
  for (const id of ["1", "2"]) {
    const profile = await auth.profile({ id: "device", user_id: id });
    assert.equal(profile.subscription.active, true);
    assert.equal(profile.entitlements.ai_generations_limit, 100);
  }
  const free = await auth.profile({ id: "device", user_id: "3" });
  assert.equal(free.subscription.active, false);
  assert.equal(free.entitlements.ai_generations_limit, 0);
});

test("expired subscription removes the allotment for both owner and seat", async () => {
  await db.exec("UPDATE subscriptions SET next_charge_date = NOW() - INTERVAL '1 day'");
  for (const id of ["1", "2"]) {
    const profile = await auth.profile({ id: "device", user_id: id });
    assert.equal(profile.entitlements.ai_generations_limit, 0);
  }
});
