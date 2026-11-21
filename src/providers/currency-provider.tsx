"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Currency = "USD" | "EGP";

interface CurrencyContextValue {
  currency: Currency;
  usdToEgpRate: number;
  loading: boolean;
  symbol: string;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatAmount: (usdAmount: number, decimals?: number) => string;
  convertFromUsd: (usdAmount: number) => number;
  convertToUsd: (egpAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [usdToEgpRate, setUsdToEgpRate] = useState<number>(50.0);
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved currency from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferred_currency") as Currency | null;
      if (saved === "USD" || saved === "EGP") {
        setCurrencyState(saved);
      }
    } catch {
      // ignore
    }

    // Fetch live rate from our internal API
    fetch("/api/currency/rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.rate === "number") {
          setUsdToEgpRate(data.rate);
        }
      })
      .catch((err) => console.error("Failed to fetch live currency rate:", err))
      .finally(() => setLoading(false));
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("preferred_currency", c);
    } catch {
      // ignore
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrencyState((prev) => {
      const next = prev === "USD" ? "EGP" : "USD";
      try {
        localStorage.setItem("preferred_currency", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const convertFromUsd = useCallback(
    (usdAmount: number) => {
      return usdAmount * usdToEgpRate;
    },
    [usdToEgpRate]
  );

  const convertToUsd = useCallback(
    (egpAmount: number) => {
      return egpAmount / (usdToEgpRate || 1);
    },
    [usdToEgpRate]
  );

  const formatAmount = useCallback(
    (usdAmount: number, decimals: number = 2): string => {
      const amount = Number(usdAmount) || 0;
      if (currency === "USD") {
        return `$${amount.toFixed(decimals)}`;
      }
      const egpVal = amount * usdToEgpRate;
      return `${egpVal.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })} ج.م`;
    },
    [currency, usdToEgpRate]
  );

  const symbol = currency === "USD" ? "$" : "ج.م";

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        usdToEgpRate,
        loading,
        symbol,
        setCurrency,
        toggleCurrency,
        formatAmount,
        convertFromUsd,
        convertToUsd,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a <CurrencyProvider>");
  }
  return context;
}

