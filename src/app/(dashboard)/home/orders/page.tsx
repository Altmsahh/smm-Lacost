"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, ExternalLink, Search, RefreshCw } from "lucide-react";
import { useCurrency } from "@/providers";

type OrderStatus = "pending" | "in_progress" | "completed" | "partial" | "cancelled" | "refunded";

interface OrderItem {
  id: number;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: OrderStatus;
  startCount?: number;
  remains?: number;
  createdAt: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-zinc-800 text-gray-300 border-zinc-700" },
  in_progress: { label: "قيد التنفيذ", color: "bg-blue-950/40 text-blue-400 border-blue-800/40" },
  completed: { label: "مكتمل", color: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" },
  partial: { label: "مكتمل جزئياً", color: "bg-orange-950/40 text-orange-400 border-orange-800/40" },
  cancelled: { label: "ملغي", color: "bg-red-950/40 text-red-400 border-red-800/40" },
  refunded: { label: "تم التعويض", color: "bg-purple-950/40 text-purple-400 border-purple-800/40" },
};

export default function OrdersPage() {
  const { formatAmount } = useCurrency();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/orders", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.serviceName.toLowerCase().includes(q) ||
        o.link.toLowerCase().includes(q) ||
        o.id.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white">
          <ShoppingCart className="size-6 text-gray-400" />
          طلباتي (My Orders)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          تتبع حالة طلباتك وتاريخ تنفيذها
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الطلب، الخدمة، أو الرابط..."
            className="w-full h-11 pr-11 pl-4 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="h-11 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50"
        >
          <option value="all">جميع الحالات</option>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
          <ShoppingCart className="size-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-300">
            لا توجد طلبات بعد
          </h3>
          <p className="text-sm text-gray-500 mt-1.5">
            قم بإنشاء أول طلب لك من صفحة &quot;طلب جديد&quot;!
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-800 text-gray-400">
                  <th className="text-right px-4 py-3.5 font-medium">رقم الطلب</th>
                  <th className="text-right px-4 py-3.5 font-medium">الخدمة</th>
                  <th className="text-right px-4 py-3.5 font-medium">الرابط</th>
                  <th className="text-center px-4 py-3.5 font-medium">الكمية</th>
                  <th className="text-center px-4 py-3.5 font-medium">التكلفة</th>
                  <th className="text-center px-4 py-3.5 font-medium">الحالة</th>
                  <th className="text-center px-4 py-3.5 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">#{order.id}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-200 max-w-[200px] truncate">
                      {order.serviceName}
                    </td>
                    <td className="px-4 py-3.5 max-w-[150px]">
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="size-3 shrink-0 text-gray-500" />
                        <span className="truncate">{order.link}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-gray-300">{order.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center text-white font-bold font-mono">
                      {formatAmount(order.charge, 4)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          statusConfig[order.status].color
                        }`}
                      >
                        {statusConfig[order.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500 text-xs font-mono">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
