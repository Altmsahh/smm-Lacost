"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Clock,
  PlusCircle,
  Layers,
  CheckCircle2,
  Server,
  Activity,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services";
import { useCurrency } from "@/providers";
import type { User } from "@/types";

interface ServerStats {
  totalServerOrders: number;
  totalServices: number;
  totalCompletedServer: number;
  userActiveOrders: number;
  userCompletedOrders: number;
  userTotalSpent: number;
  userTotalOrders: number;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("auth_user");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return null;
  });
  const [stats, setStats] = useState<ServerStats>({
    totalServerOrders: 0,
    totalServices: 0,
    totalCompletedServer: 0,
    userActiveOrders: 0,
    userCompletedOrders: 0,
    userTotalSpent: 0,
    userTotalOrders: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const { formatAmount } = useCurrency();

  const displayName = user?.username || (user?.email ? user.email.split("@")[0] : "");

  useEffect(() => {
    const cached = authService.getCurrentUser();
    if (cached) setUser(cached);

    authService.getProfile().then((fresh) => {
      if (fresh) setUser(fresh);
    });

    const fetchStats = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;
        const res = await fetch("/api/stats", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load server stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Welcome Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 shadow-xl shadow-black/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00df82]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 border border-[#00df82]/30 text-[#00df82] uppercase tracking-widest font-mono font-bold">
                Lacost SMM Panel
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900 border border-[#00df82]/30 text-[#00df82]">
                <span className="size-1.5 rounded-full bg-[#00df82] animate-pulse" />
                سيرفر متصل 24/7
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center flex-wrap gap-2">
              <span>أهلاً بك</span>
              {displayName ? (
                <span className="text-[#00df82] font-black drop-shadow-[0_0_15px_rgba(0,223,130,0.5)]">
                  ، {displayName}
                </span>
              ) : null}
              <span>👋</span>
            </h2>
            <p className="mt-2 text-sm text-gray-300 max-w-2xl leading-relaxed">
              تحكم بجميع حملاتك لوسائل التواصل الاجتماعي، راقب تنفيذ الطلبات، واشحن رصيدك بكل سهولة.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/home/add-funds">
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                شحن الرصيد
              </Button>
            </Link>
            <Link href="/home/new-order">
              <Button className="bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-[#00df82]/25 hover:shadow-[#00df82]/40 transition-all">
                + طلب جديد
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Server Overview Banner — عدد الطلبات في السيرفر */}
      <div className="relative overflow-hidden rounded-2xl border border-[#00df82]/30 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-black p-6 shadow-2xl shadow-black/80">
        <div className="absolute top-0 -left-10 w-64 h-64 bg-[#00df82]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-zinc-800/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-[#00df82]/40 text-[#00df82] shadow-[0_0_15px_rgba(0,223,130,0.2)]">
                <Server className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  إحصائيات خادم Lacost المباشرة
                  <Sparkles className="size-4 text-[#00df82]" />
                </h3>
                <p className="text-xs text-gray-400">
                  مراقبة حية لحظية لعدد طلبات السيرفر وحالة التنفيذ التلقائي
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-[#00df82]/30 text-[#00df82] text-xs font-medium">
                <span className="size-2 rounded-full bg-[#00df82] animate-ping" />
                <span>الربط التلقائي نشط</span>
              </div>
              <Link
                href="/home/api"
                className="text-xs text-gray-400 hover:text-[#00df82] flex items-center gap-1 transition-colors px-2 py-1"
              >
                <span>توثيق الـ API</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Server Orders Counter */}
            <div className="p-4 rounded-xl bg-zinc-950/90 border border-[#00df82]/30 shadow-inner group hover:border-[#00df82]/60 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">
                  إجمالي طلبات السيرفر
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-950/60 text-[#00df82]">
                  <Activity className="size-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#00df82] font-mono tracking-tight drop-shadow-[0_0_12px_rgba(0,223,130,0.4)]">
                  {loadingStats ? "..." : stats.totalServerOrders.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-emerald-400 font-bold">طلب</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <span className="text-[#00df82]">●</span> عدد الطلبات الكلي المنفذة
              </p>
            </div>

            {/* Total Active Services */}
            <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/80 shadow-inner group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">
                  الخدمات المتاحة
                </span>
                <span className="p-1.5 rounded-lg bg-zinc-900 text-gray-300">
                  <Layers className="size-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {loadingStats ? "..." : stats.totalServices.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-gray-400 font-bold">خدمة</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <span className="text-emerald-400">✓</span> نشطة ومحدثة الأسعار
              </p>
            </div>

            {/* Completed Server Orders */}
            <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/80 shadow-inner group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">
                  طلبات ناجحة ومكتملة
                </span>
                <span className="p-1.5 rounded-lg bg-zinc-900 text-[#00df82]">
                  <CheckCircle2 className="size-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {loadingStats ? "..." : stats.totalCompletedServer.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-gray-400 font-bold">مكتمل</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <span className="text-[#00df82]">99.8%</span> نسبة نجاح التنفيذ
              </p>
            </div>

            {/* API Speed / Instant Execution */}
            <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/80 shadow-inner group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">
                  سرعة التنفيذ والاستجابة
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-950/50 text-[#00df82]">
                  <Zap className="size-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#00df82] font-mono tracking-tight">
                  فوري
                </span>
                <span className="text-xs text-gray-400 font-bold">0.8s</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="size-3 text-[#00df82]" />
                حماية وأمان كامل
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 shadow-md flex items-center justify-between hover:border-[#00df82]/40 hover:shadow-[0_0_20px_rgba(0,223,130,0.12)] transition-all">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              رصيد حسابك
            </p>
            <p className="text-2xl font-bold mt-1 text-[#00df82] font-mono drop-shadow-[0_0_8px_rgba(0,223,130,0.3)]">
              {formatAmount(user?.balance ?? 0)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-[#00df82]/30 text-[#00df82]">
            <Wallet className="size-5" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 shadow-md flex items-center justify-between hover:border-zinc-700 transition-all">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              طلباتك النشطة
            </p>
            <p className="text-2xl font-bold mt-1 text-white font-mono">
              {loadingStats ? "..." : stats.userActiveOrders}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-400">
            <Clock className="size-5" />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 shadow-md flex items-center justify-between hover:border-[#00df82]/30 transition-all">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              طلباتك المكتملة
            </p>
            <p className="text-2xl font-bold mt-1 text-white font-mono">
              {loadingStats ? "..." : stats.userCompletedOrders}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[#00df82]">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 shadow-md flex items-center justify-between hover:border-zinc-700 transition-all">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              إجمالي ما أنفقته
            </p>
            <p className="text-2xl font-bold mt-1 text-white font-mono">
              {formatAmount(stats.userTotalSpent)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-400">
            <TrendingUp className="size-5" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/home/new-order" className="block group">
          <div className="p-6 rounded-2xl border border-zinc-800/90 bg-zinc-950/90 hover:border-[#00df82]/50 hover:shadow-[0_0_25px_rgba(0,223,130,0.15)] transition-all duration-300 h-full flex flex-col justify-between shadow-md">
            <div>
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-[#00df82]/30 text-[#00df82] w-fit mb-4 group-hover:scale-110 transition-transform">
                <PlusCircle className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#00df82] transition-colors">
                طلب جديد
              </h3>
              <p className="text-sm text-gray-300 mt-1.5 leading-relaxed">
                زيادة التفاعل، متابعين، لايكات، ومشاهدات بأعلى جودة وسرعة تنفيذ.
              </p>
            </div>
            <Button className="mt-6 w-full bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold rounded-xl cursor-pointer shadow-md shadow-[#00df82]/20">
              إنشاء طلب الآن
            </Button>
          </div>
        </Link>

        <Link href="/home/services" className="block group">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-900 transition-all duration-200 h-full flex flex-col justify-between shadow-md">
            <div>
              <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white w-fit mb-4 group-hover:scale-105 transition-transform">
                <Layers className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">قائمة الخدمات</h3>
              <p className="text-sm text-gray-300 mt-1.5 leading-relaxed">
                استعرض باقاتنا الشاملة لكافة المنصات، الأسعار لكل ألف والحدود.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-6 w-full border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-xl cursor-pointer"
            >
              عرض الخدمات
            </Button>
          </div>
        </Link>

        <Link href="/home/add-funds" className="block group">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-900 transition-all duration-200 h-full flex flex-col justify-between shadow-md">
            <div>
              <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white w-fit mb-4 group-hover:scale-105 transition-transform">
                <Wallet className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">إضافة أموال</h3>
              <p className="text-sm text-gray-300 mt-1.5 leading-relaxed">
                اشحن رصيد حسابك فورياً عبر فودافون كاش بكل سهولة وأمان.
              </p>
            </div>
            <Button className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-semibold rounded-xl cursor-pointer">
              شحن الرصيد
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
