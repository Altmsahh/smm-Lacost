"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  ExternalLink,
  AlertCircle,
  Search,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useCurrency } from "@/providers";

interface ServiceItem {
  id: number;
  categoryId: number;
  name: string;
  rate: number;
  minQuantity: number;
  maxQuantity: number;
  description?: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  services?: ServiceItem[];
}

const fallbackCategories: CategoryItem[] = [
  { id: 1, name: "Instagram - انستجرام", slug: "instagram" },
  { id: 2, name: "TikTok - تيك توك", slug: "tiktok" },
  { id: 3, name: "YouTube - يوتيوب", slug: "youtube" },
  { id: 4, name: "Facebook - فيسبوك", slug: "facebook" },
  { id: 5, name: "Twitter / X - تويتر", slug: "twitter" },
  { id: 6, name: "Telegram - تليجرام", slug: "telegram" },
];

const fallbackServices: ServiceItem[] = [
  { id: 1, categoryId: 1, name: "متابعين انستجرام [حقيقي - ضمان 30 يوم]", rate: 0.90, minQuantity: 100, maxQuantity: 100000 },
  { id: 2, categoryId: 1, name: "لايكات انستجرام [سريعة وجودة عالية]", rate: 0.50, minQuantity: 50, maxQuantity: 50000 },
  { id: 3, categoryId: 1, name: "مشاهدات ريلز انستجرام", rate: 0.10, minQuantity: 100, maxQuantity: 1000000 },
  { id: 4, categoryId: 2, name: "متابعين تيك توك [جودة فائقة]", rate: 1.20, minQuantity: 100, maxQuantity: 50000 },
  { id: 5, categoryId: 2, name: "لايكات تيك توك [بدء فوري]", rate: 0.40, minQuantity: 50, maxQuantity: 100000 },
  { id: 6, categoryId: 2, name: "مشاهدات تيك توك [فيديو]", rate: 0.08, minQuantity: 500, maxQuantity: 5000000 },
  { id: 7, categoryId: 3, name: "مشتركين يوتيوب [ضمان عدم النقص]", rate: 3.00, minQuantity: 50, maxQuantity: 10000 },
  { id: 8, categoryId: 3, name: "مشاهدات يوتيوب [احتباس عالي]", rate: 1.50, minQuantity: 100, maxQuantity: 100000 },
  { id: 9, categoryId: 4, name: "لايكات ومتابعين صفحات فيسبوك", rate: 1.00, minQuantity: 100, maxQuantity: 50000 },
  { id: 10, categoryId: 5, name: "متابعين منصة X (تويتر)", rate: 2.00, minQuantity: 100, maxQuantity: 50000 },
  { id: 11, categoryId: 6, name: "أعضاء قنوات تليجرام", rate: 1.50, minQuantity: 100, maxQuantity: 100000 },
];

type PlatformKey = "all" | "facebook" | "instagram" | "tiktok" | "youtube" | "twitter" | "telegram";

interface PlatformDef {
  key: PlatformKey;
  label: string;
  icon: React.ReactNode;
}

const platforms: PlatformDef[] = [
  {
    key: "all",
    label: "الكل",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "فيسبوك",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "انستجرام",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="ig-grad-new" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="25%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="100%" stopColor="#285AEB" />
          </linearGradient>
        </defs>
        <path
          fill="url(#ig-grad-new)"
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "تيك توك",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "يوتيوب",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "منصة X (تويتر)",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "telegram",
    label: "تليجرام",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="#24A1DE">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
      </svg>
    ),
  },
];

function isMatchPlatform(categoryName: string, serviceName: string, key: PlatformKey): boolean {
  if (key === "all") return true;
  const text = `${categoryName} ${serviceName}`.toLowerCase();
  switch (key) {
    case "facebook":
      return text.includes("facebook") || text.includes("فيسبوك") || text.includes("فيس") || text.includes("fb");
    case "instagram":
      return text.includes("instagram") || text.includes("انستجرام") || text.includes("انستا") || text.includes("ig");
    case "tiktok":
      return text.includes("tiktok") || text.includes("تيك توك") || text.includes("تيك");
    case "youtube":
      return text.includes("youtube") || text.includes("يوتيوب") || text.includes("yt");
    case "twitter":
      return text.includes("twitter") || text.includes("تويتر") || text.includes(" x ") || text.includes("منصة x");
    case "telegram":
      return text.includes("telegram") || text.includes("تليجرام") || text.includes("tg");
    default:
      return true;
  }
}

