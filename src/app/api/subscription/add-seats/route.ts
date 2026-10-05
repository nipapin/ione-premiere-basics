import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/session";
import { query } from "@/app/database/postgre";
import { isSubscriptionActive } from "@/lib/subscription-date";

export async function POST(request: NextRequest) {
	const session = await validateSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { quantity } = await request.json();
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity >= 100) return NextResponse.json({ error: "INVALID_QUANTITY" }, { status: 400 });
  const subscription = (await query("SELECT * FROM subscriptions WHERE user_id=$1 ORDER BY id DESC", [session.user_id])).find((sub: any) => isSubscriptionActive(sub));
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (subscription.management_source === "manual") return NextResponse.json({ error: "MANUAL_SUBSCRIPTION_NO_BILLING" }, { status: 400 });

	// const redirectURL = `https://store.payproglobal.com/checkout?products[1][id]=${111867}&products[1][qty]=${quantity}&page-template=20339&currency=USD&billing-first-name=${
	// 	user?.name
	// }&billing-last-name=${user?.lastname}&billing-email=${user?.email}&x-odin-user-id=${user?.user_id}`;

	const res = await fetch("https://store.payproglobal.com/api/Subscriptions/ChangeQuantity", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			subscriptionId: Number(subscription.subscription_id),
			quantity: quantity + 1,
			vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY,
			sendCustomerNotification: true
		})
	})
		.then((res) => res.json())
		.catch(console.error);

	return NextResponse.json({ isSuccess: res?.isSuccess === true }, { status: res?.isSuccess === true ? 200 : 502 });
}
