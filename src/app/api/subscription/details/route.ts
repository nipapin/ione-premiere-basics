import { query } from "@/app/database/postgre";
import { NextRequest, NextResponse } from "next/server";

const isValidDate = (dateString: string) => {
	const [date, _] = dateString.split("+");
	if (!date) return false;
	const now = Date.now();
	const next = new Date(date).getTime();
	return next > now;
};

const getPrimarySubscription = async (user_id: string) => {
	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user_id]).then((res) =>
		res.find((sub: any) => isValidDate(sub.next_charge_date))
	);
	return subscription;
};

const getInviteSubscription = async (user_id: string) => {
	const email = await query(`SELECT email FROM users WHERE user_id = $1`, [user_id]).then((res) => res[0].email);
	const subscription = await query(`SELECT * FROM subscriptions WHERE $1 = ANY(seats)`, [email]).then((res) =>
		res.find((sub: any) => isValidDate(sub.next_charge_date))
	);
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
