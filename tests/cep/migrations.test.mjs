import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { runMigrations } from "../../scripts/migration-runner.mjs";
const require = createRequire(import.meta.url);
const { PGlite } = require("@electric-sql/pglite");

test("discovers SQL, skips applied files, applies new files, rolls back failures and detects edits", async () => {
  const db = new PGlite();
  const temp = await mkdtemp(path.join(tmpdir(), "odin-migrations-"));
  const directory = pathToFileURL(temp + path.sep);
  const logs = [];
  const client = { query: async (sql, values) => {
    if (sql.includes("pg_try_advisory_lock")) return { rows: [{ acquired: true }] };
    if (sql.includes("pg_advisory_unlock")) return { rows: [] };
    // PGlite's simple protocol executes multi-statement migration files.
    if (values) return db.query(sql, values);
    const results = await db.exec(sql);
    return results.at(-1) || { rows: [] };
  } };
  try {
    await writeFile(new URL("001.sql", directory), "CREATE TABLE example (id int PRIMARY KEY); INSERT INTO example VALUES (1);");
    await writeFile(new URL("ignored.txt", directory), "not SQL");
    await runMigrations(client, directory, line => logs.push(line));
    await runMigrations(client, directory, line => logs.push(line));
    assert.ok(logs.some(line => line.includes("Database is up to date")));
    await writeFile(new URL("002.sql", directory), "INSERT INTO example VALUES (2);");
    await runMigrations(client, directory, () => {});
    assert.equal((await db.query("SELECT * FROM example")).rows.length, 2);
    await writeFile(new URL("003.sql", directory), "INSERT INTO example VALUES (3); SELECT * FROM missing_table;");
    await assert.rejects(runMigrations(client, directory, () => {}), /003.sql/);
    assert.equal((await db.query("SELECT * FROM example")).rows.length, 2);
    assert.equal((await db.query("SELECT * FROM odin_schema_migrations")).rows.length, 2);
    await writeFile(new URL("001.sql", directory), "SELECT 1;");
    await assert.rejects(runMigrations(client, directory, () => {}), /Applied migration changed/);
    await assert.rejects(runMigrations({query: async () => ({ rows: [{ acquired: false }] })}, directory, () => {}), /Another migration/);
  } finally {
    await db.close();
    assert.equal(path.dirname(path.resolve(temp)), path.resolve(tmpdir()));
    assert.ok(path.basename(temp).startsWith("odin-migrations-"));
    await rm(temp, { recursive: true });
  }
});
