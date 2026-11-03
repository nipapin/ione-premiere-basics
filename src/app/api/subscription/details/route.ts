import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";
import { selectActiveSubscription } from "@/lib/subscription-date";


const getPrimarySubscription = async (user_id: string) => {
	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY id DESC`, [user_id]).then((res) =>
		selectActiveSubscription(res)
	);
	return subscription;
};

const getInviteSubscription = async (user_id: string) => {
	const email = await query(`SELECT email FROM users WHERE user_id = $1`, [user_id]).then((res) => res[0].email);
	const subscription = await query(`SELECT * FROM subscriptions WHERE $1 = ANY(seats) ORDER BY id DESC`, [email]).then((res) =>
		selectActiveSubscription(res)
	);
	return subscription;
};

export async function POST(request: NextRequest) {
	const { user_id } = await request.json();
	const primarySubscription = await getPrimarySubscription(user_id);
	const inviteSubscription = await getInviteSubscription(user_id);
	if (primarySubscription && (!primarySubscription.is_test || !inviteSubscription || inviteSubscription.is_test)) {
		return NextResponse.json({ ...primarySubscription, type: "primary" });
	} else if (inviteSubscription) {
		return NextResponse.json({ ...inviteSubscription, type: "invite" });
	} else {
		return NextResponse.json({ type: "none" });
	}
}
