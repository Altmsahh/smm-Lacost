import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. إعادة توجيه مسار /dashboard وأي مسار تحته إلى /home
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const target = pathname.replace(/^\/dashboard/, "/home");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // فحص الكوكي الخاص بالجلسة
  const token =
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value;

  // 2. مستخدم مسجل ولديه جلسة يحاول الذهاب لصفحات الدخول/التسجيل
  if (token && (pathname === "/login" || pathname === "/register" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// تحديد المسارات التي يراقبها الـ Middleware
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/signup",
  ],
};
