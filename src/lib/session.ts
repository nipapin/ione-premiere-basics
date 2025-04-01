"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { createClient } from "./supabase/server";
import { Session } from "@/types";
import crypto from "crypto";

const SESSION_COOKIE = "odin-pro-session";
const SESSION_ID_COOKIE = "odin-pro-session-id";
const SESSION_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

export async function createSession(user_id: string): Promise<Session> {
	"use server";
	const cookieStore = await cookies();
	const headersList = await headers();
	const supabase = await createClient(cookies());

	// Generate a unique session ID
	const session_id = crypto.randomBytes(32).toString("hex");

	// Get client information
	const ip_address = headersList.get("x-forwarded-for") || "unknown";
	const user_agent = headersList.get("user-agent") || "unknown";

	// Create session record using service role
	const { data, error } = await supabase
		.from("sessions")
		.insert({
			user_id,
			session_id,
			ip_address,
			user_agent,
			created_at: new Date().toISOString(),
			expires_at: new Date(Date.now() + SESSION_EXPIRY * 1000).toISOString(),
		})
		.select()
		.single();

	if (error) {
		console.error("Failed to create session:", error);
		throw new Error("Failed to create session");
	}

	// Set secure cookies
	cookieStore.set(SESSION_COOKIE, user_id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: SESSION_EXPIRY,
	});

	cookieStore.set(SESSION_ID_COOKIE, session_id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: SESSION_EXPIRY,
	});

	return data;
}

export async function validateSession(): Promise<Session | null> {
	"use server";
	const cookieStore = await cookies();
	const headersList = await headers();
	const supabase = await createClient(cookies());

	const user_id = cookieStore.get(SESSION_COOKIE)?.value;
	const session_id = cookieStore.get(SESSION_ID_COOKIE)?.value;

	if (!user_id || !session_id) {
		return null;
	}

	// Get current client information
	const ip_address = headersList.get("x-forwarded-for") || "unknown";
	const user_agent = headersList.get("user-agent") || "unknown";

	// Validate session without deleting it
	const { data, error } = await supabase
		.from("sessions")
		.select()
		.eq("user_id", user_id)
		.eq("session_id", session_id)
		.eq("ip_address", ip_address)
		.eq("user_agent", user_agent)
		.gt("expires_at", new Date().toISOString())
		.single();

	if (error || !data) {
		// Session is invalid or expired, but we don't delete it
		return null;
	}

	return data;
}

export async function deleteSession(user_id: string, session_id: string): Promise<void> {
	"use server";
	const cookieStore = await cookies();
	const supabase = await createClient(cookies());

	// Delete session from database
	await supabase.from("sessions").delete().eq("user_id", user_id).eq("session_id", session_id);

	// Clear cookies
	cookieStore.delete(SESSION_COOKIE);
	cookieStore.delete(SESSION_ID_COOKIE);
}

export async function deleteAllUserSessions(user_id: string): Promise<void> {
	"use server";
	const cookieStore = await cookies();
	const supabase = await createClient(cookies());

	// Delete all sessions for the user
	await supabase.from("sessions").delete().eq("user_id", user_id);

	// Clear cookies
	cookieStore.delete(SESSION_COOKIE);
	cookieStore.delete(SESSION_ID_COOKIE);
}
