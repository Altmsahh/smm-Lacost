import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SMMProviderClient, RemoteService } from "@/lib/provider-api";
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      providerId,
      url,
      apiKey,
      username,
      markupPercent = 30, // نسبة المكسب الافتراضية 30%
      mode = "preview", // "preview" or "import"
    } = body;

    let targetUrl = url;
    let targetApiKey = apiKey;
    let targetUsername = username;
    let dbProvider = null;

    if (providerId) {
      dbProvider = await prisma.provider.findUnique({
        where: { id: Number(providerId) },
      });
      if (!dbProvider) {
        return NextResponse.json({ error: "المزود غير موجود" }, { status: 404 });
      }
      targetUrl = dbProvider.url;
      targetApiKey = dbProvider.apiKey;
      targetUsername = dbProvider.username;
    }

    if (!targetUrl || !targetApiKey) {
      return NextResponse.json(
        { error: "يرجى تحديد رابط المزود ومفتاح API" },
        { status: 400 }
      );
    }

    const client = new SMMProviderClient(targetUrl, targetApiKey, targetUsername);
    const remoteServices = await client.getServices();

    if (!remoteServices || remoteServices.length === 0) {
      return NextResponse.json({
        success: true,
        message: "لم يتم العثور على أي خدمات متاحة على سيرفر المزود",
        data: { services: [], total: 0 },
      });
    }

    // معادلة إضافة نسبة الربح (مثلاً 30% -> 1.30)
    const profitRatePercent = Number(markupPercent ?? 30);
    const markupMultiplier = 1 + profitRatePercent / 100;

    // PREVIEW MODE: عرض المعاينة فقط مع احتساب سعر البيع بزيادة 30%
    if (mode === "preview") {
      const previewList = remoteServices.slice(0, 100).map((s: RemoteService) => {
        const origRate = parseFloat(String(s.rate || 0));
        // سعر البيع النهائي = سعر التكلفة + 30%
        const finalRate = parseFloat((origRate * markupMultiplier).toFixed(4));
        return {
          id: s.service, // رقم معرف الخدمة لدى السيرفر الداعم
          name: s.name,
          category: s.category || "General",
          originalRate: origRate,
          finalRate: finalRate,
          markup: `${profitRatePercent}%`,
          min: Number(s.min) || 1,
          max: Number(s.max) || 100000,
          type: s.type || "default",
          description: s.desc || s.description || "",
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          totalRemote: remoteServices.length,
          preview: previewList,
          markupPercent: profitRatePercent,
        },
      });
    }

    // IMPORT MODE: حفظ وتحديث الخدمات في قاعدة البيانات
    let createdOrFoundProviderId = dbProvider?.id;
    if (!createdOrFoundProviderId) {
      const newProv = await prisma.provider.create({
        data: {
          name: "External Provider",
          url: targetUrl.trim(),
          apiKey: targetApiKey.trim(),
          username: targetUsername ? targetUsername.trim() : null,
        },
      });
      createdOrFoundProviderId = newProv.id;
    }

    // جلب الأقسام الحالية لتفادي التكرار
    const existingCategories = await prisma.serviceCategory.findMany();
    const categoryMap = new Map<string, number>();
    existingCategories.forEach((c) => {
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
    });

    let importedCount = 0;
    let updatedCount = 0;

    for (const s of remoteServices) {
      const catName = (s.category || "General").trim();
      const catKey = catName.toLowerCase();
      let categoryId = categoryMap.get(catKey);

      if (!categoryId) {
        let slug = slugify(catName);
        const slugExists = await prisma.serviceCategory.findUnique({ where: { slug } });
        if (slugExists) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        const createdCat = await prisma.serviceCategory.create({
          data: {
            name: catName,
            slug,
          },
        });
        categoryId = createdCat.id;
        categoryMap.set(catKey, categoryId);
      }

      // احتساب السعر الأصلي وسعر البيع بعد إضافة نسبة الربح 30%
      const origRate = parseFloat(String(s.rate || 0)) || 0;
      const finalRate = parseFloat((origRate * markupMultiplier).toFixed(4));
      const minQty = parseInt(String(s.min || 10), 10) || 10;
      const maxQty = parseInt(String(s.max || 100000), 10) || 100000;
      const remoteServiceId = parseInt(String(s.service), 10) || null;
      const serviceDesc = (s.desc || s.description || "").trim() || null;

      // فحص إذا كانت الخدمة موجودة مسبقاً بنفس رقم الخدمة لدى المزود
      const existingService = await prisma.service.findFirst({
        where: {
          providerId: createdOrFoundProviderId,
          providerServiceId: remoteServiceId,
        },
      });

      if (existingService) {
        await prisma.service.update({
          where: { id: existingService.id },
          data: {
            name: s.name,
            description: serviceDesc,
            categoryId,
            originalRate: origRate,
            rate: finalRate, // السعر المحدث بعد الـ 30%
            minQuantity: minQty,
            maxQuantity: maxQty,
            type: s.type || "default",
            isActive: true,
          },
        });
        updatedCount++;
      } else {
        await prisma.service.create({
          data: {
            name: s.name,
            description: serviceDesc,
            categoryId,
            providerId: createdOrFoundProviderId,
            providerServiceId: remoteServiceId,
            originalRate: origRate,
            rate: finalRate, // السعر للعميل شاملاً مكسب 30%
            minQuantity: minQty,
            maxQuantity: maxQty,
            type: s.type || "default",
            isActive: true,
          },
        });
        importedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم بنجاح سحب الخدمات وتطبيق نسبة مكسب +${profitRatePercent}%! تمت إضافة ${importedCount} خدمة برقم ID تلقائي، وتحديث ${updatedCount} خدمة موجودة.`,
      data: {
        totalProcessed: remoteServices.length,
        importedCount,
        updatedCount,
        markupPercent: profitRatePercent,
        categoriesCount: categoryMap.size,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/providers/sync error:", error);
    const msg = error instanceof Error ? error.message : "فشل سحب الخدمات من المزود";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
