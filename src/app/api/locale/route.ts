import { NextRequest, NextResponse } from "next/server";
import { locales, type Locale } from "@/i18n/config";

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json();

    if (!locale || !locales.includes(locale as Locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, locale });
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("POST /api/locale error:", error);
    return NextResponse.json({ error: "Failed to set locale" }, { status: 500 });
  }
}

