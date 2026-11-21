import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SMMProviderClient } from "@/lib/provider-api";
import { verifyToken } from "@/lib/jwt";

function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const cookieToken =
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId || null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { providerId, url, apiKey, username } = body;

    let targetUrl = url;
    let targetApiKey = apiKey;
    let targetUsername = username;

    if (providerId) {
      const provider = await prisma.provider.findUnique({
        where: { id: Number(providerId) },
      });
      if (!provider) {
        return NextResponse.json({ error: "المزود غير موجود" }, { status: 404 });
      }
      targetUrl = provider.url;
      targetApiKey = provider.apiKey;
      targetUsername = provider.username;
    }

    if (!targetUrl || !targetApiKey) {
      return NextResponse.json(
        { error: "يرجى تحديد رابط المزود ومفتاح API" },
        { status: 400 }
      );
    }

    const client = new SMMProviderClient(targetUrl, targetApiKey, targetUsername);
    const balanceInfo = await client.getBalance();

    // If providerId provided, save updated balance to DB
    if (providerId) {
      await prisma.provider.update({
        where: { id: Number(providerId) },
        data: {
          balance: balanceInfo.balance,
          currency: balanceInfo.currency,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم الاتصال بنجاح وجلب رصيد الحساب",
      data: balanceInfo,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "فشل الاتصال بسيرفر المزود";
    return NextResponse.json(
      { error: `فشل الاتصال بالمزود: ${msg}` },
      { status: 500 }
    );
  }
}

