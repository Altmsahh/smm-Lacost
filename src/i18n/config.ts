export type Locale = "en" | "ar" | "tr";

export const locales: Locale[] = ["en", "ar", "tr"];
export const defaultLocale: Locale = "en";

export const rtlLocales: Locale[] = ["ar"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  tr: "Türkçe",
};
