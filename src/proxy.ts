import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "./lib/auth-token";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const configuredLoginPath = process.env.AUTH_LOGIN_PATH;
  const loginPath = configuredLoginPath && /^\/[A-Za-z0-9_-]{16,}$/.test(configuredLoginPath) ? configuredLoginPath : null;
  if (loginPath && path === loginPath) {
    return NextResponse.rewrite(new URL(`/login${request.nextUrl.search}`, request.url));
  }
  if (path === "/login") {
    return new NextResponse("Not found", { status: 404 });
  }
  if (request.method === "GET" && (
    path === "/" || (path !== "/spots/new" && /^\/spots\/[^/]+$/.test(path)) || /^\/api\/photos\/[^/]+$/.test(path)
  )) return NextResponse.next();
  if (!loginPath) return new NextResponse("Not found", { status: 404 });
  const username = await verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value, process.env.AUTH_SECRET);
  if (username) return NextResponse.next();
  return new NextResponse("Not found", { status: 404 });
}

export const config = { matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico).*)"] };
