import { query } from "@/app/database/postgre";
import { sendEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

const HTTP_WC_ATOMX_SOURCE = "195bb24881ae34";

type AtomXPaymentStatus = "active" | "on-hold" | "pending-cancel" | "cancelled" | "expired" | "failed";
type AtomXPaymentType = "Personal" | "Business" | "Team";

interface AtomXPaymentData {
	status: AtomXPaymentStatus;
	type?: AtomXPaymentType;
	assigned_author_id?: number;
	parent_order_id: number;
	order_id: number;
	product_id: number;
	generated_purchase_code: string;
	currency: string;
	item_price: number;
	billing_firstname: string;
	billing_lastname: string;
	billing_company: string;
	billing_email: string;
}

interface User {
	user_id: string;
	email: string;
}

type PayproOrderData = Record<string, string>;

const OrderStatus: Record<string, AtomXPaymentStatus> = {
	OrderCharged: "active",
	OrderRefunded: "active",
	OrderChargedBack: "active",
	OrderDeclined: "failed",
	OrderPartiallyRefunded: "active",
	SubscriptionChargeSucceed: "active",
	SubscriptionChargeFailed: "failed",
	SubscriptionSuspended: "on-hold",
	SubscriptionRenewed: "active",
	SubscriptionTerminated: "cancelled",
	SubscriptionFinished: "cancelled",
	LicenseRequested: "active",
	TrialCharge: "active",
	OrderChargebackIsWon: "active",
	OrderCustomerInformationChanged: "active",
	InstantLeadNotification: "active",
	OrderOnWaiting: "active",
	SubscriptionPaymentInfoChanged: "active"
};

const parsePayproOrder = (payproOrder: string) => {
	const payproOrderData = payproOrder.split("&").reduce((acc, item) => {
		const [key, value] = item.split("=");
		acc[key] = decodeURIComponent(value);
		return acc;
	}, {} as PayproOrderData);
	return payproOrderData;
};

const collectAtomXPayload = (payproOrderData: PayproOrderData) => {
	return {
		status: OrderStatus[payproOrderData.IPN_TYPE_NAME],
		parent_order_id: Number(payproOrderData.ORDER_ID),
		order_id: Number(payproOrderData.ORDER_ITEM_ID),
		product_id: Number(payproOrderData.PRODUCT_ID),
		generated_purchase_code: payproOrderData.HASH,
		currency: payproOrderData.ORDER_CURRENCY_CODE,
		item_price: Number(payproOrderData.ORDER_ITEM_UNIT_PRICE),
		billing_firstname: payproOrderData.CUSTOMER_FIRST_NAME,
		billing_lastname: payproOrderData.CUSTOMER_LAST_NAME,
		billing_company: payproOrderData.COMPANY_NAME,
		billing_email: payproOrderData.CUSTOMER_EMAIL
	};
};

const collectOdinSubscription = (payproOrderData: PayproOrderData, user: User) => {
	return {
		product_id: payproOrderData.PRODUCT_ID,
		order_id: payproOrderData.ORDER_ID,
		subscription_id: payproOrderData.SUBSCRIPTION_ID,
		status: OrderStatus[payproOrderData.IPN_TYPE_NAME],
		invoice: payproOrderData.INVOICE_LINK,
		is_trial: payproOrderData.IS_ON_TRIAL_PERIOD === "1",
		trial_period_till: payproOrderData.TRIAL_PERIOD_TILL,
		next_charge_date: payproOrderData.SUBSCRIPTION_NEXT_CHARGE_DATE,
		quantity: Number(payproOrderData.PRODUCT_QUANTITY),
		user_id: user?.user_id,
		customer_id: payproOrderData.CUSTOMER_ID,
		order_item_name: payproOrderData.ORDER_ITEM_NAME,
		seats: Array.from({ length: Number(payproOrderData.PRODUCT_QUANTITY) }).map((_, index) =>
			index === 0 ? user?.email : ""
		)
	};
};

export async function POST(request: NextRequest) {
	const payproOrder = await request.text();
	const payproOrderData = parsePayproOrder(payproOrder);

	const atomPayload: AtomXPaymentData = collectAtomXPayload(payproOrderData);
	console.log(payproOrderData);

	const user = await query(`SELECT user_id, email FROM users WHERE email = $1`, [payproOrderData.CUSTOMER_EMAIL], {
		single: true
	});

	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}

	const odinSubscription = collectOdinSubscription(payproOrderData, user);

	switch (payproOrderData.IPN_TYPE_NAME) {
		case "TrialCharge":
		case "SubscriptionChargeSucceed":
		case "OrderCharged":
		case "SubscriptionRenewed":
			const isSubscriptionExists = await query(
				`SELECT * FROM subscriptions WHERE subscription_id = $1`,
				[odinSubscription.subscription_id],
				{
					single: true
				}
			);
			console.log("isSubscriptionExists", isSubscriptionExists);
			if (isSubscriptionExists) {
				query(
					`UPDATE subscriptions SET status = $1, next_charge_date = $2, order_item_name = $3, is_trial = $4, trial_period_till = $5, product_id = $6 WHERE subscription_id = $7`,
					[
						odinSubscription.status,
						odinSubscription.next_charge_date,
						odinSubscription.order_item_name.replace(/\+/g, " "),
						odinSubscription.is_trial,
						odinSubscription.trial_period_till,
						odinSubscription.product_id,
						odinSubscription.subscription_id
					]
				).catch((error) => {
					console.error("Error updating subscription", error);
				});
			} else {
				query(
					`INSERT INTO subscriptions (order_id, subscription_id, status, invoice, is_trial, trial_period_till, next_charge_date, quantity, user_id, customer_id, order_item_name, seats, product_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
					[
						odinSubscription.order_id,
						odinSubscription.subscription_id || odinSubscription.order_id,
						odinSubscription.status,
						odinSubscription.invoice,
						odinSubscription.is_trial,
						odinSubscription.trial_period_till,
						odinSubscription.next_charge_date,
						odinSubscription.quantity,
						odinSubscription.user_id,
						odinSubscription.customer_id,
						odinSubscription.order_item_name.replace(/\+/g, " "),
						odinSubscription.seats,
						odinSubscription.product_id
					]
				).catch((error) => {
					console.error("Error inserting subscription", error);
				});
			}
			break;
		case "OrderCharged":
			break;
		case "SubscriptionChargeFailed":
			break;
	}

	query(`UPDATE users SET paypro_customer_id = $1 WHERE user_id = $2`, [
		odinSubscription.customer_id,
		odinSubscription.user_id
	]);

	if (odinSubscription.status === "active") {
		sendEmail(user?.email, "Your subscription is active", `<p>Your subscription is active</p>`);
	}

	fetch("https://api.get-atomx.com/atomx/v1/webhook_esubs", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"WC-AtomX-Source": HTTP_WC_ATOMX_SOURCE
		},
		body: JSON.stringify(atomPayload)
	}).catch((error) => {
		console.error(error);
		return NextResponse.json({ message: "Error" }, { status: 500 });
	});

	return NextResponse.json({ message: "Hello, world!" });
}
