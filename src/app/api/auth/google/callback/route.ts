import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { findOrCreateGoogleUser } from "@/lib/google-account";
import {
  GOOGLE_OAUTH_COOKIE, GoogleAuthError, googleOAuthClient, googleOAuthCookieOptions,
  googleOAuthDestination, googleOAuthFailure, googleOAuthOrigin,
  matchesGoogleOAuthState, readGoogleOAuthAttempt,
} from "@/lib/google-oauth";
import { readReferralAttribution } from "@/lib/referral-attribution";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const attempt = readGoogleOAuthAttempt(request);
  const params = request.nextUrl.searchParams;
  if (!attempt || !matchesGoogleOAuthState(params.get("state"), attempt.state)) {
    return googleOAuthFailure(request, "google_state", attempt);
  }

  const store = await cookies();
  store.set(GOOGLE_OAUTH_COOKIE, "", { ...googleOAuthCookieOptions, maxAge: 0 });
  if (params.has("error")) {
    return googleOAuthFailure(request, params.get("error") === "access_denied" ? "google_denied" : "google_failed", attempt);
  }
  const code = params.get("code");
  if (!code) return googleOAuthFailure(request, "google_state", attempt);

  try {
    const client = googleOAuthClient(request);
    const { tokens } = await client.getToken({ code, codeVerifier: attempt.verifier });
    if (!tokens.id_token) throw new GoogleAuthError("google_failed");
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!.trim(),
    });
    const profile = ticket.getPayload();
    if (!profile || profile.nonce !== attempt.nonce) throw new GoogleAuthError("google_state");
    if (profile.email_verified !== true || !profile.email) throw new GoogleAuthError("google_email");
    if (attempt.inviteEmail && profile.email.trim().toLowerCase() !== attempt.inviteEmail) {
      throw new GoogleAuthError("google_invite");
    }

    const user = await findOrCreateGoogleUser(profile, readReferralAttribution(store));
    await createSession(user.user_id);
    const response = NextResponse.redirect(new URL(googleOAuthDestination(attempt), googleOAuthOrigin(request)), 303);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    const code = error instanceof GoogleAuthError ? error.code : "google_failed";
    // Provider errors may contain credentials, tokens or authorization codes.
    console.error("Google sign-in failed:", code);
    return googleOAuthFailure(request, code, attempt);
  }
}
