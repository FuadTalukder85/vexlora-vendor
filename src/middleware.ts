import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, Next internal files, and API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Strictly check ONLY the dedicated Vendor token cookie
  const token = request.cookies.get("vexlora_vendor_token")?.value;
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // 1. Unauthenticated users trying to access any protected vendor route -> redirect to /login
  if (!token && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated vendor users trying to access login or register page -> redirect to dashboard
  if (token && isAuthRoute) {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
