import nextEnv from "@next/env";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function loadDatabaseConfig() {
  nextEnv.loadEnvConfig(projectRoot, process.env.NODE_ENV === "development");
  return databaseConfig(process.env);
}

export function databaseConfig(env) {
  const value = key => env[key]?.trim();
  const fields = {
    host: value("HOST_URL"),
    user: value("HOST_NAME"),
    password: env.HOST_PASS,
    database: value("HOST_DB"),
  };
  const names = { host: "HOST_URL", user: "HOST_NAME", password: "HOST_PASS", database: "HOST_DB" };
  const missing = Object.entries(fields).filter(([, v]) => v === undefined || v === "").map(([key]) => names[key]);
  if (!value("HOST_PORT")) missing.push("HOST_PORT");
  if (missing.length) throw new Error(`Database settings missing in .env: ${missing.join(", ")}`);
  const port = Number(value("HOST_PORT"));
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid HOST_PORT in .env");
  return { ...fields, port };
}
