"use client";

import React, { useState, useEffect } from "react";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<string>("ar");

  useEffect(() => {
    // Read NEXT_LOCALE from cookies or document.documentElement.lang
    const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
    const cookieLocale = match ? match[1] : null;
    const docLang = document.documentElement.lang;
    setCurrentLocale(cookieLocale || docLang || "ar");
  }, []);

  const handleSwitch = async (newLocale: "ar" | "en") => {
    if (newLocale === currentLocale) return;

    // Set cookie immediately on client
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });
    } catch {
      // ignore
    }

    // Refresh page to load messages and update dir (rtl/ltr)
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
      <button
        type="button"
        onClick={() => handleSwitch("ar")}
        className={`
          px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1
          ${
            currentLocale === "ar"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-white"
          }
        `}
        title="اللغة العربية"
      >
        <span>عربي</span>
      </button>

      <button
        type="button"
        onClick={() => handleSwitch("en")}
        className={`
          px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1
          ${
            currentLocale === "en"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-white"
          }
        `}
        title="English Language"
      >
        <span>EN</span>
      </button>
    </div>
  );
}

