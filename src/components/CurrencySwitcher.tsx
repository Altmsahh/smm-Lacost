"use client";

import React from "react";
import { useCurrency } from "@/providers";
import { ArrowLeftRight } from "lucide-react";

interface CurrencySwitcherProps {
  compact?: boolean;
  showRate?: boolean;
}

export default function CurrencySwitcher({ compact = false, showRate = true }: CurrencySwitcherProps) {
  const { currency, setCurrency, usdToEgpRate, loading } = useCurrency();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <button
          type="button"
          onClick={() => setCurrency("USD")}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer
            ${
              currency === "USD"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }
          `}
          title="الدولار الأمريكي"
        >
          USD $
        </button>
        <button
          type="button"
          onClick={() => setCurrency("EGP")}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer
            ${
              currency === "EGP"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }
          `}
          title="الجنيه المصري"
        >
          EGP ج.م
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
          <ArrowLeftRight className="size-3 text-gray-500" />
          العملة (Currency)
        </span>
        {showRate && (
          <span className="text-[10px] font-mono text-gray-400" title="سعر الصرف العالمي المباشر">
            {loading ? "جاري التحديث..." : `$1 = ${usdToEgpRate.toFixed(2)} ج.م`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
        <button
          type="button"
          onClick={() => setCurrency("USD")}
          className={`
            py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5
            ${
              currency === "USD"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }
          `}
        >
          <span>USD</span>
          <span className="text-[10px] font-mono opacity-80">($)</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrency("EGP")}
          className={`
            py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5
            ${
              currency === "EGP"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }
          `}
        >
          <span>EGP</span>
          <span className="text-[10px] opacity-80 font-mono">(ج.م)</span>
        </button>
      </div>
    </div>
  );
}

