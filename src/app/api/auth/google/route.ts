import { randomBytes } from "node:crypto";
import { CodeChallengeMethod } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { cepReturnPath } from "@/lib/cep-return";
import {
  GOOGLE_OAUTH_COOKIE, GOOGLE_OAUTH_MAX_AGE, googleOAuthClient,
  googleOAuthCookieOptions, googleOAuthFailure, type GoogleOAuthAttempt,
} from "@/lib/google-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const attempt: GoogleOAuthAttempt = {
    state: randomBytes(32).toString("hex"),
    nonce: randomBytes(32).toString("hex"),
    verifier: "",
    createdAt: Date.now(),
    signup: params.get("signup") === "1",
    next: cepReturnPath(params.get("next") || undefined),
    after: params.get("after")?.slice(0, 512),
    inviteEmail: params.get("email")?.trim().toLowerCase().slice(0, 254),
  };
  try {
    const client = googleOAuthClient(request);
    const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
    attempt.verifier = codeVerifier;
    const authorization = new URL(client.generateAuthUrl({
      scope: ["openid", "email", "profile"],
      state: attempt.state,
      prompt: "select_account",
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
      login_hint: attempt.inviteEmail,
    }));
    authorization.searchParams.set("nonce", attempt.nonce);
    const response = NextResponse.redirect(authorization, 303);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.cookies.set(GOOGLE_OAUTH_COOKIE, JSON.stringify(attempt), {
      ...googleOAuthCookieOptions, maxAge: GOOGLE_OAUTH_MAX_AGE,
    });
    return response;
  } catch {
    return googleOAuthFailure(request, "google_config", attempt);
  }
}
