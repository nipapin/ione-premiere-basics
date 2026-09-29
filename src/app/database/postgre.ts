"use server";
import { pool } from "./pool";



type QueryOptions = {
	single?: boolean;
};

export const query = async (text: string, params?: any[] | undefined, options?: QueryOptions) => {
	return await pool
		.query(text, params || [])
		.then((res) => (options?.single ? res.rows[0] : res.rows))
		.catch((err) => {
			console.error("PG Error", err);
			throw err;
		});
};
