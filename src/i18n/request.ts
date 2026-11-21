import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "./config";
import { cookies } from "next/headers";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: Locale = "ar";

  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale;
    if (cookieLocale && locales.includes(cookieLocale)) {
      locale = cookieLocale;
    } else {
      const reqLocale = (await requestLocale) as Locale;
      if (reqLocale && locales.includes(reqLocale)) {
        locale = reqLocale;
      } else {
        locale = defaultLocale || "ar";
      }
    }
  } catch {
    locale = "ar";
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
