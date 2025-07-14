import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

type PayproOrderData = Record<string, string>;

const parsePayproOrder = (payproOrder: string) => {
	const payproOrderData = payproOrder.split("&").reduce((acc, item) => {
		const [key, value] = item.split("=");
		acc[key] = decodeURIComponent(value);
		return acc;
	}, {} as PayproOrderData);
	return payproOrderData;
};

export async function POST(req: NextRequest) {
	const payproPayload = await req.text();
	const payproPayloadData = parsePayproOrder(payproPayload);
	console.log(payproPayloadData.ORDER_STATUS);
	if (payproPayloadData.ORDER_STATUS === "Canceled") {
		redirect("/payment/failed");
	}

	return redirect("/payment");
}
