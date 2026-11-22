"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const hasLocalToken =
      typeof window !== "undefined" && !!localStorage.getItem("auth_token");
    const hasCookieToken =
      typeof document !== "undefined" &&
      (document.cookie.includes("auth_token=") ||
        document.cookie.includes("token="));

    if (!hasLocalToken && !hasCookieToken) {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#020503] flex flex-col items-center justify-center gap-3">
        <div className="size-9 border-2 border-[#00df82] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#00df82] font-mono tracking-wider animate-pulse">
          جاري التحميل...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
