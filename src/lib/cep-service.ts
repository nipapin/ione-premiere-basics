import "server-only";
import { pool } from "@/app/database/pool";
import { createCepAuth } from "./cep-auth";

const limit = Number(process.env.CEP_DEVICE_LIMIT || 3);
export const cepAuth = createCepAuth(pool, Number.isInteger(limit) && limit > 0 ? limit : 3);
