import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

export async function runMigrations(client, directory, log = console.log) {
  const names = (await readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith(".sql"))
    .map(entry => entry.name).sort();
  log(`[migrate] Found ${names.length} SQL file(s).`);
  const migrations = await Promise.all(names.map(async name => {
    const sql = (await readFile(new URL(name, directory), "utf8")).replace(/\r\n/g, "\n");
    return { name, sql, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
  const lock = await client.query("SELECT pg_try_advisory_lock(1705101, 20260929) AS acquired");
  if (!lock.rows[0].acquired) throw new Error("Another migration process is running. Try again after it finishes.");
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS odin_schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT NOW()
    )`);
    const { rows } = await client.query("SELECT name, checksum FROM odin_schema_migrations");
    const applied = new Map(rows.map(row => [row.name, row.checksum]));
    // Validate all history before making any changes.
    for (const migration of migrations) {
      if (applied.has(migration.name) && applied.get(migration.name) !== migration.checksum) {
        throw new Error(`Applied migration changed: ${migration.name}. Restore it and add a new SQL file.`);
      }
    }
    let count = 0;
    for (const migration of migrations) {
      if (applied.has(migration.name)) {
        log(`[migrate] Skip ${migration.name} (already applied)`);
        continue;
      }
      log(`[migrate] Applying ${migration.name}…`);
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query("INSERT INTO odin_schema_migrations (name, checksum) VALUES ($1, $2)", [migration.name, migration.checksum]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw new Error(`${migration.name}: ${error instanceof Error ? error.message : error}`, { cause: error });
      }
      count++;
      log(`[migrate] Applied ${migration.name}`);
    }
    log(count ? `[migrate] Done: ${count} migration(s) applied.` : "[migrate] Database is up to date.");
  } finally {
    await client.query("SELECT pg_advisory_unlock(1705101, 20260929)").catch(() => {});
  }
}
