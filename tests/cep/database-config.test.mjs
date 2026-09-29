import assert from "node:assert/strict";
import { test } from "node:test";
import { databaseConfig } from "../../db/config.mjs";

test("uses the site's HOST_* variables and preserves password whitespace", () => {
  assert.deepEqual(databaseConfig({
    HOST_URL: " db.example.test ", HOST_PORT: "5433", HOST_NAME: "odin-test",
    HOST_PASS: " test password ", HOST_DB: "odin-test-db",
  }), { host: "db.example.test", port: 5433, user: "odin-test", password: " test password ", database: "odin-test-db" });
});

test("missing settings report the actual environment variable names", () => {
  assert.throws(() => databaseConfig({}), /HOST_URL, HOST_NAME, HOST_PASS, HOST_DB, HOST_PORT/);
  assert.throws(() => databaseConfig({ HOST_URL: "localhost", HOST_NAME: "test", HOST_PASS: "test", HOST_DB: "test", HOST_PORT: "invalid" }), /Invalid HOST_PORT/);
});
