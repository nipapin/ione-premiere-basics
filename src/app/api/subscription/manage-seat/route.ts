import { query } from "@/app/database/postgre";
import { sendEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const { subscription, email } = await request.json();

	const seats = subscription.seats;
	const rejected = seats.findIndex((seat: string) => seat === email);
	seats[rejected] = "";

	query(`UPDATE subscriptions SET seats = $1 WHERE id = $2`, [seats, subscription.id]);

	sendEmail(
		email,
		"Seat rejected",
		`Hi, there!<br/><br/>You have been rejected from the subscription by <strong>${subscription.seats[0]}</strong>.<br/><br/>Get your own subscription by <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing">clicking here</a>`
	);
	return NextResponse.json({ message: "Seat rejected" });
}

export async function PUT(request: NextRequest) {
	const { user, email, seat } = await request.json();

	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user.user_id]);

	if (!subscription[0]) {
		return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
	}

	const seats = subscription[0].seats;
	seats[seat] = email;

	const referal_code = Buffer.from(email, "utf-8").toString("base64");

	sendEmail(
		email,
		"Seat assigned",
		`Hi, there!<br/><br/><strong>${user.name}</strong> has assigned you a seat on the subscription.<br/><br/>Get access to the subscription by <a href="${process.env.NEXT_PUBLIC_APP_URL}/signup?referal_code=${referal_code}">clicking here</a>`
	);
	query(`UPDATE subscriptions SET seats = $1 WHERE user_id = $2`, [seats, user.user_id]);

	return NextResponse.json({ message: "Seat updated" });
}

export async function DELETE(request: NextRequest) {
	const { user, email, seat } = await request.json();

	const subscription = await query(`SELECT * FROM subscriptions WHERE user_id = $1`, [user.user_id]);

	if (!subscription[0]) {
		return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
	}

	const seats = subscription[0].seats;
	seats[seat] = "";

	query(`UPDATE subscriptions SET seats = $1 WHERE user_id = $2`, [seats, user.user_id]);
	sendEmail(email, "Seat freed", "You have been freed from the subscription.");
	return NextResponse.json({ message: "Seat freed" });
}
