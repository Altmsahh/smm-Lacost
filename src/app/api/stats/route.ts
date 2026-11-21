import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

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

    // Global server counts across all users
    const totalServerOrders = await prisma.order.count();
    const totalServices = await prisma.service.count({ where: { isActive: true } });
    const totalCompletedServer = await prisma.order.count({ where: { status: "completed" } });

    // User personal stats
    let userActiveOrders = 0;
    let userCompletedOrders = 0;
    let userTotalSpent = 0;
    let userTotalOrders = 0;

    if (userId) {
      userTotalOrders = await prisma.order.count({ where: { userId } });
      userActiveOrders = await prisma.order.count({
        where: {
          userId,
          status: { in: ["pending", "in_progress"] },
        },
      });
      userCompletedOrders = await prisma.order.count({
        where: {
          userId,
          status: "completed",
        },
      });
      const spentAgg = await prisma.order.aggregate({
        where: { userId },
        _sum: { charge: true },
      });
      userTotalSpent = spentAgg._sum.charge ?? 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalServerOrders,
        totalServices,
        totalCompletedServer,
        userActiveOrders,
        userCompletedOrders,
        userTotalSpent,
        userTotalOrders,
      },
    });
  } catch (error: any) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

