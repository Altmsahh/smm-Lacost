import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import crypto from "crypto";

function getUserId(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  const cookieToken =
    req.cookies.get("auth_token")?.value ||
    req.cookies.get("token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId || null;
}

function generateApiKey(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, apiKey: true, username: true, balance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Auto-generate key if not set
    if (!user.apiKey) {
      const newKey = generateApiKey();
      user = await prisma.user.update({
        where: { id: userId },
        data: { apiKey: newKey },
        select: { id: true, apiKey: true, username: true, balance: true },
      });
    }

    return NextResponse.json({
      success: true,
      apiKey: user.apiKey,
      username: user.username,
      balance: user.balance,
    });
  } catch (error) {
    console.error("GET /api/auth/api-key error:", error);
    return NextResponse.json({ error: "Failed to get API key" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newKey = generateApiKey();
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { apiKey: newKey },
      select: { id: true, apiKey: true },
    });

    return NextResponse.json({
      success: true,
      apiKey: updated.apiKey,
      message: "تم إنشاء مفتاح API جديد بنجاح",
    });
  } catch (error) {
    console.error("POST /api/auth/api-key error:", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}

