import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { loadDatabaseConfig } from '../db/config.mjs';
import { normalizePayproOrder, saveSales } from '../db/paypro-sales.mjs';

const args = process.argv.slice(2);
const file = args[args.indexOf('--file') + 1];
if (!args.includes('--file') || !file) throw new Error('Pass --file with the sanitized PayPro export');
const data = JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
if (data.failures?.length) throw new Error('Export contains failed reads; finish the export before importing');
const refs = new Map(data.subscriptions.filter(row => row.affilate).map(row => [String(row.subscription_id), row.affilate]));
const rows = data.orders.flatMap(order => normalizePayproOrder(order, refs));
if (!args.includes('--apply')) {
  console.log(JSON.stringify({ dryRun: true, rows: rows.length, orders: data.orders.length }));
} else {
  const config = loadDatabaseConfig();
  if (args.includes('--local') && !['127.0.0.1', 'localhost', '::1'].includes(config.host)) throw new Error('Local import requires a loopback database');
  const pool = new pg.Pool(config);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await saveSales(client, rows);
    await client.query('COMMIT');
    console.log(JSON.stringify({ imported: rows.length }));
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}
