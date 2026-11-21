"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layers, Search, ChevronDown, ChevronUp, Info } from "lucide-react";
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
  { id: 0, name: "الكل", slug: "all" },
  { id: 1, name: "Instagram", slug: "instagram" },
  { id: 2, name: "TikTok", slug: "tiktok" },
  { id: 3, name: "YouTube", slug: "youtube" },
  { id: 4, name: "Facebook", slug: "facebook" },
  { id: 5, name: "Twitter / X", slug: "twitter" },
  { id: 6, name: "Telegram", slug: "telegram" },
];

const fallbackServices: ServiceItem[] = [
  { id: 1, categoryId: 1, name: "متابعين انستجرام [حقيقي - ضمان 30 يوم]", rate: 0.90, minQuantity: 100, maxQuantity: 100000 },
  { id: 2, categoryId: 1, name: "لايكات انستجرام [سريعة وجودة عالية]", rate: 0.50, minQuantity: 50, maxQuantity: 50000 },
  { id: 3, categoryId: 1, name: "مشاهدات ريلز انستجرام", rate: 0.10, minQuantity: 100, maxQuantity: 1000000 },
  { id: 4, categoryId: 1, name: "تعليقات انستجرام مخصصة", rate: 5.00, minQuantity: 10, maxQuantity: 5000 },
  { id: 5, categoryId: 2, name: "متابعين تيك توك [جودة فائقة]", rate: 1.20, minQuantity: 100, maxQuantity: 50000 },
  { id: 6, categoryId: 2, name: "لايكات تيك توك [بدء فوري]", rate: 0.40, minQuantity: 50, maxQuantity: 100000 },
  { id: 7, categoryId: 2, name: "مشاهدات تيك توك [حقيقية]", rate: 0.08, minQuantity: 500, maxQuantity: 5000000 },
  { id: 8, categoryId: 2, name: "مشاركات تيك توك (Shares)", rate: 0.60, minQuantity: 100, maxQuantity: 100000 },
  { id: 9, categoryId: 3, name: "مشتركين يوتيوب [عدم نقص]", rate: 3.00, minQuantity: 50, maxQuantity: 10000 },
  { id: 10, categoryId: 3, name: "مشاهدات يوتيوب [احتباس عالي]", rate: 1.50, minQuantity: 100, maxQuantity: 100000 },
  { id: 11, categoryId: 3, name: "لايكات يوتيوب", rate: 1.00, minQuantity: 50, maxQuantity: 50000 },
  { id: 12, categoryId: 4, name: "لايكات ومتابعين صفحات فيسبوك", rate: 1.00, minQuantity: 100, maxQuantity: 50000 },
  { id: 13, categoryId: 4, name: "لايكات منشورات فيسبوك", rate: 0.50, minQuantity: 50, maxQuantity: 100000 },
  { id: 14, categoryId: 5, name: "متابعين منصة X (تويتر)", rate: 2.00, minQuantity: 100, maxQuantity: 50000 },
  { id: 15, categoryId: 5, name: "إعادات تغريد ولايكات X", rate: 0.80, minQuantity: 50, maxQuantity: 100000 },
  { id: 16, categoryId: 6, name: "أعضاء قنوات تليجرام", rate: 1.50, minQuantity: 100, maxQuantity: 100000 },
  { id: 17, categoryId: 6, name: "مشاهدات منشورات تليجرام", rate: 0.05, minQuantity: 500, maxQuantity: 1000000 },
];

export default function ServicesPage() {
  const { formatAmount, symbol } = useCurrency();
  const [categories, setCategories] = useState<CategoryItem[]>(fallbackCategories);
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const loadedCats: CategoryItem[] = [
            { id: 0, name: "الكل", slug: "all" },
            ...data.data.map((c: CategoryItem) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            })),
          ];

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

  const filtered = useMemo(() => {
    let items = services;
    if (activeCategory > 0) {
      items = items.filter((s) => s.categoryId === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((s) => s.id.toString().includes(q) || s.name.toLowerCase().includes(q));
    }
    return items;
  }, [services, activeCategory, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white">
          <Layers className="size-6 text-gray-400" />
          قائمة الخدمات (Services)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          استعرض جميع الخدمات والأسعار المتوفرة في منصة لاكوست
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الخدمة (ID) أو بالاسم..."
          className="w-full h-11 pr-11 pl-4 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer border
              ${
                activeCategory === cat.id
                  ? "bg-[#00df82] text-black font-extrabold border-[#00df82] shadow-md shadow-[#00df82]/25"
                  : "bg-zinc-900/80 text-gray-400 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-[#00df82]/30"
              }
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400">
                <th className="text-right px-4 py-3.5 font-medium w-16">المعرف</th>
                <th className="text-right px-4 py-3.5 font-medium">اسم الخدمة</th>
                <th className="text-center px-4 py-3.5 font-medium w-36">السعر / 1K ({symbol})</th>
                <th className="text-center px-4 py-3.5 font-medium w-28">الحد الأدنى</th>
                <th className="text-center px-4 py-3.5 font-medium w-28">الحد الأقصى</th>
                <th className="text-center px-4 py-3.5 font-medium w-20">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    لا توجد خدمات مطابقة
                  </td>
                </tr>
              ) : (
                filtered.map((svc, i) => {
                  const isExpanded = expandedId === svc.id;
                  return (
                    <React.Fragment key={svc.id}>
                      <tr
                        className={`border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors ${
                          i % 2 === 0 ? "bg-zinc-900/30" : "bg-transparent"
                        }`}
                      >
                        <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                          #{svc.id}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-200">{svc.name}</td>
                        <td className="px-4 py-3.5 text-center text-[#00df82] font-bold font-mono drop-shadow-[0_0_6px_rgba(0,223,130,0.3)]">
                          {formatAmount(svc.rate)}
                        </td>
                        <td className="px-4 py-3.5 text-center text-gray-400 font-mono">
                          {svc.minQuantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center text-gray-400 font-mono">
                          {svc.maxQuantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {svc.description ? (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : svc.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 text-xs"
                              title="عرض التفاصيل والوصف"
                            >
                              <Info className="size-3.5" />
                              {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            </button>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && svc.description && (
                        <tr className="bg-zinc-950/70 border-b border-zinc-800">
                          <td colSpan={6} className="px-6 py-3 text-xs text-gray-300">
                            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 whitespace-pre-line leading-relaxed">
                              <span className="text-white font-semibold block mb-1">تفاصيل الخدمة #{svc.id}:</span>
                              {svc.description}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        عرض {filtered.length} من أصل {services.length} خدمة
      </p>
    </div>
  );
}
