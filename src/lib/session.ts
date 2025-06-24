"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { Session } from "@/types/interfaces";
import crypto from "crypto";
import { query } from "@/app/database/postgre";

const SESSION_COOKIE = "odin-pro-session";
const SESSION_ID_COOKIE = "odin-pro-session-id";
const SESSION_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

export async function createSession(user_id: string): Promise<Session> {
	"use server";
	const cookieStore = await cookies();
	const headersList = await headers();

	// Generate a unique session ID
	const session_id = crypto.randomBytes(32).toString("hex");

	// Get client information
	const ip_address = headersList.get("x-forwarded-for") || "unknown";
	const user_agent = headersList.get("user-agent") || "unknown";

	const data = await query(
		"INSERT INTO sessions (user_id, session_id, ip_address, user_agent, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6)",
		[
			user_id,
			session_id,
			ip_address,
			user_agent,
			new Date().toISOString(),
			new Date(Date.now() + SESSION_EXPIRY * 1000).toISOString()
		]
	).then((res) => res[0]);

	// Set secure cookies
	cookieStore.set(SESSION_COOKIE, user_id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: SESSION_EXPIRY
	});

	cookieStore.set(SESSION_ID_COOKIE, session_id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: SESSION_EXPIRY
	});

	return data;
}

export async function validateSession(): Promise<Session | null> {
	"use server";
	const cookieStore = await cookies();
	const headersList = await headers();

	const user_id = cookieStore.get(SESSION_COOKIE)?.value;
	const session_id = cookieStore.get(SESSION_ID_COOKIE)?.value;

	if (!user_id || !session_id) {
		return null;
	}

	// Get current client information
	const ip_address = headersList.get("x-forwarded-for") || "unknown";
	const user_agent = headersList.get("user-agent") || "unknown";

	const data = await query(
		"SELECT * FROM sessions WHERE user_id = $1 AND session_id = $2 AND ip_address = $3 AND user_agent = $4 AND expires_at > $5",
		[user_id, session_id, ip_address, user_agent, new Date().toISOString()]
	).then((res) => res[0]);

	if (!data) {
		return null;
	}

	return data;
}

export async function deleteSession(user_id: string, session_id: string): Promise<void> {
	"use server";
	const cookieStore = await cookies();

	await query("DELETE FROM sessions WHERE user_id = $1 AND session_id = $2", [user_id, session_id]);

	// Clear cookies
	cookieStore.delete(SESSION_COOKIE);
	cookieStore.delete(SESSION_ID_COOKIE);
}

export async function deleteAllUserSessions(user_id: string): Promise<void> {
	"use server";
	const cookieStore = await cookies();

	// Delete all sessions for the user
	await query("DELETE FROM sessions WHERE user_id = $1", [user_id]);

	// Clear cookies
	cookieStore.delete(SESSION_COOKIE);
	cookieStore.delete(SESSION_ID_COOKIE);
}
