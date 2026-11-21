import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/me");
      if (!isAuthEndpoint && typeof window !== "undefined") {
        const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
        if (!isAuthPage) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
          document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
