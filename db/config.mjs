import nextEnv from "@next/env";
import { fileURLToPath } from "node:url";

export function loadDatabaseConfig() {
  nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)), process.env.NODE_ENV === "development");
  return databaseConfig(process.env);
}

export function databaseConfig(env) {
  const value = (...keys) => keys.map(key => env[key]?.trim()).find(Boolean);
  const connectionString = value("DATABASE_URL", "POSTGRES_URL");
  if (connectionString) return { connectionString };
  const fields = {
    host: value("POSTGRES_HOST", "DB_HOST", "PGHOST"),
    user: value("POSTGRES_USER", "DB_USER", "DB_USERNAME", "PGUSER"),
    password: env.POSTGRES_PASSWORD ?? env.DB_PASSWORD ?? env.PGPASSWORD,
    database: value("POSTGRES_DB", "POSTGRES_DATABASE", "DB_DATABASE", "DB_NAME", "PGDATABASE"),
  };
  const missing = Object.entries(fields).filter(([, v]) => v === undefined || v === "").map(([key]) => key);
  if (missing.length) throw new Error(`Database settings missing: ${missing.join(", ")}. Set DATABASE_URL or POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB in .env.`);
  const port = Number(value("POSTGRES_PORT", "DB_PORT", "PGPORT") || "5432");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid database port in .env");
  return { ...fields, port };
}
