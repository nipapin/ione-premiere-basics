import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";

const getPrimarySubscription = async (user_id: string) => {
	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active'`, [
		user_id
	]).then((res) => res[0]);
	return subscription;
};

const getInviteSubscription = async (user_id: string) => {
	const email = await query(`SELECT email FROM users WHERE user_id = $1`, [user_id]).then((res) => res[0].email);
	const subscription = await query(`SELECT * FROM subscriptions WHERE $1 = ANY(seats) AND status = 'active'`, [
		email
	]).then((res) => res[0]);
	return subscription;
};

export async function POST(request: NextRequest) {
	const { user_id } = await request.json();
	const primarySubscription = await getPrimarySubscription(user_id);
	const inviteSubscription = await getInviteSubscription(user_id);
	if (primarySubscription) {
		return NextResponse.json({ ...primarySubscription, type: "primary" });
	} else if (inviteSubscription) {
		return NextResponse.json({ ...inviteSubscription, type: "invite" });
	} else {
		return NextResponse.json({ type: "none" });
	}
}
