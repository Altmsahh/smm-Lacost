"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  ShoppingCart,
  RotateCcw,
  Wallet,
  Menu,
  X,
  ChevronRight,
  Server,
} from "lucide-react";

const navItems = [
  { label: "لوحة التحكم (Dashboard)", href: "/home", icon: LayoutDashboard },
  { label: "طلب جديد (New Order)", href: "/home/new-order", icon: PlusCircle },
  { label: "الخدمات (Services)", href: "/home/services", icon: Layers },
  { label: "طلباتي (My Orders)", href: "/home/orders", icon: ShoppingCart },
  { label: "تعويضات الطلبات (Refunds)", href: "/home/refunds", icon: RotateCcw },
  { label: "إضافة أموال (Add Funds)", href: "/home/add-funds", icon: Wallet },
  { label: "Api", href: "/home/api", icon: Server },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 text-zinc-100">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800/80 bg-zinc-950/80">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="relative size-11 rounded-[16px] p-0.5 border border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-lg shadow-black/50 ring-1 ring-[#00df82]/20 group-hover:border-[#00df82] group-hover:ring-[#00df82]/50 group-hover:shadow-[0_0_20px_rgba(0,223,130,0.35)] group-hover:scale-105 transition-all duration-300">
            <div className="relative w-full h-full rounded-[13px] overflow-hidden">
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
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-[#00df82] font-black drop-shadow-[0_0_12px_rgba(0,223,130,0.45)]">SMM</span>{" "}
              <span className="text-white">Lacost</span>
            </h1>
            <p className="text-[10px] text-[#00df82]/80 uppercase tracking-widest font-mono font-semibold">
              Luxury Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-emerald-950/50 text-[#00df82] border border-[#00df82]/40 shadow-[0_0_18px_rgba(0,223,130,0.2)] font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/80 hover:border-zinc-800 border border-transparent"
                }
              `}
            >
              <item.icon className={`size-[18px] transition-colors ${active ? "text-[#00df82]" : "text-gray-500 group-hover:text-gray-300"}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="size-4 text-[#00df82]" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-lg cursor-pointer hover:bg-zinc-800"
        aria-label="القائمة"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 right-0 z-40 h-screen w-64 bg-zinc-950
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
