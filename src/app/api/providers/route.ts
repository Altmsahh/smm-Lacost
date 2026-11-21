import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

// GET all providers
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providers = await prisma.provider.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: providers.map((p) => ({
        ...p,
        servicesCount: p._count.services,
      })),
    });
  } catch (error) {
    console.error("GET /api/providers error:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

// POST create or update provider
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, url, apiKey, username } = body;

    if (!name || !url || !apiKey) {
      return NextResponse.json(
        { error: "يرجى تعبئة كافة الحقول المطلوبة: اسم المزود، الرابط، ومفتاح API" },
        { status: 400 }
      );
    }

    let provider;
    if (id) {
      provider = await prisma.provider.update({
        where: { id: Number(id) },
        data: {
          name: name.trim(),
          url: url.trim(),
          apiKey: apiKey.trim(),
          username: username ? username.trim() : null,
        },
      });
    } else {
      provider = await prisma.provider.create({
        data: {
          name: name.trim(),
          url: url.trim(),
          apiKey: apiKey.trim(),
          username: username ? username.trim() : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: id ? "تم تحديث المزود بنجاح" : "تمت إضافة المزود بنجاح",
      data: provider,
    });
  } catch (error) {
    console.error("POST /api/providers error:", error);
    return NextResponse.json({ error: "فشل في حفظ المزود" }, { status: 500 });
  }
}

// DELETE provider
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing provider id" }, { status: 400 });
    }

    await prisma.provider.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف المزود بنجاح",
    });
  } catch (error) {
    console.error("DELETE /api/providers error:", error);
    return NextResponse.json({ error: "فشل في حذف المزود" }, { status: 500 });
  }
}

