import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // فحص الكوكي الخاص بالجلسة
  const token =
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. محاولة دخول /home دون توثيق
  if (!token && pathname.startsWith("/home")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. مستخدم مسجل يحاول الذهاب لصفحة الهبوط أو صفحات الدخول/التسجيل
  if (token && (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// تحديد المسارات التي يراقبها الـ Middleware
export const config = {
  matcher: ["/", "/home/:path*", "/login", "/register", "/signup"],
};
