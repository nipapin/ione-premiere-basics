import { sendEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { recordPayproSale } from "@/lib/paypro-sales";
import { pool } from "@/app/database/pool";
import { hasPaidAccess, recordCinecomPayment } from "@/lib/cinecom";
import type { PoolClient } from "pg";
import { parseSubscriptionDate } from "@/lib/subscription-date";

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
	name: string;
}

interface OdinSubscription {
	product_id: string;
	order_id: string;
	subscription_id: string;
	status: string;
	invoice: string;
	is_trial: boolean;
	trial_period_till: string;
	next_charge_date: string;
	quantity: number;
	user_id: string;
	customer_id: string;
	order_item_name: string;
	seats: string[];
	affilate: string;
	revoke_access: boolean;
}

type PayproOrderData = Record<string, string>;

const OrderStatus: Record<string, AtomXPaymentStatus> = {
	OrderCharged: "active",
	OrderRefunded: "cancelled",
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
	SubscriptionPaymentInfoChanged: "active",
};

const parsePayproOrder = (payproOrder: string) => {
	return Object.fromEntries(new URLSearchParams(payproOrder)) as PayproOrderData;
};

const collectAtomXPayload = (payproOrderData: PayproOrderData) => {
	const subscriptionPeriodTypeMap: Record<string, string> = {
		"113887": "lifetime",
		"111867": "monthly",
		"113886": "yearly",
	};

	const isLifetime = payproOrderData.PRODUCT_ID === "113887";

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
		billing_email: payproOrderData.CUSTOMER_EMAIL,
		subscription_period_type: subscriptionPeriodTypeMap[payproOrderData.PRODUCT_ID],
		subscription_starts_at: new Date().getTime(),
		subscription_ends_at: isLifetime ? null : parseSubscriptionDate(payproOrderData.SUBSCRIPTION_NEXT_CHARGE_DATE)?.getTime() ?? null,
	};
};

const collectOdinSubscription = (payproOrderData: PayproOrderData, user: User): OdinSubscription => {
	const customArguments = getCustomArguments(payproOrderData.ORDER_CUSTOM_FIELDS as string);
	const isRefunded = payproOrderData.IPN_TYPE_NAME === "OrderRefunded";
	return {
		product_id: payproOrderData.PRODUCT_ID,
		order_id: payproOrderData.ORDER_ID,
		subscription_id: payproOrderData.SUBSCRIPTION_ID,
		status: OrderStatus[payproOrderData.IPN_TYPE_NAME],
		invoice: payproOrderData.INVOICE_LINK,
		is_trial: payproOrderData.IS_ON_TRIAL_PERIOD === "1",
		trial_period_till: payproOrderData.TRIAL_PERIOD_TILL,
		next_charge_date: isRefunded ? "" : payproOrderData.SUBSCRIPTION_NEXT_CHARGE_DATE,
		quantity: Number(payproOrderData.PRODUCT_QUANTITY),
		user_id: user?.user_id,
		customer_id: payproOrderData.CUSTOMER_ID,
		order_item_name: payproOrderData.ORDER_ITEM_NAME,
		seats: Array.from({ length: Number(payproOrderData.PRODUCT_QUANTITY) }).map((_, index) =>
			index === 0 ? user?.email : "",
		),
		affilate: customArguments["x-odin-affiliate"],
		revoke_access: isRefunded,
	};
};

