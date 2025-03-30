"use server";

import crypto from "crypto";
import { cookies } from "next/headers";

const CSRF_TOKEN_COOKIE = "csrf_token";
const CSRF_TOKEN_LENGTH = 32;

export async function generateCsrfToken(): Promise<string> {
	const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
	return token;
}

export async function setCsrfTokenCookie(token: string) {
	const cookieStore = await cookies();
	cookieStore.set(CSRF_TOKEN_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60
	});
}

export async function setCsrfToken(token: string) {
	await setCsrfTokenCookie(token);
}

export async function validateCsrfToken(token: string): Promise<boolean> {
	try {
		const cookieStore = await cookies();
		const storedToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

		if (!token || !storedToken || token !== storedToken) {
			return false;
		}

		return true;
	} catch (error) {
		console.error("CSRF token validation failed:", error);
		return false;
	}
}

export async function getCsrfToken(): Promise<string | undefined> {
	return generateCsrfToken();
}
