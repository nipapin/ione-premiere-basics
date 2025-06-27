import { query } from "@/app/database/postgre";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const parseDate = (date: string) => {
	return new Date(date.split("+").join(" "));
};

const getProduct = async (user_id: string) => {
	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user_id]).then((res) => res[0]);

	if (!subscription) {
		return null;
	}

	const product = await fetch("https://store.payproglobal.com/api/Products/GetProductPricing", {
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
		.then((data) => {
			console.log(data);
			return data.response.productPricings[0];
		});

	const { logoUrl, name, displayPrice } = product;
	const daysBeforeCharge = Math.ceil(
		(parseDate(subscription.next_charge_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
	);

	return {
		logoUrl,
		name,
		displayPrice,
		quantity: subscription.quantity,
		next_quantity: subscription.next_quantity,
		daysBeforeCharge
	};
};

export async function GET() {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	if (!user_id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const product = await getProduct(user_id);

	return NextResponse.json(product);
}

export async function POST(request: NextRequest) {
	const cookieStore = await cookies();
	const { quantity, charge } = await request.json();

	const user_id = cookieStore.get("odin-pro-session")?.value;

	if (!user_id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user_id]).then((res) => res[0]);

	if (!subscription) {
		return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
	}

	if (quantity < subscription.quantity) {
		await query(`UPDATE subscriptions SET next_quantity = $1 WHERE user_id = $2`, [String(quantity), user_id]);
	} else if (quantity > subscription.quantity) {
		await query(`UPDATE subscriptions SET next_quantity = $1, quantity = $1, seats = $2 WHERE user_id = $3`, [
			String(quantity),
			[...subscription.seats, ...Array(quantity - subscription.next_quantity).fill("")],
			user_id
		]);
		const chargeSuccess = await fetch("https://store.payproglobal.com/api/Orders/DoReferenceCharge", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				referencedOrderId: subscription.order_id,
				productId: subscription.product_id,
				priceCurrencyCode: "USD",
				priceValue: Number(charge.toFixed(2)),
				referenceChargeName: `Add seat to ${subscription.order_item_name}`,
				vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
				apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
			})
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				return true;
			})
			.catch((err) => false);

		if (!chargeSuccess) {
			return NextResponse.json({ error: "Failed to charge" }, { status: 400 });
		}
	} else {
		return NextResponse.json({ error: "Quantity is the same as the current quantity" }, { status: 400 });
	}

	const product = await getProduct(user_id);

	return NextResponse.json({ success: true, product });
}

// export async function POST(request: NextRequest) {
// 	const { subscription } = await request.json();

// 	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user.user_id]).then(
// 		(res) => res[0]
// 	);

// 	const quantity = 2;

// 	const subscriptionPrice = await fetch("https://store.payproglobal.com/api/Products/GetProductPricing", {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json"
// 		},
// 		body: JSON.stringify({
// 			products: [{ productId: subscription.product_id }],
// 			vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
// 			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
// 		})
// 	})
// 		.then((res) => res.json())
// 		.then((data) => data.response.productPricings[0].billingUnitPrice);

// 	const nextChargeDate = parseDate(subscription.next_charge_date);
// 	const numberOfDaysToCharge = Math.ceil((nextChargeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
// 	const chargeAmount = (subscriptionPrice * quantity * numberOfDaysToCharge) / 30;

// 	fetch("https://store.payproglobal.com/api/Orders/DoReferenceCharge", {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json"
// 		},
// 		body: JSON.stringify({
// 			referencedOrderId: subscription.order_id,
// 			productId: subscription.product_id,
// 			priceCurrencyCode: "USD",
// 			priceValue: Number(chargeAmount.toFixed(2)),
// 			referenceChargeName: `Add seat to ${subscription.order_item_name}`,
// 			vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
// 			apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
// 		})
// 	})
// 		.then((res) => res.json())
// 		.then((data) => {
// 			console.log(data);
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 		});

// 	return NextResponse.json(product);
// }
