import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { SMMProviderClient } from "@/lib/provider-api";

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

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId, link, quantity } = body;

    const qty = parseInt(String(quantity), 10);
    const svcId = parseInt(String(serviceId), 10);

    if (!svcId || !link || !qty || qty <= 0) {
      return NextResponse.json(
        { error: "يرجى ملء جميع بيانات الطلب (الخدمة، الرابط، الكمية)" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const service = await prisma.service.findUnique({
      where: { id: svcId },
      include: { provider: true },
    });

    if (!service || !service.isActive) {
      return NextResponse.json({ error: "هذه الخدمة غير متاحة حالياً" }, { status: 400 });
    }

    if (qty < service.minQuantity) {
      return NextResponse.json(
        { error: `الحد الأدنى للطلب هو ${service.minQuantity.toLocaleString()}` },
        { status: 400 }
      );
    }

    if (qty > service.maxQuantity) {
      return NextResponse.json(
        { error: `الحد الأقصى للطلب هو ${service.maxQuantity.toLocaleString()}` },
        { status: 400 }
      );
    }

    const charge = parseFloat(((service.rate * qty) / 1000).toFixed(4));
    if (user.balance < charge) {
      return NextResponse.json(
        {
          error: `رصيدك الحالي ($${user.balance.toFixed(2)}) غير كافٍ. تكلفة الطلب هي $${charge.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Deduct balance and create order transactionally
    const order = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: charge } },
      });

      return await tx.order.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          serviceName: service.name,
          link: link.trim(),
          quantity: qty,
          charge,
          status: "pending",
        },
      });
    });

    // If connected to remote provider, forward order
    if (service.provider && service.providerServiceId) {
      try {
        const client = new SMMProviderClient(
          service.provider.url,
          service.provider.apiKey,
          service.provider.username || undefined
        );
        await client.createOrder({
          service: service.providerServiceId,
          link: link.trim(),
          quantity: qty,
        });
      } catch (err) {
        console.error("Warning: Order placed locally, but provider forward failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم تنفيذ الطلب وخصم المبلغ من رصيدك بنجاح!",
      data: {
        orderId: order.id,
        serviceName: order.serviceName,
        charge: order.charge,
        quantity: order.quantity,
        newBalance: user.balance - charge,
      },
    });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء تنفيذ الطلب" },
      { status: 500 }
    );
  }
}

