import "server-only";
import { Pool } from "pg";

export const pool = new Pool({
	host: "85.92.108.114",
	port: 5432,
	user: "odin",
	password: "QuasW3x#x0rt",
	database: "odin"
	// connectionString: "postgres://odin:QuasW3x#x0rt@85.92.108.114:5432/odin"
});