export default function NewOrderPage() {
  const { formatAmount } = useCurrency();
  const [categories, setCategories] = useState<CategoryItem[]>(fallbackCategories);
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices);

  const [activePlatform, setActivePlatform] = useState<PlatformKey>("all");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedService, setSelectedService] = useState<number | "">("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: number;
    charge: number;
    serviceName: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const loadedCats: CategoryItem[] = data.data.map((c: CategoryItem) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          }));

          const loadedServices: ServiceItem[] = [];
          data.data.forEach((c: CategoryItem) => {
            if (c.services) {
              c.services.forEach((s: ServiceItem) => {
                loadedServices.push({
                  id: s.id,
                  categoryId: c.id,
                  name: s.name,
                  rate: s.rate,
                  minQuantity: s.minQuantity,
                  maxQuantity: s.maxQuantity,
                  description: s.description || "",
                });
              });
            }
          });

          if (loadedServices.length > 0) {
            setCategories(loadedCats);
            setServices(loadedServices);
          }
        }
      })
      .catch((err) => console.error("Could not fetch DB services, using fallback", err));
  }, []);

  // Filter categories matching active platform
  const platformCategories = useMemo(() => {
    if (activePlatform === "all") return categories;
    return categories.filter((cat) => {
      const catMatches = isMatchPlatform(cat.name, "", activePlatform);
      if (catMatches) return true;
      return services.some((s) => s.categoryId === cat.id && isMatchPlatform(cat.name, s.name, activePlatform));
    });
  }, [categories, services, activePlatform]);

  // Filter services based on platform AND selected category
  const platformServices = useMemo(() => {
    return services.filter((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      const catName = cat?.name || "";
      if (!isMatchPlatform(catName, s.name, activePlatform)) return false;
      if (selectedCategory && s.categoryId !== selectedCategory) return false;
      return true;
    });
  }, [services, categories, activePlatform, selectedCategory]);

  // Search filter by ID or Name
  const visibleServices = useMemo(() => {
    let list = platformServices;
    if (serviceSearch.trim()) {
      const q = serviceSearch.toLowerCase().trim();
      list = list.filter((s) => s.id.toString().includes(q) || s.name.toLowerCase().includes(q));
    }
    return list;
  }, [platformServices, serviceSearch]);

  const handleSelectPlatform = (key: PlatformKey) => {
    setActivePlatform(key);
    setSelectedCategory("");
    setSelectedService("");
    setServiceSearch("");
  };

  const currentService = services.find((s) => s.id === selectedService);
  const totalChargeUsd = currentService && quantity
    ? (Number(quantity) * currentService.rate) / 1000
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService || !link || !quantity) return;
    setOrderError(null);
    setOrderSuccessData(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!currentService || !link || !quantity) return;
    setSubmitting(true);
    setOrderError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          serviceId: currentService.id,
          link: link.trim(),
          quantity: Number(quantity),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrderError(data.error || "فشل تنفيذ الطلب");
        setSubmitting(false);
        return;
      }

      setOrderSuccessData({
        orderId: data.data.orderId,
        charge: data.data.charge,
        serviceName: data.data.serviceName || currentService.name,
      });
      setSuccess(true);
      // Reset inputs
      setSelectedCategory("");
      setSelectedService("");
      setServiceSearch("");
      setLink("");
      setQuantity("");
    } catch {
      setOrderError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-7 text-white">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5 text-white">
          <ShoppingCart className="size-7 text-gray-400" />
          طلب جديد (New Order)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          اختر المنصة أو ابحث برقم الخدمة ID، وضع الرابط والكمية لتقديم الطلب فوراً
        </p>
      </div>

      {/* Platform Icons Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-white">
          اختر المنصة (Select Platform):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {platforms.map((p) => {
            const isActive = activePlatform === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handleSelectPlatform(p.key)}
                className={`
                  p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group
                  ${
                    isActive
                      ? "bg-emerald-950/60 text-[#00df82] border-[#00df82] shadow-[0_0_20px_rgba(0,223,130,0.25)] ring-1 ring-[#00df82]"
                      : "bg-zinc-950/80 border-zinc-800/90 text-gray-300 hover:border-[#00df82]/40 hover:bg-zinc-900 hover:text-white"
                  }
                `}
              >
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800/80 group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <span className="text-xs font-bold tracking-tight text-center truncate w-full">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-gray-200 text-sm font-medium shadow-md">
          ✅ تم إرسال طلبك بنجاح! يمكنك تتبعه في صفحة &quot;طلباتي&quot;.
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-zinc-900/60 p-6 sm:p-8 rounded-2xl border border-zinc-800 shadow-xl">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">
            القسم (Category)
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : "");
              setSelectedService("");
            }}
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            <option value="">— جميع أقسام {platforms.find((p) => p.key === activePlatform)?.label} —</option>
            {platformCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Service with Quick ID Search */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white">
              الخدمة (Service)
            </label>
            <span className="text-xs text-gray-400">
              ({visibleServices.length} خدمة متوفرة)
            </span>
          </div>

          {/* Quick ID / Name Search Input */}
          <div className="relative mb-2.5">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => {
                const val = e.target.value;
                setServiceSearch(val);
                // If typed exact ID number, auto-select it
                const exact = services.find((s) => s.id.toString() === val.trim());
                if (exact) {
                  setSelectedService(exact.id);
                  setSelectedCategory(exact.categoryId);
                }
              }}
              placeholder="اكتب رقم الخدمة (ID) للوصول المباشر أو ابحث بالاسم..."
              className="w-full h-10 pr-10 pl-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <select
            value={selectedService}
            onChange={(e) =>
              setSelectedService(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            <option value="">— اختر الخدمة المطلوبة —</option>
            {visibleServices.map((svc) => (
              <option key={svc.id} value={svc.id}>
                [ID: {svc.id}] — {svc.name} — {formatAmount(svc.rate)} / 1K
              </option>
            ))}
          </select>
        </div>

        {/* Service Info Banner */}
        {currentService && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-gray-400">رقم الخدمة (Service ID):</span>
              <span className="font-mono font-bold text-white px-2.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-xs">
                #{currentService.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">السعر لكل 1,000 (شامل مكسب 30%):</span>
              <span className="font-semibold text-white font-mono">{formatAmount(currentService.rate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الحد الأدنى:</span>
              <span className="font-mono text-gray-200">{currentService.minQuantity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الحد الأقصى:</span>
              <span className="font-mono text-gray-200">{currentService.maxQuantity.toLocaleString()}</span>
            </div>
            {currentService.description && (
              <div className="pt-2.5 mt-1 border-t border-zinc-800 text-xs text-gray-300 whitespace-pre-line leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="text-white font-semibold block mb-1">تفاصيل الخدمة:</span>
                {currentService.description}
              </div>
            )}
          </div>
        )}

        {/* Link Input */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">
            الرابط (Link) <ExternalLink className="inline size-3.5 mr-1 text-gray-400" />
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://... رابط الحساب أو المنشور"
            dir="ltr"
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
            required
          />
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">
            الكمية (Quantity)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={
              currentService
                ? `الحد الأدنى: ${currentService.minQuantity} — الحد الأقصى: ${currentService.maxQuantity}`
                : "أدخل الكمية المطلوبة"
            }
            min={currentService?.minQuantity || 1}
            max={currentService?.maxQuantity || 1000000}
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50 font-mono"
            required
          />
        </div>

        {/* Total Charge Summary */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">
              التكلفة الإجمالية:
            </span>
            <span className="text-xl font-bold text-[#00df82] font-mono drop-shadow-[0_0_8px_rgba(0,223,130,0.3)]">
              {formatAmount(totalChargeUsd, 4)}
            </span>
          </div>
          {Number(quantity) > 0 && currentService && Number(quantity) < currentService.minQuantity && (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1 font-medium">
              <AlertCircle className="size-3" />
              الحد الأدنى للكمية هو {currentService.minQuantity.toLocaleString()}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!currentService || !link || !quantity || submitting}
          className="w-full h-11 bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold text-base rounded-xl cursor-pointer disabled:opacity-40 transition-all shadow-lg shadow-[#00df82]/25"
        >
          تأكيد ومراجعة الطلب
        </Button>
      </form>

      {/* Order Confirmation & Details Dialog */}
      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!submitting) {
            setIsConfirmOpen(open);
            if (!open) {
              setOrderError(null);
              setOrderSuccessData(null);
            }
          }
        }}
      >
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 p-6 rounded-2xl shadow-2xl">
          {/* Header with Server Logo & Name */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-800">
            <div className="relative size-12 rounded-[14px] p-0.5 border border-emerald-500/40 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-lg shadow-black/50 ring-1 ring-[#00df82]/30 shrink-0">
              <div className="relative w-full h-full rounded-[12px] overflow-hidden">
                <Image
                  src="/logo-new.png"
                  alt="SMM Lacost Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  <span className="text-[#00df82] font-black">SMM</span> Lacost
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-[#00df82] border border-[#00df82]/40 font-semibold">
                  Luxury Server
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {orderSuccessData ? "تم تأكيد وتنفيذ الطلب بنجاح" : "مراجعة وتأكيد تفاصيل الطلب"}
              </p>
            </div>
          </div>

          {/* Success State */}
          {orderSuccessData ? (
            <div className="py-4 space-y-4 text-center">
              <div className="size-14 mx-auto rounded-full bg-green-950/60 border border-green-800/80 flex items-center justify-center text-green-400 shadow-lg">
                <CheckCircle2 className="size-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">تم إرسال طلبك بنجاح!</h4>
                <p className="text-xs text-gray-400 mt-1">
                  رقم معرف الطلب (Order ID):{" "}
                  <strong className="text-white font-mono">#{orderSuccessData.orderId}</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-gray-300 space-y-1">
                <p>
                  الخدمة: <strong className="text-white">{orderSuccessData.serviceName}</strong>
                </p>
                <p>
                  تم خصم مبلغ{" "}
                  <strong className="text-white font-mono">
                    {formatAmount(orderSuccessData.charge, 4)}
                  </strong>{" "}
                  من رصيدك.
                </p>
                <p className="text-gray-400">
                  بدأ السيرفر معالجة الطلب فوراً، ويمكنك تتبعه في صفحة طلباتي.
                </p>
              </div>

              <Button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setOrderSuccessData(null);
                }}
                className="w-full bg-white hover:bg-gray-200 text-black font-bold h-11 rounded-xl cursor-pointer"
              >
                تم ومتابعة
              </Button>
            </div>
          ) : (
            /* Confirmation State */
            <div className="py-2 space-y-4">
              {orderError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Service & Details Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-1.5">
                  <span className="text-gray-400 block font-semibold">الخدمة المطلوبة:</span>
                  <p className="text-white font-bold text-sm leading-snug">
                    <span className="font-mono text-gray-400">#{currentService?.id}</span>{" "}
                    {currentService?.name}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-1.5">
                  <span className="text-gray-400 block font-semibold">الرابط المستهدف:</span>
                  <p className="text-white font-mono break-all line-clamp-2" dir="ltr">
                    {link}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80">
                    <span className="text-gray-400 block font-semibold mb-0.5">الكمية:</span>
                    <span className="text-white font-bold font-mono text-sm">
                      {Number(quantity).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80">
                    <span className="text-gray-400 block font-semibold mb-0.5">السعر / 1K:</span>
                    <span className="text-white font-bold font-mono text-sm">
                      {currentService ? formatAmount(currentService.rate) : "—"}
                    </span>
                  </div>
                </div>

                {/* Total Price Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 border border-[#00df82]/30 flex items-center justify-between shadow-[0_0_20px_rgba(0,223,130,0.1)]">
                  <div>
                    <span className="text-xs font-semibold text-gray-300 block">
                      السعر الإجمالي المطلوب:
                    </span>
                    <span className="text-[11px] text-gray-500">شامل كافة الرسوم والمكسب</span>
                  </div>
                  <span className="text-xl font-extrabold text-[#00df82] font-mono drop-shadow-[0_0_8px_rgba(0,223,130,0.4)]">
                    {formatAmount(totalChargeUsd, 4)}
                  </span>
                </div>
              </div>

              {/* Dialog Actions */}
              <div className="pt-2 flex items-center gap-2.5">
                <Button
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  className="flex-1 bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold h-11 rounded-xl cursor-pointer shadow-lg shadow-[#00df82]/25"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      جاري التنفيذ...
                    </span>
                  ) : (
                    "تأكيد وخصم المبلغ"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={submitting}
                  className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-white h-11 rounded-xl cursor-pointer px-4"
                >
                  تعديل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
