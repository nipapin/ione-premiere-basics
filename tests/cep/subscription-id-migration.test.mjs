import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createOdinSubscriptionManagement } from '../../src/lib/odin-subscription-management.ts';

for (const definition of ['integer PRIMARY KEY', 'serial PRIMARY KEY', 'integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY']) {
  test(`subscription migration and manual issuance preserve the ${definition} generator`, async () => {
    const db = new PGlite();
    try {
      const userId = '00000000-0000-4000-8000-000000000001';
      await db.exec(`CREATE TABLE users (user_id uuid PRIMARY KEY, email text, name text);
        INSERT INTO users VALUES ('${userId}','internal@test.invalid','Internal');
        CREATE TABLE subscriptions (id ${definition}, user_id uuid NOT NULL, subscription_id numeric NOT NULL,
          status text NOT NULL, invoice text NOT NULL, is_trial boolean DEFAULT false, next_charge_date text NOT NULL,
          quantity integer DEFAULT 1, next_quantity integer DEFAULT 1, customer_id numeric NOT NULL, order_item_name text, seats text[]);
        INSERT INTO subscriptions (id,user_id,subscription_id,status,invoice,next_charge_date,customer_id)
          OVERRIDING SYSTEM VALUE VALUES (107,'${userId}',900043,'active','','2099-01-01',0);`);
      for (const file of ['2026_09_30_002_motionflow_management.sql','2026_10_05_001_subscription_management.sql']) {
        await db.exec(await readFile(new URL('../../db/migrations/' + file, import.meta.url), 'utf8'));
      }
      const query = async (sql,args) => { const result = await db.query(sql,args); return { ...result, rowCount: result.affectedRows ?? result.rows.length }; };
      const pool = { query, connect: async () => ({ query, release() {} }) };
      const service = createOdinSubscriptionManagement(pool);
      await service.change({ user_id: userId, actor:'internal@test.invalid', reason:'Isolated test', action:'subscription_issue',
        expires_at:'2099-01-01', plan_name:'Odin Pro', request_id:randomUUID() });
      const manual = (await db.query("SELECT id FROM subscriptions WHERE management_source='manual'")).rows[0].id;
      assert.ok(manual > 107);
      const ordinary = (await db.query(`INSERT INTO subscriptions (user_id,subscription_id,status,invoice,next_charge_date,customer_id)
        VALUES ($1,900044,'active','','2099-01-01',0) RETURNING id`, [userId])).rows[0].id;
      assert.ok(ordinary > manual);
    } finally { await db.close(); }
  });
}
