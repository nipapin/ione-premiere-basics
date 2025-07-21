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
			if (data.isSuccess) {
				return data.response.productPricings[0];
			} else {
				return null;
			}
		});

	if (!product) {
		return null;
	}

	const { logoUrl, name, displayPrice } = product;
	const daysBeforeCharge =
		name === "Odin Pro Annual Subscription"
			? Math.min(
					360,
					Math.ceil((parseDate(subscription.next_charge_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
			  )
			: Math.ceil((parseDate(subscription.next_charge_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

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
	console.log(quantity, charge);

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
		}).then((res) => res.json());
		if (!chargeSuccess.isSuccess) {
			const error = chargeSuccess.errors.reduce(
				(acc: string, curr: any) => acc + curr.propertyErrorMessages.join("\n"),
				""
			);
			return NextResponse.json({ error }, { status: 400 });
		} else {
			await query(`UPDATE subscriptions SET next_quantity = $1, quantity = $1, seats = $2 WHERE user_id = $3`, [
				String(quantity),
				[...subscription.seats, ...Array(quantity - subscription.next_quantity).fill("")],
				user_id
			]);
		}
	} else {
		return NextResponse.json({ error: "Quantity is the same as the current quantity" }, { status: 400 });
	}

	const product = await getProduct(user_id);

	return NextResponse.json({ success: true, product });
}
