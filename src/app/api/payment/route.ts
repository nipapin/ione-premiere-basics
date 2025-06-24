import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";

const HTTP_WC_ATOMX_SOURCE = "195bb24881ae34";

type AtomXPaymentStatus = "active" | "on-hold" | "pending-cancel" | "cancelled" | "expired";
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

type PayproOrderData = Record<string, string>;

const OrderStatus: Record<string, AtomXPaymentStatus> = {
	OrderCharged: "active",
	OrderRefunded: "active",
	OrderChargedBack: "active",
	OrderDeclined: "active",
	OrderPartiallyRefunded: "active",
	SubscriptionChargeSucceed: "active",
	SubscriptionChargeFailed: "active",
	SubscriptionSuspended: "active",
	SubscriptionRenewed: "active",
	SubscriptionTerminated: "active",
	SubscriptionFinished: "active",
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

export async function POST(request: NextRequest) {
	const payproOrder = await request.text();
	const payproOrderData = parsePayproOrder(payproOrder);

	const atomPayload: AtomXPaymentData = {
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

	const user = await query(`SELECT user_id FROM users WHERE email = $1`, [payproOrderData.CUSTOMER_EMAIL]).then(
		(res) => res[0]
	);

	const odinSubscription = {
		subscription_id: payproOrderData.SUBSCRIPTION_ID,
		status: OrderStatus[payproOrderData.IPN_TYPE_NAME],
		invoice: payproOrderData.INVOICE_LINK,
		is_trial: payproOrderData.IS_ON_TRIAL_PERIOD === "1",
		trial_period_till: payproOrderData.TRIAL_PERIOD_TILL,
		next_charge_date: payproOrderData.SUBSCRIPTION_NEXT_CHARGE_DATE,
		quantity: Number(payproOrderData.PRODUCT_QUANTITY),
		user_id: user?.user_id || "2e748653-5058-42da-a8d4-b227e0143e92",
		customer_id: payproOrderData.CUSTOMER_ID,
		order_item_name: payproOrderData.ORDER_ITEM_NAME,
		seats: Array.from({ length: Number(payproOrderData.PRODUCT_QUANTITY) }).map((_) => "")
	};

	query(
		`INSERT INTO subscriptions (subscription_id, status, invoice, is_trial, trial_period_till, next_charge_date, quantity, user_id, customer_id, order_item_name, seats) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
		[
			odinSubscription.subscription_id,
			odinSubscription.status,
			odinSubscription.invoice,
			odinSubscription.is_trial,
			odinSubscription.trial_period_till,
			odinSubscription.next_charge_date,
			odinSubscription.quantity,
			odinSubscription.user_id,
			odinSubscription.customer_id,
			odinSubscription.order_item_name.replace(/\+/g, " "),
			odinSubscription.seats
		]
	)
		.then(console.log)
		.catch(console.error);

	query(`UPDATE users SET paypro_customer_id = $1 WHERE user_id = $2`, [
		odinSubscription.customer_id,
		odinSubscription.user_id
	])
		.then(console.log)
		.catch(console.error);

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