const handleSubscription = async (db: PoolClient, odinSubscription: OdinSubscription) => {
	const subscriptionId = odinSubscription.subscription_id || odinSubscription.order_id;
	const isSubscriptionExists = (await db.query(`SELECT * FROM subscriptions WHERE subscription_id = $1 FOR UPDATE`, [subscriptionId])).rows[0];
	if (isSubscriptionExists && String(isSubscriptionExists.user_id) !== String(odinSubscription.user_id)) throw new Error("Subscription owner mismatch");

	if (isSubscriptionExists) {
		await db.query(
			`UPDATE subscriptions SET status = $1, next_charge_date = $2, order_item_name = $3, is_trial = $4, trial_period_till = $5, product_id = $6, affilate = COALESCE(NULLIF($7, ''), affilate) WHERE subscription_id = $8`,
			[
				odinSubscription.status,
				odinSubscription.revoke_access ? "" : odinSubscription.next_charge_date || isSubscriptionExists.next_charge_date,
				odinSubscription.order_item_name.replace(/\+/g, " "),
				odinSubscription.is_trial,
				odinSubscription.trial_period_till,
				odinSubscription.product_id,
				odinSubscription.affilate,
				subscriptionId,
			],
		);
	} else {
		await db.query(
			`INSERT INTO subscriptions (order_id, subscription_id, status, invoice, is_trial, trial_period_till, next_charge_date, quantity, user_id, customer_id, order_item_name, seats, product_id, affilate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
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
				odinSubscription.product_id,
				odinSubscription.affilate,
			],
		);
	}
};

const handleOrder = async (db: PoolClient, data: PayproOrderData, user_id: string) => {
	const customArguments = getCustomArguments(data.ORDER_CUSTOM_FIELDS as string);
	await db.query(`INSERT INTO payments (user_id, date, amount, status, affilate) VALUES ($1, $2, $3, $4, $5)`, [
		user_id,
		`${new Date().toDateString()} ${new Date().toLocaleTimeString()}`,
		data.ORDER_TOTAL_AMOUNT_SHOWN,
		data.ORDER_STATUS,
		customArguments["x-odin-affiliate"],
	]);
};

const getCustomArguments = (args: string = ""): Record<string, string> => {
	return Object.fromEntries(args.split(",").filter(row => row.includes("=")).map(row => {
		const separator = row.indexOf("=");
		return [row.slice(0, separator), row.slice(separator + 1)];
	}));
};

export async function POST(request: NextRequest) {
	const payproOrder = await request.text();
	const payproOrderData = parsePayproOrder(payproOrder);
	// Test notifications never mutate real access or enqueue partner events.
	if (payproOrderData.TEST_MODE === "1") return NextResponse.json({ message: "Test notification ignored" });
	let sale: Awaited<ReturnType<typeof recordPayproSale>>;
	try {
		sale = await recordPayproSale(payproOrderData);
	} catch {
		// Let PayPro retry; never acknowledge an unpersisted financial transaction.
		return NextResponse.json({ message: "Unable to verify or record payment" }, { status: 503 });
	}
	if (!OrderStatus[payproOrderData.IPN_TYPE_NAME]) return NextResponse.json({ message: "Notification ignored" });
	const isLifetime = payproOrderData.PRODUCT_ID === "113887";
	let user: User;
	let odinSubscription: OdinSubscription;
	const db = await pool.connect();
	try {
		await db.query("BEGIN");
		const found = (await db.query(`SELECT user_id,email,name FROM users WHERE email=$1 FOR UPDATE`, [payproOrderData.CUSTOMER_EMAIL.toLowerCase().trim()])).rows[0];
		if (!found) {
			await db.query("ROLLBACK");
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		user = found;
		const before = (await db.query("SELECT * FROM subscriptions WHERE user_id=$1", [user.user_id])).rows;
		const confirmed = new Set((await db.query("SELECT subscription_id FROM odin_referral_subscriptions WHERE user_id=$1", [user.user_id])).rows.map(row => row.subscription_id));
		// LicenseRequested may arrive before the first charge. Such a row alone
		// must not suppress the first actual subscription_started event.
		const hadPaidAccess = hasPaidAccess(before.filter(sub => String(sub.subscription_id) !== payproOrderData.SUBSCRIPTION_ID || confirmed.has(String(sub.subscription_id))));
		odinSubscription = collectOdinSubscription(payproOrderData, user);
		const paidItem = sale?.rows.find((row: { orderItemId: string; status: string }) => row.orderItemId === payproOrderData.ORDER_ITEM_ID);
		if (paidItem?.status === "refunded") {
			odinSubscription.status = "cancelled";
			odinSubscription.revoke_access = true;
			odinSubscription.next_charge_date = "";
		}
		if (payproOrderData.SUBSCRIPTION_ID || isLifetime) await handleSubscription(db, odinSubscription);
		else await handleOrder(db, payproOrderData, user.user_id);
		if (sale) await recordCinecomPayment(db, user, sale.order, sale.rows, payproOrderData, hadPaidAccess);
		await db.query(`UPDATE users SET paypro_customer_id=$1 WHERE user_id=$2`, [odinSubscription.customer_id, user.user_id]);
		await db.query("COMMIT");
	} catch {
		await db.query("ROLLBACK");
		return NextResponse.json({ message: "Unable to persist payment notification" }, { status: 503 });
	} finally { db.release(); }
	if (payproOrderData.SUBSCRIPTION_ID || isLifetime) {
		if (odinSubscription.status === "active") {
			const subject = isLifetime ? "Your Lifetime is active" : "Your subscription is active";
			sendEmail(user.email, subject, `<p>${subject}</p>`);
		}
	} else if (payproOrderData.ORDER_STATUS === "Processed") {
		sendEmail(user.email, "Your order is charged", `<p>Your order is charged</p>`);
	}
	const atomPayload: AtomXPaymentData = collectAtomXPayload(payproOrderData);

	fetch("https://api.get-atomx.com/atomx/v1/webhook_esubs", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"WC-AtomX-Source": HTTP_WC_ATOMX_SOURCE,
		},
		body: JSON.stringify(atomPayload),
	}).catch((error) => {
		console.error(error);
		return NextResponse.json({ message: "Error" }, { status: 500 });
	});

	return NextResponse.json({ message: "Hello, world!" });
}
