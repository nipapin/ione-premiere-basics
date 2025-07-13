import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { user_id, reason } = await req.json();
	if (!user_id) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user_id]).then((res) => res[0]);

	if (!subscription) {
		return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
	}

	query(`UPDATE subscriptions SET finished = true WHERE id = $1`, [subscription.id]);

	fetch("https://store.payproglobal.com/api/Subscriptions/Finish", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			sendCustomerNotification: true,
			reasonText: reason,
			subscriptionId: subscription.id,
			vendorAccountId: Number(process.env.PAYPRO_VENDOR_ACCOUNT_ID),
			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
		})
	})
		.then((res) => res.json())
		.then((res) => {
			if (res.isSuccess) {
				return NextResponse.json({ message: "Subscription finished" }, { status: 200 });
			} else {
				return NextResponse.json({ error: res.errors[0] }, { status: 500 });
			}
		});

	return NextResponse.json({ message: "Subscription finished" }, { status: 200 });
}
