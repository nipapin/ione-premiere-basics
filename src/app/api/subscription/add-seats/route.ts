import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const { user, quantity } = await request.json();

	// const redirectURL = `https://store.payproglobal.com/checkout?products[1][id]=${111867}&products[1][qty]=${quantity}&page-template=20339&currency=USD&billing-first-name=${
	// 	user?.name
	// }&billing-last-name=${user?.lastname}&billing-email=${user?.email}&x-odin-user-id=${user?.user_id}`;

	const res = await fetch("https://store.payproglobal.com/api/Subscriptions/ChangeQuantity", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			subscriptionId: 4269386,
			quantity: quantity + 1,
			vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY,
			sendCustomerNotification: true
		})
	})
		.then((res) => res.json())
		.catch(console.error);

	return NextResponse.json(res);
}
