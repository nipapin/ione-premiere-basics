"use server";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_TOKEN_COOKIE = "csrf_token";
const CSRF_TOKEN_LENGTH = 32;

export async function getCsrfTokenServer() {
	// Generate new CSRF token
	const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");

	// Create response with token
	const response = NextResponse.json({ token });

	// Set the token in a cookie
	response.cookies.set(CSRF_TOKEN_COOKIE, token, {
		httpOnly: true,
		path: "/",
		sameSite: "strict",
		maxAge: 3600
	});

	return response;
}

export async function validateCsrfTokenServer(request: NextRequest) {
	const { token } = await request.json();
	const storedToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;

	if (!token || !storedToken || token !== storedToken) {
		return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
	}

	return NextResponse.json({ valid: true });
}
