"use server";
import { Pool } from "pg";

const pool = new Pool({
	host: "85.92.108.114",
	port: 5432,
	user: "odin",
	password: "QuasW3x#x0rt",
	database: "odin"
	// connectionString: "postgres://odin:QuasW3x#x0rt@85.92.108.114:5432/odin"
});

export const query = async (text: string, params?: any[] | undefined) => {
	return await pool
		.query(text, params || [])
		.then((res) => res.rows)
		.catch((err) => {
			console.error("PG Error", err);
			throw err;
		});
};
