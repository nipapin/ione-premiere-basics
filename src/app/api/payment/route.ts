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
	generated_hash: string;
	currency: string;
	price: number;
	billing_info: string;
	billing_mail: string;
	created: number;
}

type PayproOrderData = Record<string, string>;

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
		product_id: 1,
		generated_hash: payproOrderData.HASH,
		currency: payproOrderData.ORDER_CURRENCY_CODE,
		price: Number(payproOrderData.AMOUNT),
		billing_info: payproOrderData.CUSTOMER_NAME,
		billing_mail: payproOrderData.CUSTOMER_EMAIL,
		created: Date.now()
	};
	fetch("https://api.get-atomx.com/atomx/v1/webhook_esubs", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			HTTP_WC_ATOMX_SOURCE: HTTP_WC_ATOMX_SOURCE
		},
		body: JSON.stringify(atomPayload)
	});
	return NextResponse.json({ message: "Hello, world!" });
}
