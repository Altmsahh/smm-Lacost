import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SMMProviderClient } from "@/lib/provider-api";

async function parseBody(req: NextRequest): Promise<Record<string, any>> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    try {
      const formData = await req.formData();
      const obj: Record<string, any> = {};
      formData.forEach((val, key) => {
        obj[key] = typeof val === "string" ? val : val.name;
      });
      return obj;
    } catch {
      // fallback to text parse
      try {
        const text = await req.text();
        const searchParams = new URLSearchParams(text);
        const obj: Record<string, any> = {};
        searchParams.forEach((val, key) => {
          obj[key] = val;
        });
        return obj;
      } catch {
        return {};
      }
    }
  }

  // Fallback to URL search parameters
  const obj: Record<string, any> = {};
  req.nextUrl.searchParams.forEach((val, key) => {
    obj[key] = val;
  });
  return obj;
}

export async function POST(req: NextRequest) {
  try {
    const params = await parseBody(req);
    const action = params.action ? String(params.action).toLowerCase().trim() : "";
    const key = params.key ? String(params.key).trim() : "";

    // 1. ACTION: SERVICES (Public list or authenticated)
    if (action === "services") {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { id: "asc" },
      });

      const formatted = services.map((s) => ({
        service: s.id,
        name: s.name,
        type: s.type || "Default",
        category: s.category?.name || "General",
        rate: s.rate.toFixed(4),
        min: String(s.minQuantity),
        max: String(s.maxQuantity),
        desc: s.description || "",
        dripfeed: false,
        refill: false,
        cancel: false,
      }));

      return NextResponse.json(formatted);
    }

    // Require API Key for all remaining actions
    if (!key) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { apiKey: key },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // 2. ACTION: BALANCE
    if (action === "balance") {
      return NextResponse.json({
        balance: user.balance.toFixed(2),
        currency: "USD",
      });
    }

    // 3. ACTION: ADD ORDER
    if (action === "add") {
      const serviceId = parseInt(String(params.service), 10);
      const link = String(params.link || "").trim();
      const quantity = parseInt(String(params.quantity), 10);

      if (!serviceId || !link || !quantity || quantity <= 0) {
        return NextResponse.json(
          { error: "Missing or invalid parameters (service, link, quantity)" },
          { status: 400 }
        );
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { provider: true },
      });

      if (!service || !service.isActive) {
        return NextResponse.json({ error: "Service not found or disabled" }, { status: 400 });
      }

      if (quantity < service.minQuantity) {
        return NextResponse.json(
          { error: `Minimum quantity is ${service.minQuantity}` },
          { status: 400 }
        );
      }

      if (quantity > service.maxQuantity) {
        return NextResponse.json(
          { error: `Maximum quantity is ${service.maxQuantity}` },
          { status: 400 }
        );
      }

      const charge = parseFloat(((service.rate * quantity) / 1000).toFixed(4));
      if (user.balance < charge) {
        return NextResponse.json({ error: "Not enough funds on balance" }, { status: 400 });
      }

      // Execute in transaction: deduct balance, create order
      const newOrder = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { decrement: charge } },
        });

        return await tx.order.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            serviceName: service.name,
            link,
            quantity,
            charge,
            status: "pending",
          },
        });
      });

      // If connected to remote provider, optionally forward order
      if (service.provider && service.providerServiceId) {
        try {
          const client = new SMMProviderClient(
            service.provider.url,
            service.provider.apiKey,
            service.provider.username || undefined
          );
          await client.createOrder({
            service: service.providerServiceId,
            link,
            quantity,
          });
        } catch (provErr) {
          console.error("Failed to forward order to remote provider:", provErr);
          // Order remains recorded in database
        }
      }

      return NextResponse.json({ order: newOrder.id });
    }

    // 4. ACTION: STATUS (Single or Multiple)
    if (action === "status") {
      // Multiple orders check
      if (params.orders) {
        const orderIds = String(params.orders)
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));

        const orders = await prisma.order.findMany({
          where: {
            id: { in: orderIds },
            userId: user.id,
          },
        });

        const result: Record<string, any> = {};
        for (const id of orderIds) {
          const found = orders.find((o) => o.id === id);
          if (found) {
            result[String(id)] = {
              charge: found.charge.toFixed(2),
              start_count: String(found.startCount || 0),
              status: found.status,
              remains: String(found.remains || 0),
              currency: "USD",
            };
          } else {
            result[String(id)] = { error: "Incorrect order ID" };
          }
        }

        return NextResponse.json(result);
      }

      // Single order check
      const orderId = parseInt(String(params.order), 10);
      if (!orderId) {
        return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: user.id,
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Incorrect order ID" }, { status: 400 });
      }

      return NextResponse.json({
        charge: order.charge.toFixed(2),
        start_count: String(order.startCount || 0),
        status: order.status,
        remains: String(order.remains || 0),
        currency: "USD",
      });
    }

    return NextResponse.json({ error: "Incorrect request" }, { status: 400 });
  } catch (error: any) {
    console.error("API v2 error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support GET /api/v2?action=services as per standard
  const action = req.nextUrl.searchParams.get("action");
  if (action === "services") {
    return POST(req);
  }
  return NextResponse.json({
    message: "SMM Lacost API v2 is active. Please use HTTP POST.",
    docs: "/home/api",
  });
}

