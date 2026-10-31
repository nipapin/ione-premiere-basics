import "server-only";

import { timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { cepReturnPath } from "@/lib/cep-return";

export const GOOGLE_OAUTH_COOKIE = "odin-google-oauth";
export const GOOGLE_OAUTH_MAX_AGE = 10 * 60;
export const googleOAuthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth/google",
};

export type GoogleOAuthAttempt = {
  state: string;
  nonce: string;
  verifier: string;
  createdAt: number;
  signup: boolean;
  next?: string;
  after?: string;
  inviteEmail?: string;
};

export class GoogleAuthError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

export function googleOAuthOrigin(request: NextRequest): string {
  const production = process.env.NODE_ENV === "production";
  const configured = process.env.AUTH_PUBLIC_URL?.trim() ||
    (production ? process.env.NEXT_PUBLIC_APP_URL?.trim() : request.nextUrl.origin);
  if (!configured) throw new GoogleAuthError("google_config");
  const url = new URL(configured);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && local && !production)) ||
      (production && local)) {
    throw new GoogleAuthError("google_config");
  }
  return url.origin;
}

export function googleOAuthClient(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new GoogleAuthError("google_config");
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: `${googleOAuthOrigin(request)}/api/auth/google/callback`,
    transporterOptions: { timeout: 15000 },
  });
}

export function readGoogleOAuthAttempt(request: NextRequest): GoogleOAuthAttempt | undefined {
  try {
    const value = request.cookies.get(GOOGLE_OAUTH_COOKIE)?.value;
    if (!value) return undefined;
    const data = JSON.parse(value);
    if (!data || !/^[a-f0-9]{64}$/.test(data.state) || !/^[a-f0-9]{64}$/.test(data.nonce) ||
        typeof data.verifier !== "string" || !/^[A-Za-z0-9._~-]{43,128}$/.test(data.verifier) ||
        typeof data.createdAt !== "number" || !Number.isFinite(data.createdAt) ||
        data.createdAt > Date.now() || Date.now() - data.createdAt > GOOGLE_OAUTH_MAX_AGE * 1000) return undefined;
    return {
      state: data.state,
      nonce: data.nonce,
      verifier: data.verifier,
      createdAt: data.createdAt,
      signup: data.signup === true,
      next: cepReturnPath(typeof data.next === "string" ? data.next : undefined),
      after: typeof data.after === "string" ? data.after.slice(0, 512) : undefined,
      inviteEmail: typeof data.inviteEmail === "string" ? data.inviteEmail.slice(0, 254) : undefined,
    };
  } catch { return undefined; }
}

export function matchesGoogleOAuthState(actual: string | null, expected: string): boolean {
  return !!actual && /^[a-f0-9]{64}$/.test(actual) &&
    timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export function googleOAuthDestination(attempt: GoogleOAuthAttempt): string {
  return cepReturnPath(attempt.next) ||
    (attempt.after ? `/charge-payment?${new URLSearchParams({ after: attempt.after })}` : "/account");
}

export function googleOAuthFailure(request: NextRequest, code: string, attempt?: GoogleOAuthAttempt): NextResponse {
  let origin: string;
  try { origin = googleOAuthOrigin(request); }
  catch { origin = request.nextUrl.origin; }
  const target = new URL(attempt?.signup ? "/signup" : "/login", origin);
  target.searchParams.set("auth_error", code);
  if (attempt?.next) target.searchParams.set("next", attempt.next);
  if (attempt?.after) target.searchParams.set("after", attempt.after);
  if (attempt?.inviteEmail && attempt.signup) {
    target.searchParams.set("referal_code", Buffer.from(attempt.inviteEmail).toString("base64"));
  }
  const response = NextResponse.redirect(target, 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(GOOGLE_OAUTH_COOKIE, "", { ...googleOAuthCookieOptions, maxAge: 0 });
  return response;
}
