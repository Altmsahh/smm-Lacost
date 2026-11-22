import { z } from "zod";

// ── Common field schemas ──
export const emailSchema = z
  .string()
  .min(1, "البريد الإلكتروني مطلوب")
  .email("يرجى إدخال بريد إلكتروني صحيح");

export const passwordSchema = z
  .string()
  .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل");

export const usernameSchema = z
  .string()
  .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
  .max(30, "اسم المستخدم يجب أن لا يتجاوز 30 حرفاً")
  .regex(/^[a-zA-Z0-9_]+$/, "اسم المستخدم يجب أن يحتوي فقط على أحرف وأرقام إنجليزية");

// ── Auth schemas ──
export const loginSchema = z.object({
  email: z.string().min(1, "يرجى إدخال اسم المستخدم أو البريد الإلكتروني"),
  password: z.string().min(1, "يرجى إدخال كلمة المرور"),
});

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

// ── Type exports ──
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
