import "server-only";
import { Pool } from "pg";
import { loadDatabaseConfig } from "../../../db/config.mjs";

export const pool = new Pool(loadDatabaseConfig());
