import { readFile } from "node:fs/promises";
import { pool } from "../db/pool.mjs";

const migration = "2026_09_29_odin_cep_auth.sql";
let client;
try {
  const sql = await readFile(new URL(`../db/migrations/${migration}`, import.meta.url), "utf8");
  client = await pool.connect();
  console.log(`[migrate] Applying ${migration}…`);
  // The SQL file wraps its changes in BEGIN/COMMIT and supports repeat runs.
  await client.query(sql);
  console.log("[migrate] Odin CEP migration applied successfully.");
} catch (error) {
  if (client) await client.query("ROLLBACK").catch(() => {});
  console.error("[migrate] Failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
