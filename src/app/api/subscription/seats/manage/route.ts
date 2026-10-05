import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";
import { isSubscriptionActive, parseSubscriptionDate } from "@/lib/subscription-date";

const parseDate = (date: string) => parseSubscriptionDate(date)!;

export async function POST(request: NextRequest) {
	const { user } = await request.json();

	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user.user_id]).then(
		(res) => res.find((sub: any) => isSubscriptionActive(sub))
	);
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (subscription.management_source === "manual") return NextResponse.json({ error: "MANUAL_SUBSCRIPTION_NO_BILLING" }, { status: 400 });

	const quantity = 2;

	const subscriptionPrice = await fetch("https://store.payproglobal.com/api/Products/GetProductPricing", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			products: [{ productId: subscription.product_id }],
			vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
		})
	})
		.then((res) => res.json())
		.then((data) => data.response.productPricings[0].billingUnitPrice);

	const nextChargeDate = parseDate(subscription.next_charge_date);
	const numberOfDaysToCharge = Math.ceil((nextChargeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
	const chargeAmount = (subscriptionPrice * quantity * numberOfDaysToCharge) / 30;

	fetch("https://store.payproglobal.com/api/Orders/DoReferenceCharge", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			referencedOrderId: subscription.order_id,
			productId: subscription.product_id,
			priceCurrencyCode: "USD",
			priceValue: Number(chargeAmount.toFixed(2)),
			referenceChargeName: `Add seat to ${subscription.order_item_name}`,
			vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
		})
	})
		.then((res) => res.json())
		.then((data) => {
		})
		.catch((err) => {
			console.error(err);
		});

	return NextResponse.json({ message: "Seat added" });
}
