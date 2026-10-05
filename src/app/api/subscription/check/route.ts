import { query } from "@/app/database/postgre";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/subscription-date";

export async function GET(req: NextRequest) {
	const cookiesStore = await cookies();
	const userId = cookiesStore.get("odin-pro-session")?.value;
	if (!userId) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}
	const userSubscription = await query("SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY id DESC", [userId]).then(
		(res) => res.find((sub: any) => isSubscriptionActive(sub))
	);
	if (!userSubscription) {
		return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
	}
	return NextResponse.json(userSubscription);
}
