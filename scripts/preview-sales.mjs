// Dedicated local PostgreSQL only. No production settings or credentials are used.
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { normalizePayproOrder, saveSales } from '../db/paypro-sales.mjs';

const port = 55432;
const pool = new pg.Pool({ host: '127.0.0.1', port, user: 'odin_preview', database: 'postgres' });
const admin = '00000000-0000-4000-8000-000000000001';
const data = JSON.parse((await readFile(new URL('../.local/affiliate-preview/paypro-data.json', import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
if (data.failures.length) throw new Error('PayPro export incomplete');
try {
  const initialized = (await pool.query("SELECT to_regclass('odin_sales') AS table_name")).rows[0].table_name;
  if (!initialized) {
    await pool.query(`CREATE TABLE users(user_id uuid PRIMARY KEY,email text UNIQUE,name text,lastname text,password text,is_admin boolean,paypro_customer_id numeric);
      CREATE TABLE sessions(user_id uuid,session_id text,ip_address text,user_agent text,created_at timestamptz,expires_at timestamptz);
      CREATE TABLE payments(id serial PRIMARY KEY,user_id uuid,date text,amount numeric,status text,affilate text);
      CREATE TABLE subscriptions(id integer PRIMARY KEY,user_id uuid,order_id numeric,subscription_id numeric,product_id numeric,status text,next_charge_date text,quantity integer,is_trial boolean,affilate text,management_source text,management_disabled boolean);`);
    await pool.query('INSERT INTO users VALUES($1,$2,$3,$4,$5,true,NULL)', [admin, 'preview@odin.local', 'Local', 'Preview', await bcrypt.hash('LocalPreview123!', 10)]);
    for (const row of data.subscriptions) {
      const columns = Object.keys(row), values = Object.values(row);
      await pool.query(`INSERT INTO subscriptions(${columns.join(',')}) VALUES(${values.map((_, i) => '$' + (i + 1)).join(',')})`, values);
    }
    for (const file of ['2026_10_11_001_affiliate_links.sql', '2026_10_12_001_sales_dashboard.sql']) await pool.query(await readFile(new URL('../db/migrations/' + file, import.meta.url), 'utf8'));
    // Editable draft grouping for local review; no production ownership is changed.
    await pool.query(`INSERT INTO odin_affiliate_partner_links(partner_id,code)
      SELECT p.id,l.code FROM odin_affiliate_partners p CROSS JOIN odin_affiliate_links l
      WHERE (p.name='Jordy' AND l.code='cinecom') OR (p.name='Tymon' AND l.code IN ('premierebasics','aftereffectsbasics'))`);

  }
  const refs = new Map(data.subscriptions.filter(row => row.affilate).map(row => [String(row.subscription_id), row.affilate]));
  if (!(await pool.query("SELECT to_regclass('odin_referral_visits') AS table_name")).rows[0].table_name) await pool.query(await readFile(new URL('../db/migrations/2026_10_12_002_referral_visits.sql', import.meta.url), 'utf8'));
  await saveSales(pool, data.orders.flatMap(order => normalizePayproOrder(order, refs)));
} finally { await pool.end(); }

const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', '3100', '--hostname', '127.0.0.1'], {
  cwd: new URL('..', import.meta.url), stdio: 'inherit', windowsHide: true,
  env: { ...process.env, NODE_ENV: 'development', NEXT_DIST_DIR: '.local/affiliate-preview/next',
    HOST_URL: '127.0.0.1', HOST_PORT: String(port), HOST_NAME: 'odin_preview', HOST_PASS: 'local-preview', HOST_DB: 'postgres',
    PAYPRO_API_SECRET_KEY: '', PAYPRO_VENDOR_ACCOUNT_ID: '', PAYPRO_VALIDATION_KEY: '', ODIN_AFFILIATE_ACCESS: '',
    MAILGUN_API_KEY: '', SMTP_HOST: '127.0.0.1', SMTP_PORT: '1',
    NO_REPLY_SMTP_ALIAS: '', NO_REPLY_SMTP_PASSWORD: '', SUPPORT_SMTP_ALIAS: '', SUPPORT_SMTP_PASSWORD: '', HELP_SMTP_ALIAS: '', HELP_SMTP_PASSWORD: '', AUTH_SECRET: 'local-preview-only', NEXT_TELEMETRY_DISABLED: '1' },
});
console.log('Local review: http://127.0.0.1:3100/account/affilates · preview@odin.local / LocalPreview123!');
child.on('exit', code => { process.exitCode = code ?? 0; });
