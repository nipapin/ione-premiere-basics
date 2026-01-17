"use server";

import { cookies } from "next/headers";

export async function setCookies(key: string, value: string) {
	const cookieStore = await cookies();
	cookieStore.set(key, value, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 30 * 24 * 60 * 60,
	});
}
