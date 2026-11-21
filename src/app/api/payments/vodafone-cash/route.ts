import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken =
      request.cookies.get("auth_token")?.value ||
      request.cookies.get("token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: payload.userId,
        type: "deposit",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken =
      request.cookies.get("auth_token")?.value ||
      request.cookies.get("token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json({ error: "غير مصرح، يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "جلسة الدخول غير صالحة" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, phone, transactionRef, amountInUsd } = body;

    // Validate fields
    if (!amount || !phone || !transactionRef) {
      return NextResponse.json(
        { error: "يرجى تعبئة كافة الحقول المطلوبة: المبلغ، رقم الهاتف، ورقم العملية" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount < 10) {
      return NextResponse.json(
        { error: "الحد الأدنى لمبلغ الإيداع هو 10 جنيه مصري" },
        { status: 400 }
      );
    }

    if (!/^01[0-9]{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "رقم هاتف فودافون كاش غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 01" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Determine credited amount in USD
    const creditAmount = amountInUsd && typeof amountInUsd === "number" && amountInUsd > 0
      ? parseFloat(amountInUsd.toFixed(2))
      : parseFloat((amount / 50.0).toFixed(2));

    // Atomically update balance and create transaction
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: creditAmount } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "deposit",
          amount: creditAmount,
          balanceBefore: user.balance,
          balanceAfter: user.balance + creditAmount,
          description: `إيداع فودافون كاش (${amount} ج.م = $${creditAmount} USD) — المحفظة: ${phone} — رقم العملية: ${transactionRef}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الإيداع وتحديث الرصيد بنجاح!",
      newBalance: updatedUser.balance,
      transaction: {
        amountEgp: amount,
        amountUsd: creditAmount,
        phone,
        transactionRef,
        balanceBefore: user.balance,
        balanceAfter: updatedUser.balance,
      },
    });
  } catch (error) {
    console.error("Vodafone Cash API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم أثناء معالجة الإيداع" },
      { status: 500 }
    );
  }
}

