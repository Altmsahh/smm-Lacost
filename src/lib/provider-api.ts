import axios from "axios";

export interface RemoteService {
  service: number | string;
  name: string;
  category: string;
  rate: number | string;
  min: number | string;
  max: number | string;
  type?: string;
  desc?: string;
  description?: string;
  dripfeed?: boolean;
  refill?: boolean;
  cancel?: boolean;
}

export interface RemoteBalanceResponse {
  balance?: string | number;
  currency?: string;
  error?: string;
}

export class SMMProviderClient {
  private url: string;
  private apiKey: string;
  private username?: string;

  constructor(url: string, apiKey: string, username?: string) {
    this.url = url.trim();
    this.apiKey = apiKey.trim();
    this.username = username?.trim();
  }

  private buildParams(action: string, extra: Record<string, string | number> = {}) {
    const params: Record<string, string | number> = {
      key: this.apiKey,
      action,
      ...extra,
    };
    if (this.username) {
      params.username = this.username;
    }
    return params;
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    const params = this.buildParams("balance");
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => formData.append(k, String(v)));

    const response = await axios.post<RemoteBalanceResponse>(this.url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lacost-SMM-Panel/1.0",
      },
      timeout: 15000,
    });

    const data = response.data;
    if (typeof data === "object" && data !== null) {
      if (data.error) {
        throw new Error(data.error);
      }
      const rawBalance = parseFloat(String(data.balance ?? "0"));
      return {
        balance: isNaN(rawBalance) ? 0 : rawBalance,
        currency: data.currency || "USD",
      };
    }

    throw new Error("Invalid response format from provider");
  }

  async getServices(): Promise<RemoteService[]> {
    const params = this.buildParams("services");
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => formData.append(k, String(v)));

    let rawData: unknown = null;

    // 1. Try POST with form-urlencoded (Standard for 95% of SMM panels)
    try {
      const response = await axios.post(this.url, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lacost-SMM-Panel/1.0",
        },
        timeout: 30000,
      });
      rawData = response.data;
    } catch (formError) {
      // 2. Fallback: Try POST with JSON
      try {
        const responseJson = await axios.post(this.url, params, {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lacost-SMM-Panel/1.0",
          },
          timeout: 30000,
        });
        rawData = responseJson.data;
      } catch (jsonError) {
        // 3. Fallback: Try GET with query params
        try {
          const responseGet = await axios.get(this.url, {
            params,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lacost-SMM-Panel/1.0",
            },
            timeout: 30000,
          });
          rawData = responseGet.data;
        } catch {
          throw formError;
        }
      }
    }

    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch {
        throw new Error("Provider returned non-JSON response");
      }
    }

    if (Array.isArray(rawData)) {
      return rawData.map((item: Record<string, unknown>) => ({
        service: (item.service || item.id || item.service_id) as number | string,
        name: (item.name || item.service_name || "Service") as string,
        category: (item.category || item.category_name || "General") as string,
        rate: (item.rate || item.price || 0) as number | string,
        min: (item.min || item.min_order || 1) as number | string,
        max: (item.max || item.max_order || 100000) as number | string,
        type: (item.type || "default") as string,
        desc: (item.desc || item.description || item.details || "") as string,
        dripfeed: Boolean(item.dripfeed),
        refill: Boolean(item.refill),
        cancel: Boolean(item.cancel),
      }));
    }

    if (rawData && typeof rawData === "object" && (rawData as { error?: string }).error) {
      throw new Error((rawData as { error: string }).error);
    }

    throw new Error("Invalid services data returned from provider");
  }

  async createOrder(data: {
    service: number | string;
    link: string;
    quantity: number;
    runs?: number;
    interval?: number;
  }): Promise<{ order: number }> {
    const params = this.buildParams("add", {
      service: data.service,
      link: data.link,
      quantity: data.quantity,
      ...(data.runs ? { runs: data.runs } : {}),
      ...(data.interval ? { interval: data.interval } : {}),
    });

    const formData = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => formData.append(k, String(v)));

    const response = await axios.post(this.url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lacost-SMM-Panel/1.0",
      },
      timeout: 30000,
    });

    const resData = response.data;
    if (resData && typeof resData === "object") {
      if (resData.error) {
        throw new Error(resData.error);
      }
      if (resData.order) {
        return { order: Number(resData.order) };
      }
    }
    throw new Error("Invalid order response from provider");
  }

  async getOrderStatus(orderId: number | string): Promise<{
    charge?: string;
    start_count?: string;
    status?: string;
    remains?: string;
    currency?: string;
  }> {
    const params = this.buildParams("status", { order: orderId });
    const formData = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => formData.append(k, String(v)));

    const response = await axios.post(this.url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lacost-SMM-Panel/1.0",
      },
      timeout: 15000,
    });

    return response.data;
  }
}
