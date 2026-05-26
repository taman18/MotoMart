import { NextRequest, NextResponse } from "next/server";

const SESSION_KEY = "motomart_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the login page itself
  if (pathname === "/admin/login") return NextResponse.next();

  // Protect all other /admin/* routes
  if (pathname.startsWith("/admin")) {
    const raw = request.cookies.get(SESSION_KEY)?.value;

    let isAdmin = false;
    if (raw) {
      try {
        const session = JSON.parse(raw);
        isAdmin = session?.role === "admin";
      } catch {
        // malformed cookie
      }
    }

    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
