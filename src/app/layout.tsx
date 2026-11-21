import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { QueryProvider, ThemeProvider, CurrencyProvider } from "@/providers";
import { rtlLocales, type Locale } from "@/i18n/config";
import { ToastContainer } from "react-toastify";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMM Lacost",
  description:
    "Premium social media marketing panel offering the fastest and most affordable SMM services for facebook, Instagram, YouTube, TikTok, Twitter, and more.",
  keywords: [
    "SMM Lacost",
    "social media marketing",
    "buy followers",
    "buy likes",
    "buy comments",
    "Instagram",
    "YouTube",
    "TikTok",
  ],
  icons: {
    icon: [
      { url: "/logo-new.png" },
      { url: "/favicon.ico" },
    ],
    apple: "/logo-new.png",
    shortcut: "/logo-new.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <CurrencyProvider>
              <ToastContainer />
              <QueryProvider>{children}</QueryProvider>
              <WhatsAppSupport />
            </CurrencyProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
