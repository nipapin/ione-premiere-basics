import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const data = await req.text();
	const checkoutData: Record<string, string> = Object.fromEntries(
		data.split("&").map((item) => item.split("=").map(decodeURIComponent))
	);

	console.log("STATUS", checkoutData.ORDER_STATUS);

	return ["Processed", "Suspended", "Waiting"].includes(checkoutData.ORDER_STATUS)
		? redirect("/payment/success")
		: redirect("/payment/failed");
}
