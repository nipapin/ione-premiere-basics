import pg from "pg";
import { runMigrations } from "./migration-runner.mjs";
import { loadDatabaseConfig } from "../db/config.mjs";

let pool;
let client;
try {
  console.log("[migrate] Loading website database settings from environment…");
  pool = new pg.Pool({
    ...loadDatabaseConfig(),
    max: 1,
    connectionTimeoutMillis: 10000,
    statement_timeout: 120000,
    query_timeout: 125000,
    lock_timeout: 10000,
  });
  console.log("[migrate] Connecting to PostgreSQL (timeout: 10 seconds)…");
  client = await pool.connect();
  console.log("[migrate] Connected.");
  await runMigrations(client, new URL("../db/migrations/", import.meta.url));
} catch (error) {
  console.error("[migrate] Failed:", error instanceof Error ? error.message : "Unknown error");
  if (pool && !client) console.error("[migrate] Check the database host, port and network access from this server.");
  process.exitCode = 1;
} finally {
  client?.release(true);
  await pool?.end();
}
