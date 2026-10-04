import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  const username = await verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value, process.env.AUTH_SECRET);
  if (username) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/((?!login|api/health|_next/static|_next/image|favicon.ico).*)"] };
