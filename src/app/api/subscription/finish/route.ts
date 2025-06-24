import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { user_id, reason } = await req.json();
	if (!user_id) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	fetch("https://store.payproglobal.com/api/Subscriptions/Finish", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			sendCustomerNotification: true,
			reasonText: reason,
			subscriptionId: 4251788,
			vendorAccountId: 170738,
			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
		})
	})
		.then((res) => res.json())
		.then((res) => console.log(JSON.stringify(res, null, 2)));

	return NextResponse.json({ message: "Subscription finished" }, { status: 200 });
}
