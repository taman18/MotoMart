import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_KEY = "motomart_session";
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "motomart-dev-secret-change-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_KEY)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET, { issuer: "motomart" });
      if (payload?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      // Token invalid or expired
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete(SESSION_KEY);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
