import pg from 'pg';
import { databaseConfig } from '../db/config.mjs';

let pool;
export async function deployHealth(req, res) {
  if (req.url?.split('?')[0] !== '/api/deploy-health') return false;
  let database = false;
  try {
    pool ??= new pg.Pool({ ...databaseConfig(process.env), max: 1, connectionTimeoutMillis: 2000, query_timeout: 2000 });
    await pool.query('SELECT 1');
    database = true;
  } catch { /* Report readiness without exposing connection details. */ }
  res.writeHead(database ? 200 : 503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ release: process.env.RELEASE_ID || null, database }));
  return true;
}
