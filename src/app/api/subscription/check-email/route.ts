import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { email } = await req.json();
	const isExist = await query(`SELECT paypro_customer_id FROM users WHERE email = $1`, [email]).then((res) =>
		res.length > 0 ? res[0].paypro_customer_id : null
	);
	return NextResponse.json({ exists: !!isExist });
}
