import { NextResponse, type NextRequest } from "next/server";
import { referralCookie, referralFromLink } from "@/lib/referral-attribution";

export function proxy(request: NextRequest) {
  if (request.method !== "GET" || request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch") return NextResponse.next();
  const attribution = referralFromLink(request.nextUrl.searchParams);
  if (!attribution) return NextResponse.next();
  const value = encodeURIComponent(JSON.stringify(attribution));
  request.cookies.set(referralCookie, value);
  request.cookies.set("odin-pro-affiliate", attribution.ref);
  const response = NextResponse.next({ request: { headers: request.headers } });
  const expires = new Date(attribution.attributedAt);
  expires.setUTCMonth(expires.getUTCMonth() + 6);
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires };
  response.cookies.set(referralCookie, value, options);
  response.cookies.set("odin-pro-affiliate", attribution.ref, options);
  return response;
}

export const config = { matcher: ["/((?!api|_next|.*\\.[^/]+$).*)"] };
