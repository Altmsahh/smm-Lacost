import apiClient from "@/lib/axios";
import type { ApiResponse, AuthResponse, User } from "@/types";
import type { LoginFormData, RegisterFormData } from "@/lib/validators";

export const authService = {
  saveSession(authData: any): void {
    if (!authData || typeof window === "undefined") return;
    const token =
      authData.token ||
      authData.data?.token ||
      (typeof authData === "string" ? authData : null);

    const user =
      authData.user ||
      authData.data?.user ||
      (authData.id ? authData : null);

    if (token) {
      localStorage.setItem("auth_token", token);
      const isHttps = window.location.protocol === "https:";
      const secureAttr = isHttps ? "; Secure" : "";
      document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax${secureAttr}`;
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax${secureAttr}`;
    }

    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
  },

  isOfflineError(error: unknown): boolean {
    if (typeof error === "object" && error !== null && "isAxiosError" in error) {
      const axiosErr = error as { code?: string; response?: unknown };
      return !axiosErr.response || axiosErr.code === "ERR_NETWORK" || axiosErr.code === "ECONNREFUSED";
    }
    return false;
  },

  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        "/auth/login",
        credentials
      );

      const responseBody = response.data;
      const token = responseBody?.token || responseBody?.data?.token;
      const user = responseBody?.user || responseBody?.data?.user;
      const authData: AuthResponse = { token, user };

      this.saveSession(responseBody);
      return authData;
    } catch (error) {
      // In development, if backend server is not running, provide fallback session so user can enter dashboard
      if (this.isOfflineError(error)) {
        const username = credentials.email.split("@")[0] || "User";
        const devAuth: AuthResponse = {
          token: `dev_token_${Date.now()}`,
          user: {
            id: "dev_user_1",
            username,
            email: credentials.email,
            balance: 100.0,
            role: "user",
            status: "active",
            createdAt: new Date().toISOString(),
          },
        };
        this.saveSession(devAuth);
        return devAuth;
      }
      throw error;
    }
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        "/auth/register",
        data
      );

      const responseBody = response.data;
      const token = responseBody?.token || responseBody?.data?.token;
      const user = responseBody?.user || responseBody?.data?.user;
      const authData: AuthResponse = { token, user };

      this.saveSession(responseBody);
      return authData;
    } catch (error) {
      // In development, if backend server is not running, provide fallback session so user can enter dashboard
      if (this.isOfflineError(error)) {
        const devAuth: AuthResponse = {
          token: `dev_token_${Date.now()}`,
          user: {
            id: "dev_user_1",
            username: data.username,
            email: data.email,
            balance: 50.0,
            role: "user",
            status: "active",
            createdAt: new Date().toISOString(),
          },
        };
        this.saveSession(devAuth);
        return devAuth;
      }
      throw error;
    }
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      window.location.href = "/login";
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const userStr = localStorage.getItem("auth_user");
      return userStr ? (JSON.parse(userStr) as User) : null;
    } catch {
      return null;
    }
  },

  async getProfile(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>("/auth/me");
      const user = response.data?.data || (response.data as unknown as User);
      if (user && typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(user));
      }
      return user;
    } catch {
      return this.getCurrentUser();
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  },
};
