"use client";

import React, { useEffect, useState } from "react";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { authService } from "@/services";
import { useCurrency } from "@/providers";
import type { User } from "@/types";
import { Wallet, User as UserIcon, LogOut } from "lucide-react";

export default function TopNavbar() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("auth_user");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return null;
  });
  const { formatAmount } = useCurrency();
  const currentUser = user || (typeof window !== "undefined" ? authService.getCurrentUser() : null);
  const displayName = currentUser?.username || (currentUser?.email ? currentUser.email.split("@")[0] : "");

  useEffect(() => {
    const cached = authService.getCurrentUser();
    if (cached) setUser(cached);

    authService.getProfile().then((fresh) => {
      if (fresh) setUser(fresh);
    });
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Left: Quick Balance Badge / User info */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-[#00df82]/30 shadow-sm shadow-[#00df82]/10">
              <div className="size-6 rounded-lg bg-emerald-950/70 border border-[#00df82]/40 flex items-center justify-center text-[#00df82]">
                <Wallet className="size-3.5" />
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-[11px] text-gray-400 font-sans hidden sm:inline">الرصيد:</span>
                <span className="text-sm font-bold text-[#00df82] drop-shadow-[0_0_8px_rgba(0,223,130,0.3)]">
                  {formatAmount(user.balance)}
                </span>
              </div>
            </div>
          )}

          {displayName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <UserIcon className="size-3.5 text-[#00df82]" />
              <span className="hidden sm:inline">مرحباً،</span>
              <strong className="text-[#00df82] font-semibold">{displayName}</strong>
            </div>
          )}
        </div>

        {/* Right: Currency Switcher, Language Switcher & Logout Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* زر تحويل العملة */}
          <CurrencySwitcher compact />

          {/* فاصل جمالي بسيط */}
          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

          {/* زر تغيير اللغة */}
          <LanguageSwitcher />

          {/* فاصل جمالي */}
          <div className="h-5 w-px bg-zinc-800" />

          {/* زر تسجيل الخروج */}
          <button
            onClick={() => authService.logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 text-gray-300 hover:text-red-400 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm group"
            title="تسجيل الخروج من الحساب"
          >
            <LogOut className="size-3.5 text-gray-400 group-hover:text-red-400 transition-colors" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}

