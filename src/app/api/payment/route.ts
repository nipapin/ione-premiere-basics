import { NextRequest, NextResponse } from "next/server";

const HTTP_WC_ATOMX_SOURCE = "195bb24881ae34";

interface AtomXPaymentData {
	status: "active" | "on-hold" | "pending-cancel" | "cancelled" | "expired";
	type?: "Personal" | "Business" | "Team";
	assigned_author_id?: number;
	parent_order_id: number;
	order_id: number;
	product_id: number;
	generated_hash: string;
	currency: string;
	price: number;
	billing_info: string;
	billing_mail: string;
	created: Date;
}

const parsePayproOrder = (payproOrder: string) => {
	const payproOrderData = payproOrder.split("&").map((item) => {
		const [key, value] = item.split("=");
		return { [key]: value };
	});
	return payproOrderData;
};

export async function POST(request: NextRequest) {
	const payproOrder = await request.text();
	const payproOrderData = parsePayproOrder(payproOrder);
	console.log(payproOrderData);
	console.log(HTTP_WC_ATOMX_SOURCE);
	return NextResponse.json({ message: "Hello, world!" });
}
