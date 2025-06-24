import { query } from "@/app/database/postgre";
import { NextResponse } from "next/server";

export async function GET() {
	const rows = await query("SELECT * FROM users");
	return NextResponse.json(rows);
}
