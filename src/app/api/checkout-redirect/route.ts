import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const data = await req.text();
	const checkoutData: Record<string, string> = Object.fromEntries(
		data.split("&").map((item) => item.split("=").map(decodeURIComponent))
	);

	return checkoutData.ORDER_STATUS === "Processed" ? redirect("/payment/success") : redirect("/payment/failed");
}
