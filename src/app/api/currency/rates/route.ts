import { NextResponse } from "next/server";

// Cache in memory for 1 hour to prevent unnecessary requests
let cachedRate: number | null = null;
let lastFetched: number = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
  const now = Date.now();

  if (cachedRate && now - lastFetched < CACHE_DURATION_MS) {
    return NextResponse.json({
      success: true,
      base: "USD",
      target: "EGP",
      rate: cachedRate,
      cached: true,
      lastUpdated: new Date(lastFetched).toISOString(),
    });
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`External API responded with status ${res.status}`);
    }

    const data = await res.json();
    const liveRate = data?.rates?.EGP;

    if (typeof liveRate === "number" && liveRate > 0) {
      cachedRate = parseFloat(liveRate.toFixed(2));
      lastFetched = now;

      return NextResponse.json({
        success: true,
        base: "USD",
        target: "EGP",
        rate: cachedRate,
        cached: false,
        lastUpdated: new Date(lastFetched).toISOString(),
      });
    }

    throw new Error("Invalid rate format received from provider");
  } catch (error) {
    console.error("Exchange rate fetch error, falling back:", error);

    // If fetch fails, return cached rate if exists, or fallback 50.0 EGP
    const fallbackRate = cachedRate || 50.0;
    return NextResponse.json({
      success: true,
      base: "USD",
      target: "EGP",
      rate: fallbackRate,
      fallback: true,
      lastUpdated: new Date().toISOString(),
    });
  }
}

