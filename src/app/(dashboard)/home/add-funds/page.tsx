"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Phone,
  CheckCircle2,
  Copy,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Zap,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services";
import { useCurrency } from "@/providers";
import type { User } from "@/types";

// رقم فودافون كاش الخاص بالسيرفر
const VODAFONE_CASH_NUMBER = "01069339675";

const quickAmounts = [50, 100, 200, 500, 1000, 2000];

interface TransactionItem {
  id: number;
  amount: number;
  description: string;
  createdAt: string;
}

export default function AddFundsPage() {
  const { formatAmount, convertToUsd, usdToEgpRate } = useCurrency();
  const [user, setUser] = useState<User | null>(null);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState("vodafone");
  const [amount, setAmount] = useState<string>("100");
  const [phone, setPhone] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Copy states
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Transaction history
  const [history, setHistory] = useState<TransactionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/payments/vodafone-cash", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setHistory(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch deposit history", e);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    const cached = authService.getCurrentUser();
    if (cached) setUser(cached);

    authService.getProfile().then((fresh) => {
      if (fresh) setUser(fresh);
    });

    fetchHistory();
  }, []);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(VODAFONE_CASH_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const transferCode = `*9*7*${VODAFONE_CASH_NUMBER}*${amount || "المبلغ"}#`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(transferCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const numAmount = Number(amount) || 0;
  const estimatedUsd = convertToUsd(numAmount);
  // البونص: 5% إضافي إذا كان المبلغ 500 ج.م أو أكثر
  const hasBonus = numAmount >= 500;
  const bonusAmountUsd = hasBonus ? estimatedUsd * 0.05 : 0;
  const totalUsdWithBonus = estimatedUsd + bonusAmountUsd;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || numAmount < 10) {
      setError("الحد الأدنى للشحن هو 10 جنيه مصري");
      return;
    }
    if (!phone || !transactionRef) {
      setError("يرجى إدخال رقم الهاتف المحول منه ورقم العملية (المرجع)");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/payments/vodafone-cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: numAmount,
          phone: phone.trim(),
          transactionRef: transactionRef.trim(),
          amountInUsd: totalUsdWithBonus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "فشل تسجيل الإيداع، يرجى مراجعة البيانات");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(
        `تم تسجيل عملية الإيداع بنجاح! تم إضافة $${totalUsdWithBonus.toFixed(2)} USD إلى رصيدك.`
      );
      setPhone("");
      setTransactionRef("");
      if (user) {
        const updated = { ...user, balance: data.newBalance ?? user.balance + totalUsdWithBonus };
        setUser(updated);
        localStorage.setItem("auth_user", JSON.stringify(updated));
      }
      fetchHistory();
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Top Header Banner matching Dragon SMM with Lacost Neon Styling */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00df82]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-emerald-950/70 border border-[#00df82]/40 flex items-center justify-center text-[#00df82] shadow-[0_0_15px_rgba(0,223,130,0.25)]">
                <Wallet className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  إضافة أموال (Add Funds)
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  شحن رصيد حسابك بأمان وسرعة فائقة بأفضل وسائل الدفع المتاحة
                </p>
              </div>
            </div>
          </div>

          {/* Current Balance Display Card */}
          <div className="flex items-center gap-3 self-start md:self-auto px-5 py-3 rounded-2xl bg-zinc-950/90 border border-[#00df82]/30 shadow-lg shadow-[#00df82]/10">
            <span className="text-xs text-gray-400 font-semibold uppercase">رصيدك الحالي:</span>
            <span className="text-2xl font-extrabold text-[#00df82] font-mono drop-shadow-[0_0_10px_rgba(0,223,130,0.4)]">
              {formatAmount(user?.balance ?? 0)}
            </span>
          </div>
        </div>

        {/* Bonus Notification Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#00df82] font-bold">
            <Sparkles className="size-4 animate-pulse" />
            <span>⚡ عرض خاص: بونص تلقائي 5% إضافي عند شحن 500 جنيه مصري أو أكثر!</span>
          </div>
          <span className="text-gray-400 font-mono">سعر الصرف: 1 USD ≈ {usdToEgpRate.toFixed(2)} EGP</span>
        </div>
      </div>

      {/* Main 2-Column Split: Payment Form & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Desktop): Instructions & Account Info */}
        <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
          {/* Main Account Number Card */}
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-emerald-500/30 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00df82]">
                رقم المحفظة المعتمد للتحويل
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-[#00df82] border border-[#00df82]/40 font-semibold">
                فودافون كاش
              </span>
            </div>

            {/* Big Phone Number Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 flex items-center justify-between gap-3 group hover:border-[#00df82] transition-colors">
              <div className="min-w-0">
                <span className="text-[11px] text-gray-400 block font-semibold mb-1">
                  رقم فودافون كاش (Vodafone Cash):
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] block truncate" dir="ltr">
                  {VODAFONE_CASH_NUMBER}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-[#00df82] text-gray-200 hover:text-black border border-zinc-700 hover:border-[#00df82] transition-all cursor-pointer shrink-0 shadow-md"
                title="نسخ الرقم"
              >
                {copiedNumber ? (
                  <CheckCircle2 className="size-5 text-black" />
                ) : (
                  <Copy className="size-5" />
                )}
              </button>
            </div>

            {/* Quick Dial Code Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="text-gray-400 block font-semibold text-[11px]">كود التحويل السريع:</span>
                <span className="font-mono text-white text-xs block truncate" dir="ltr">
                  {transferCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white border border-zinc-700 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                {copiedCode ? "تم النسخ!" : "نسخ الكود"}
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase text-gray-300 tracking-wider">
                خطوات التحويل والشحن (4 خطوات بسيطة):
              </h3>
              <ol className="space-y-2.5 text-xs text-gray-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-emerald-950/70 border border-[#00df82]/40 text-[#00df82] font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    قم بتحويل المبلغ المطلوب إلى رقم فودافون كاش:{" "}
                    <strong className="text-white font-mono">{VODAFONE_CASH_NUMBER}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-emerald-950/70 border border-[#00df82]/40 text-[#00df82] font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    يقبل التحويل من كافة المحافظ الإلكترونية في مصر (فودافون كاش، أورنج كاش، اتصالات كاش، وي باي، والمحافظ البنكية).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-emerald-950/70 border border-[#00df82]/40 text-[#00df82] font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    احفظ <strong className="text-white">رقم العملية (المرجع)</strong> من رسالة التأكيد النصية SMS بعد التحويل.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-emerald-950/70 border border-[#00df82]/40 text-[#00df82] font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <span>
                    أدخل رقم هاتفك ورقم العملية في النموذج واضغط على <strong className="text-white">&quot;تأكيد الدفع&quot;</strong> ليتم إيداع الرصيد في حسابك فوراً.
                  </span>
                </li>
              </ol>
            </div>

            {/* Direct WhatsApp Contact Card */}
            <div className="pt-3 border-t border-zinc-800">
              <a
                href={`https://wa.me/201069339675?text=${encodeURIComponent(
                  "مرحباً، لدي استفسار بخصوص شحن الرصيد في سيرفر SMM Lacost"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-[#00df82]/30 hover:border-[#00df82] transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                    <MessageCircle className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#00df82] transition-colors block">
                      هل تحتاج مساعدة في الشحن؟
                    </span>
                    <span className="text-[11px] text-gray-400 block font-mono">
                      تواصل مع الدعم الفني عبر واتساب (01069339675)
                    </span>
                  </div>
                </div>
                <ExternalLink className="size-4 text-gray-400 group-hover:text-[#00df82] transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form (Just like dragon-smm.com/addfunds) */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl space-y-6"
          >
            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="block text-sm font-bold text-white">
                طريقة الدفع (Payment Method):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vodafone")}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === "vodafone"
                      ? "bg-emerald-950/60 text-[#00df82] border-[#00df82] shadow-[0_0_15px_rgba(0,223,130,0.2)] ring-1 ring-[#00df82]"
                      : "bg-zinc-950/80 border-zinc-800 text-gray-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="size-9 rounded-xl bg-red-600/90 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">
                    VF
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      فودافون كاش والمحافظ
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      Vodafone / Orange / Etisalat / WE
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("instapay")}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === "instapay"
                      ? "bg-emerald-950/60 text-[#00df82] border-[#00df82] shadow-[0_0_15px_rgba(0,223,130,0.2)] ring-1 ring-[#00df82]"
                      : "bg-zinc-950/80 border-zinc-800 text-gray-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="size-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">
                    IP
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      إنستاباي (InstaPay Egypt)
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      تحويل بنكي لحظي فوري
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">
                مبالغ شحن سريعة (بالجنيه المصري EGP):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map((amt) => {
                  const isSelected = amount === String(amt);
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(String(amt))}
                      className={`py-2 px-3 rounded-xl text-center font-mono font-bold text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#00df82] text-black border-[#00df82] shadow-md shadow-[#00df82]/25"
                          : "bg-zinc-950 border-zinc-800 text-gray-300 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      {amt} ج.م
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                المبلغ المراد شحنه (جنيه مصري) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثال: 500"
                  min="10"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00df82]"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 font-bold">
                  EGP
                </span>
              </div>
            </div>

            {/* Live Currency Calculation & Bonus Card */}
            {numAmount >= 10 && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">القيمة الأساسية بالدولار:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    ${estimatedUsd.toFixed(2)} USD
                  </span>
                </div>

                {hasBonus && (
                  <div className="flex items-center justify-between text-xs text-[#00df82] font-semibold pt-1 border-t border-zinc-800">
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3.5" />
                      بونص إضافي 5%:
                    </span>
                    <span className="font-mono font-bold">+${bonusAmountUsd.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-bold pt-1.5 border-t border-zinc-800">
                  <span className="text-gray-300">الرصيد الإجمالي الذي سيُضاف:</span>
                  <span className="font-mono font-black text-base text-[#00df82] drop-shadow-[0_0_8px_rgba(0,223,130,0.3)]">
                    ${totalUsdWithBonus.toFixed(2)} USD
                  </span>
                </div>
              </div>
            )}

            {/* Sender Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                رقم المحفظة التي قمت بالتحويل منها *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                dir="ltr"
                required
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00df82]"
              />
            </div>

            {/* Transaction Reference ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                رقم العملية المرجعي (Ref / كود الإشعار من الرسالة) *
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="أدخل كود المرجع أو رقم العملية"
                dir="ltr"
                required
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00df82]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                تجد رقم العملية في رسالة التأكيد النصية المستلمة من شبكة فودافون بعد التحويل.
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-[#00df82]/40 text-[#00df82] text-xs font-semibold flex items-center gap-2.5 shadow-md">
                <CheckCircle2 className="size-5 shrink-0 text-[#00df82]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || !amount || numAmount < 10}
              className="w-full h-12 bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold text-base rounded-2xl cursor-pointer disabled:opacity-40 transition-all shadow-lg shadow-[#00df82]/30"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  جاري تأكيد الإيداع...
                </span>
              ) : (
                "تأكيد الدفع وشحن الرصيد"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Transaction History Section (Like Dragon SMM) */}
      <div className="bg-zinc-900/80 p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="size-5 text-gray-400" />
              سجل عمليات الإيداع السابقة (Deposit History)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              متابعة جميع عمليات الشحن التي قمت بها على المنصة
            </p>
          </div>
        </div>

        {loadingHistory ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            جاري تحميل سجل العمليات...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            لا توجد عمليات إيداع مسجلة بعد.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-gray-400 border-b border-zinc-800 text-right">
                  <tr>
                    <th className="px-4 py-3 font-semibold">المعرف</th>
                    <th className="px-4 py-3 font-semibold">طريقة الدفع</th>
                    <th className="px-4 py-3 font-semibold">المبلغ المضاف</th>
                    <th className="px-4 py-3 font-semibold">تفاصيل العملية</th>
                    <th className="px-4 py-3 font-semibold text-center">الحالة</th>
                    <th className="px-4 py-3 font-semibold text-center">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{tx.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-200">فودافون كاش</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#00df82]">
                        +${tx.amount.toFixed(2)} USD
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300 max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-[#00df82] border border-[#00df82]/30">
                          مكتمل
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
