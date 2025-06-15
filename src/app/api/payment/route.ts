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
	price: number;
	billing_info: {
		billing_firstname: string;
		billing_lastname: string;
		billing_company: string;
	};
	billing_email: string;
}

type PayproOrderData = Record<string, string>;

const OrderStatus = {
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
		acc[key] = value;
		return acc;
	}, {} as PayproOrderData);
	return payproOrderData;
};

export async function POST(request: NextRequest) {
	const payproOrder = await request.text();
	const payproOrderData = parsePayproOrder(payproOrder);
	const atomPayload: AtomXPaymentData = {
		status: "active",
		parent_order_id: Number(payproOrderData.ORDER_ID),
		order_id: Number(payproOrderData.ORDER_ITEM_ID),
		product_id: Number(payproOrderData.PRODUCT_ID),
		generated_purchase_code: payproOrderData.HASH,
		currency: payproOrderData.ORDER_CURRENCY_CODE,
		price: Number(payproOrderData.ORDER_ITEM_UNIT_PRICE),
		billing_info: {
			billing_firstname: payproOrderData.CUSTOMER_FIRST_NAME,
			billing_lastname: payproOrderData.CUSTOMER_LAST_NAME,
			billing_company: payproOrderData.COMPANY_NAME
		},
		billing_email: payproOrderData.CUSTOMER_EMAIL
	};
	fetch("https://api.get-atomx.com/atomx/v1/webhook_esubs", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			HTTP_WC_ATOMX_SOURCE: HTTP_WC_ATOMX_SOURCE
		},
		body: JSON.stringify(atomPayload)
	}).catch((error) => {
		console.error(error);
		return NextResponse.json({ message: "Error" }, { status: 500 });
	});
	return NextResponse.json({ message: "Hello, world!" });
}
