"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Server,
  RefreshCw,
  Plus,
  Trash2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowDownToLine,
  Eye,
  Copy,
  Check,
  Code,
  Terminal,
  Key,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Provider {
  id: number;
  name: string;
  url: string;
  apiKey: string;
  username?: string | null;
  balance: number;
  currency: string;
  servicesCount?: number;
  createdAt: string;
}

interface PreviewService {
  id: number | string;
  name: string;
  category: string;
  originalRate: number;
  finalRate: number;
  min: number;
  max: number;
  description?: string;
}

export default function ApiAndProvidersPage() {
  const [activeTab, setActiveTab] = useState<"docs" | "providers" | "code">("docs");

  // User's own API Key state
  const [myApiKey, setMyApiKey] = useState<string>("");
  const [keyCopied, setKeyCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);

  // Providers states
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingBalanceId, setCheckingBalanceId] = useState<number | null>(null);

  // Form states for external provider
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [markupPercent, setMarkupPercent] = useState("30");
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync / Preview states
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [previewServices, setPreviewServices] = useState<PreviewService[]>([]);
  const [syncResultMsg, setSyncResultMsg] = useState<string | null>(null);

  // Code example language state
  const [codeLang, setCodeLang] = useState<"curl" | "php" | "python" | "node">("curl");

  // Fetch my API Key
  const fetchMyApiKey = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/auth/api-key", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success && data.apiKey) {
        setMyApiKey(data.apiKey);
      }
    } catch (e) {
      console.error("Could not fetch user API key", e);
    }
  };

  // Generate new API Key
  const handleRegenerateKey = async () => {
    if (!confirm("هل أنت متأكد من إنشاء مفتاح API جديد؟ سيتوقف المفتاح القديم فوراً.")) return;
    setGeneratingKey(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/auth/api-key", {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success && data.apiKey) {
        setMyApiKey(data.apiKey);
        alert("تم إنشاء مفتاح API جديد بنجاح!");
      }
    } catch {
      alert("فشل إنشاء مفتاح جديد");
    }
    setGeneratingKey(false);
  };

  // Fetch connected providers
  const fetchProviders = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/providers", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch providers", err);
    }
  };

  useEffect(() => {
    fetchMyApiKey();
    fetchProviders();
  }, []);

  const handleCopy = (text: string, type: "key" | "url") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } else {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url || !apiKey) {
      setFormMsg({ type: "error", text: "يرجى ملء جميع الحقول الإجبارية: الاسم، الرابط، والمفتاح" });
      return;
    }

    setLoading(true);
    setFormMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          url,
          apiKey,
          username: username || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormMsg({ type: "error", text: data.error || "فشل حفظ المزود" });
        setLoading(false);
        return;
      }

      setFormMsg({ type: "success", text: "تمت إضافة المزود بنجاح!" });
      setName("");
      setUrl("");
      setApiKey("");
      setUsername("");
      fetchProviders();
    } catch {
      setFormMsg({ type: "error", text: "حدث خطأ في الاتصال بالخادم" });
    }
    setLoading(false);
  };

  const handleCheckBalance = async (providerId: number) => {
    setCheckingBalanceId(providerId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/providers/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
      } else {
        alert(data.error || "فشل جلب الرصيد");
      }
    } catch {
      alert("خطأ في الاتصال بسيرفر المزود");
    }
    setCheckingBalanceId(null);
  };

  const handleDeleteProvider = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المزود؟")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      await fetch(`/api/providers?id=${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      fetchProviders();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreviewServices = async (providerId: number) => {
    setSyncingId(providerId);
    setSyncResultMsg(null);
    setPreviewServices([]);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/providers/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          providerId,
          markupPercent: Number(markupPercent) || 30,
          mode: "preview",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPreviewServices(data.data.preview || []);
        setSyncResultMsg(`تم جلب ${data.data.totalRemote} خدمة من المزود للمعاينة بنسبة مكسب +${data.data.markupPercent}%.`);
      } else {
        alert(data.error || "فشل جلب الخدمات للمعاينة");
      }
    } catch {
      alert("حدث خطأ أثناء الاتصال بسيرفر المزود");
    }
    setSyncingId(null);
  };

  const handleImportServices = async (providerId: number) => {
    if (!confirm(`هل أنت متأكد من استيراد وحفظ الخدمات إلى قاعدة البيانات بنسبة ربح +${markupPercent}%؟`)) {
      return;
    }

    setSyncingId(providerId);
    setSyncResultMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/providers/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          providerId,
          markupPercent: Number(markupPercent) || 30,
          mode: "import",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncResultMsg(data.message);
        setPreviewServices([]);
        fetchProviders();
      } else {
        alert(data.error || "فشل استيراد الخدمات");
      }
    } catch {
      alert("حدث خطأ أثناء استيراد وتحديث الخدمات");
    }
    setSyncingId(null);
  };

  const apiEndpointUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/v2`
    : "https://your-domain.com/api/v2";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Top Brand Banner with Lacost Luxury Styling */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-700/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Luxury Curved Logo */}
            <div className="relative size-16 sm:size-20 rounded-[20px] p-0.5 border border-emerald-500/40 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-xl shadow-black/60 ring-1 ring-[#00df82]/30 shrink-0">
              <div className="relative w-full h-full rounded-[17px] overflow-hidden">
                <Image
                  src="/logo-new.png"
                  alt="SMM Lacost Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  <span className="text-[#00df82] font-black drop-shadow-[0_0_10px_rgba(0,223,130,0.4)]">SMM</span> Lacost API
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/70 border border-[#00df82]/40 text-[#00df82]">
                  v2.0 Standard
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1.5 max-w-2xl leading-relaxed">
                واجهة برمجية متكاملة للربط المباشر مع سيرفرات الـ SMM، تدعم سحب وتحديث الخدمات بنسبة ربح 30%، وتنفيذ الطلبات والاستعلام آلياً بالكامل.
              </p>
            </div>
          </div>

          {/* Key Specs Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-300">
              <span className="text-gray-500">HTTP Method:</span> <strong className="text-white">POST</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-gray-300">
              <span className="text-gray-500">Response:</span> <strong className="text-white">JSON</strong>
            </div>
          </div>
        </div>

        {/* API Credentials Quick Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* API URL */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 uppercase font-semibold">رابط الـ API المباشر (API URL)</p>
              <p className="text-xs sm:text-sm font-mono text-white truncate" dir="ltr">
                {apiEndpointUrl}
              </p>
            </div>
            <button
              onClick={() => handleCopy(apiEndpointUrl, "url")}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="نسخ الرابط"
            >
              {urlCopied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
            </button>
          </div>

          {/* User API Key */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 uppercase font-semibold">مفتاح الـ API الخاص بك (Your API Key)</p>
              <p className="text-xs sm:text-sm font-mono text-white truncate" dir="ltr">
                {myApiKey || "جاري جلب المفتاح..."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleCopy(myApiKey, "key")}
                disabled={!myApiKey}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="نسخ المفتاح"
              >
                {keyCopied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
              </button>
              <button
                onClick={handleRegenerateKey}
                disabled={generatingKey}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="توليد مفتاح جديد"
              >
                <RefreshCw className={`size-4 ${generatingKey ? "animate-spin text-white" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer border ${
            activeTab === "docs"
              ? "bg-[#00df82] text-black border-[#00df82] shadow-lg shadow-[#00df82]/25 font-bold"
              : "bg-zinc-900/60 text-gray-400 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-[#00df82]/30"
          }`}
        >
          <BookOpen className="size-4" />
          <span>وثائق الـ API (Documentation)</span>
        </button>

        <button
          onClick={() => setActiveTab("providers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer border ${
            activeTab === "providers"
              ? "bg-[#00df82] text-black border-[#00df82] shadow-lg shadow-[#00df82]/25 font-bold"
              : "bg-zinc-900/60 text-gray-400 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-[#00df82]/30"
          }`}
        >
          <Server className="size-4" />
          <span>ربط وسحب الخدمات من سيرفرات أخرى ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer border ${
            activeTab === "code"
              ? "bg-[#00df82] text-black border-[#00df82] shadow-lg shadow-[#00df82]/25 font-bold"
              : "bg-zinc-900/60 text-gray-400 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-[#00df82]/30"
          }`}
        >
          <Code className="size-4" />
          <span>أمثلة برمجية (cURL, PHP, Python, JS)</span>
        </button>
      </div>

      {/* TAB 1: API DOCUMENTATION (Lacost SMM API) */}
      {activeTab === "docs" && (
        <div className="space-y-8">
          {/* General Parameters */}
          <div className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="size-5 text-gray-400" />
              المعاملات العامة (General Parameters)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-gray-400 text-right border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5 font-semibold">المعامل (Parameter)</th>
                    <th className="p-3.5 font-semibold">النوع (Type)</th>
                    <th className="p-3.5 font-semibold">الوصف (Description)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  <tr className="hover:bg-zinc-800/30">
                    <td className="p-3.5 font-mono text-white font-bold">key</td>
                    <td className="p-3.5 text-gray-400 font-mono text-xs">string</td>
                    <td className="p-3.5 text-gray-300">مفتاح الـ API الخاص بحسابك على SMM Lacost</td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30">
                    <td className="p-3.5 font-mono text-white font-bold">action</td>
                    <td className="p-3.5 text-gray-400 font-mono text-xs">string</td>
                    <td className="p-3.5 text-gray-300">اسم الأمر المطلوب تنفيذه: <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">services</code>, <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">add</code>, <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">status</code>, <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">balance</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action 1: Service List */}
          <div className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 font-mono text-xs font-bold text-white">POST</span>
                <h3 className="text-base font-bold text-white">قائمة الخدمات المتاحة (Service List)</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">action: services</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-gray-400 text-right border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5 font-semibold">المعامل</th>
                    <th className="p-3.5 font-semibold">إجباري / اختياري</th>
                    <th className="p-3.5 font-semibold">الوصف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">key</td>
                    <td className="p-3.5 text-gray-400 text-xs">اختياري</td>
                    <td className="p-3.5 text-gray-300">مفتاح الـ API الخاص بك</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">action</td>
                    <td className="p-3.5 text-white font-semibold text-xs">إجباري</td>
                    <td className="p-3.5 text-gray-300">يجب أن تكون القيمة: <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">services</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 font-semibold mt-2">نموذج الاستجابة (Example Response):</p>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`[
  {
    "service": 1,
    "name": "متابعين انستجرام [حقيقي - ضمان 30 يوم]",
    "type": "Default",
    "category": "Instagram",
    "rate": "0.9000",
    "min": "100",
    "max": "100000",
    "desc": "خدمة فورية ومضمونة بدون نقص",
    "dripfeed": false,
    "refill": true,
    "cancel": false
  }
]`}
            </pre>
          </div>

          {/* Action 2: Add Order */}
          <div className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 font-mono text-xs font-bold text-white">POST</span>
                <h3 className="text-base font-bold text-white">إرسال طلب جديد (Add Order)</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">action: add</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-gray-400 text-right border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5 font-semibold">المعامل</th>
                    <th className="p-3.5 font-semibold">الحالة</th>
                    <th className="p-3.5 font-semibold">الوصف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">key</td>
                    <td className="p-3.5 text-white font-semibold text-xs">إجباري</td>
                    <td className="p-3.5 text-gray-300">مفتاح الـ API الخاص بك</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">action</td>
                    <td className="p-3.5 text-white font-semibold text-xs">إجباري</td>
                    <td className="p-3.5 text-gray-300"><code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">add</code></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">service</td>
                    <td className="p-3.5 text-white font-semibold text-xs">إجباري</td>
                    <td className="p-3.5 text-gray-300">رقم معرف الخدمة (Service ID)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">link</td>
                    <td className="p-3.5 text-white font-semibold text-xs">إجباري</td>
                    <td className="p-3.5 text-gray-300">رابط الحساب أو المنشور المطلوب تزويده</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">quantity</td>
                    <td className="p-3.5 text-white font-semibold text-xs">إجباري</td>
                    <td className="p-3.5 text-gray-300">الكمية المطلوبة (بين الحد الأدنى والأقصى)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 font-semibold mt-2">نموذج الاستجابة الناجحة (Success):</p>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-green-400 overflow-x-auto" dir="ltr">
{`{
  "order": 14205
}`}
            </pre>
          </div>

          {/* Action 3: Order Status */}
          <div className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 font-mono text-xs font-bold text-white">POST</span>
                <h3 className="text-base font-bold text-white">الاستعلام عن حالة الطلب (Order Status)</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">action: status</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-gray-400 text-right border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5 font-semibold">المعامل</th>
                    <th className="p-3.5 font-semibold">الوصف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">order</td>
                    <td className="p-3.5 text-gray-300">رقم الطلب (Order ID) للاستعلام عن طلب مفرد</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono text-white font-bold">orders</td>
                    <td className="p-3.5 text-gray-300">أرقام عدة طلبات مفصولة بفواصل مثل: <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">101,102,103</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 font-semibold mt-2">نموذج الاستجابة لطلب واحد:</p>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`{
  "charge": "1.80",
  "start_count": "520",
  "status": "In progress",
  "remains": "480",
  "currency": "USD"
}`}
            </pre>
          </div>

          {/* Action 4: Balance */}
          <div className="bg-zinc-900/70 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 font-mono text-xs font-bold text-white">POST</span>
                <h3 className="text-base font-bold text-white">الاستعلام عن الرصيد (User Balance)</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">action: balance</span>
            </div>

            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`{
  "balance": "85.50",
  "currency": "USD"
}`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: CONNECT EXTERNAL PROVIDERS & SYNC (Lacost SMM) */}
      {activeTab === "providers" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="size-5 text-gray-400" />
                  ربط سيرفر خارجي جديد
                </h2>
                <span className="text-xs text-gray-400 font-mono">سيرفر خارجي (Lacost Provider)</span>
              </div>

              {formMsg && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 ${
                    formMsg.type === "success"
                      ? "bg-zinc-800 text-white border border-zinc-700"
                      : "bg-red-950/50 text-red-300 border border-red-800"
                  }`}
                >
                  {formMsg.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{formMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProvider} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    اسم المزود (Provider Name) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: Lacost Main Provider"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    رابط الـ API للسيرفر (API URL) *
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://lacost-smm.com/api/v2"
                    dir="ltr"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    عادة يكون الرابط بصيغة: <code className="text-gray-300">https://domain.com/api/v2</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    مفتاح الـ API على السيرفر الخارجي (API Key) *
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="انسخ المفتاح من لوحة السيرفر الآخر"
                    dir="ltr"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    اسم المستخدم (Username) - اختياري
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="اتركه فارغاً إذا كان السيرفر لا يطلبه"
                    dir="ltr"
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                {/* Profit Margin Setting */}
                <div className="pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-gray-400" />
                      نسبة المكسب عند سحب الخدمات (%):
                    </label>
                    <span className="text-xs font-mono font-extrabold text-[#00df82] bg-emerald-950/60 border border-[#00df82]/40 px-2 py-0.5 rounded">
                      +{markupPercent}%
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#00df82]"
                    placeholder="30"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    مثال: إذا كان سعر الخدمة $1.00 ستُعرض لعملائك بـ <strong className="text-[#00df82]">${(1 * (1 + (Number(markupPercent) || 30) / 100)).toFixed(2)}</strong> (+{markupPercent}% ربح لك).
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold h-11 rounded-xl transition-all shadow-lg shadow-[#00df82]/25 cursor-pointer mt-2"
                >
                  {loading ? "جاري الحفظ..." : "حفظ وربط المزود"}
                </Button>
              </form>
            </div>

            {/* Providers List Column */}
            <div className="lg:col-span-7 bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="size-5 text-gray-400" />
                    السيرفرات والمزودين المتصلين ({providers.length})
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    يمكنك فحص الرصيد وسحب كافة الخدمات بنسبة الربح (+{markupPercent}%) بضغطة زر
                  </p>
                </div>
              </div>

              {providers.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  لم يتم ربط أي سيرفر مزود حتى الآن. أضف سيرفرك الأول من النموذج.
                </div>
              ) : (
                <div className="space-y-4">
                  {providers.map((p) => {
                    const isChecking = checkingBalanceId === p.id;
                    const isSyncing = syncingId === p.id;

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-base">{p.name}</h3>
                              {p.username && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-300 font-mono">
                                  @{p.username}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-1 truncate max-w-sm" dir="ltr">
                              {p.url}
                            </p>
                          </div>

                          {/* Balance display */}
                          <div className="flex items-center gap-2">
                            <div className="text-left px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                              <p className="text-[10px] text-gray-400 uppercase">رصيد حسابك</p>
                              <p className="text-sm font-bold font-mono text-white">
                                {p.balance?.toFixed(2) ?? "0.00"} {p.currency}
                              </p>
                            </div>

                            <button
                              onClick={() => handleCheckBalance(p.id)}
                              disabled={isChecking}
                              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                              title="تحديث الرصيد الآن"
                            >
                              <RefreshCw className={`size-4 ${isChecking ? "animate-spin text-white" : ""}`} />
                            </button>

                            <button
                              onClick={() => handleDeleteProvider(p.id)}
                              className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="حذف المزود"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>

                        {/* Sync actions */}
                        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2.5">
                          <Button
                            onClick={() => handlePreviewServices(p.id)}
                            disabled={isSyncing}
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl gap-1.5 cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            <span>معاينة الخدمات</span>
                          </Button>

                          <Button
                            onClick={() => handleImportServices(p.id)}
                            disabled={isSyncing}
                            size="sm"
                            className="bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold rounded-xl gap-1.5 cursor-pointer shadow-md shadow-[#00df82]/20"
                          >
                            <ArrowDownToLine className="size-3.5" />
                            <span>{isSyncing ? "جاري السحب والتحديث..." : `سحب الخدمات (+${markupPercent}%)`}</span>
                          </Button>

                          <span className="text-xs text-gray-500 mr-auto font-mono">
                            الخدمات المسجلة: <strong className="text-white">{p.servicesCount ?? 0}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sync Result Notification */}
          {syncResultMsg && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-sm font-medium flex items-center gap-3 shadow-lg">
              <CheckCircle2 className="size-5 text-white shrink-0" />
              <span>{syncResultMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {previewServices.length > 0 && (
            <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-white">معاينة الخدمات المسحوبة (أول {previewServices.length} خدمة)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    توضح الأسعار الأصلية وسعر البيع على موقعك بعد إضافة نسبة الربح (+{markupPercent}%)
                  </p>
                </div>
                {providers.length > 0 && (
                  <Button
                    onClick={() => handleImportServices(providers[0].id)}
                    className="bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold rounded-xl cursor-pointer px-5 shadow-lg shadow-[#00df82]/25"
                  >
                    تأكيد واستيراد الكل إلى قاعدة البيانات
                  </Button>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-950 text-gray-400 border-b border-zinc-800">
                      <tr>
                        <th className="text-right px-4 py-3 font-medium">ID</th>
                        <th className="text-right px-4 py-3 font-medium">القسم (Category)</th>
                        <th className="text-right px-4 py-3 font-medium">اسم الخدمة</th>
                        <th className="text-center px-4 py-3 font-medium">سعر السيرفر</th>
                        <th className="text-center px-4 py-3 font-medium">سعر البيع لديك</th>
                        <th className="text-center px-4 py-3 font-medium">الحدود (Min/Max)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewServices.map((s, i) => (
                        <tr
                          key={s.id}
                          className={`border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors ${
                            i % 2 === 0 ? "bg-zinc-900/40" : "bg-transparent"
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">#{s.id}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-300">{s.category}</td>
                          <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{s.name}</td>
                          <td className="px-4 py-3 text-center font-mono text-gray-400">${s.originalRate.toFixed(4)}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-white">${s.finalRate.toFixed(4)}</td>
                          <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">
                            {s.min.toLocaleString()} - {s.max.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CODE EXAMPLES (cURL, PHP, Python, Node.js) */}
      {activeTab === "code" && (
        <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="size-5 text-gray-400" />
                أمثلة كود جاهزة للربط (Code Snippets)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                يمكنك نسخ الأكواد مباشرة واستخدامها في موقعك أو سكربتك الخاص
              </p>
            </div>

            <div className="flex gap-2">
              {(["curl", "php", "python", "node"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLang(lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                    codeLang === lang
                      ? "bg-white text-black border-white"
                      : "bg-zinc-950 text-gray-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  {lang === "node" ? "Node.js" : lang}
                </button>
              ))}
            </div>
          </div>

          {/* cURL Example */}
          {codeLang === "curl" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 font-semibold">1. الاستعلام عن الرصيد (cURL):</p>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`curl -X POST "${apiEndpointUrl}" \\
  -d "key=${myApiKey || "YOUR_API_KEY"}" \\
  -d "action=balance"`}
              </pre>

              <p className="text-xs text-gray-300 font-semibold mt-4">2. إنشاء طلب جديد (cURL):</p>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`curl -X POST "${apiEndpointUrl}" \\
  -d "key=${myApiKey || "YOUR_API_KEY"}" \\
  -d "action=add" \\
  -d "service=1" \\
  -d "link=https://instagram.com/username" \\
  -d "quantity=1000"`}
              </pre>
            </div>
          )}

          {/* PHP Example */}
          {codeLang === "php" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 font-semibold">إنشاء طلب جديد بلغة PHP:</p>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "${apiEndpointUrl}");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'key'      => '${myApiKey || "YOUR_API_KEY"}',
    'action'   => 'add',
    'service'  => 1,
    'link'     => 'https://instagram.com/username',
    'quantity' => 1000
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);
?>`}
              </pre>
            </div>
          )}

          {/* Python Example */}
          {codeLang === "python" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 font-semibold">تنفيذ الطلبات بواسطة Python (requests):</p>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`import requests

url = "${apiEndpointUrl}"
payload = {
    "key": "${myApiKey || "YOUR_API_KEY"}",
    "action": "add",
    "service": 1,
    "link": "https://instagram.com/username",
    "quantity": 1000
}

response = requests.post(url, data=payload)
data = response.json()
print("Order ID:", data.get("order"))`}
              </pre>
            </div>
          )}

          {/* Node.js Example */}
          {codeLang === "node" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 font-semibold">استخدام Node.js / JavaScript Fetch:</p>
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-gray-300 overflow-x-auto" dir="ltr">
{`const params = new URLSearchParams({
  key: "${myApiKey || "YOUR_API_KEY"}",
  action: "add",
  service: "1",
  link: "https://instagram.com/username",
  quantity: "1000"
});

const res = await fetch("${apiEndpointUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params.toString()
});

const data = await res.json();
console.log(data);`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
