"use client";

import Link from "next/link";
import Image from "next/image";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="relative size-10 rounded-[15px] p-0.5 border border-emerald-500/40 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-md ring-1 ring-[#00df82]/30 group-hover:border-[#00df82] group-hover:ring-[#00df82]/60 group-hover:shadow-[0_0_20px_rgba(0,223,130,0.35)] group-hover:scale-105 transition-all duration-300">
            <div className="relative w-full h-full rounded-[12px] overflow-hidden">
              <Image
                src="/logo-new.png"
                alt="SMM Lacost"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            <span className="text-[#00df82] font-black drop-shadow-[0_0_10px_rgba(0,223,130,0.45)]">SMM</span> Lacost
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5">
          {/* Currency and Language Switcher Side-by-Side in Navbar */}
          <div className="flex items-center gap-2">
            <CurrencySwitcher compact />
            <LanguageSwitcher />
          </div>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:inline" href="/">
            الرئيسية
          </Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:inline" href="/home/services">
            الخدمات
          </Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="/login">
            دخول
          </Link>
          <Link href="/register" className="text-sm font-extrabold px-4 py-1.5 rounded-xl bg-[#00df82] hover:bg-[#10e57a] text-black transition-all shadow-md shadow-[#00df82]/25">
            إنشاء حساب
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
