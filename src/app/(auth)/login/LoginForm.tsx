"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { authService } from "@/services";

const LoginForm = () => {
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("nav");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      window.location.href = "/home";
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authService.login(data);
      if (res?.token) {
        localStorage.setItem("auth_token", res.token);
      }
      toast.success(tAuth("loginSuccess") || "تم تسجيل الدخول بنجاح");
      setTimeout(() => {
        window.location.href = "/home";
      }, 300);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          (error.response?.status === 401
            ? tAuth("invalidCredentials")
            : "Failed to connect to authentication server");
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
      <div className="text-start">
        <h3 className="text-xl font-bold text-white">{tAuth("loginTitle")}</h3>
        <p className="text-sm text-gray-400 mt-0.5">{tAuth("loginSubtitle")}</p>
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-gray-300 text-start">
          {tAuth("email")}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-gray-500">
            <Mail className="size-4" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={isSubmitting}
            {...register("email")}
            className={`w-full rounded-xl border bg-zinc-900 py-2.5 ps-10 pe-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:ring-2 focus:ring-gray-500/50 ${
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-zinc-800 hover:border-zinc-700 focus:border-zinc-500"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400 text-start">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-gray-300 text-start">
            {tAuth("password")}
          </label>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-gray-500">
            <Lock className="size-4" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isSubmitting}
            {...register("password")}
            className={`w-full rounded-xl border bg-zinc-900 py-2.5 ps-10 pe-10 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:ring-2 focus:ring-gray-500/50 ${
              errors.password
                ? "border-red-500 focus:border-red-500"
                : "border-zinc-800 hover:border-zinc-700 focus:border-zinc-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-white"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400 text-start">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-2 flex flex-col gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full cursor-pointer bg-white font-bold text-black hover:bg-gray-200 disabled:opacity-50 rounded-xl shadow-lg shadow-white/5 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 size-4 animate-spin" />
              {tAuth("signingIn")}
            </>
          ) : (
            tNav("login")
          )}
        </Button>

        <p className="text-center text-sm text-gray-400">
          {tAuth("noAccount")}{" "}
          <Link href="/register" className="font-semibold text-white hover:underline">
            {tNav("register")}
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
