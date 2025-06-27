import { query } from "@/app/database/postgre";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	if (!user_id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const user = await query(`SELECT * FROM users WHERE user_id = $1`, [user_id]).then((res) => res[0]);
	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user_id]).then((res) => res[0]);

	await fetch(`https://store.payproglobal.com/api/Customers/SendOnetimeLoginEmail`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			customerEmail: user.email,
			orderId: subscription.order_id,
			vendorId: process.env.PAYPRO_VENDOR_ID,
			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
		})
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.isSuccess) {
				console.log(data);
			} else {
				console.log(data.errors);
			}
		});

	return NextResponse.json(subscription);
}
