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
  title: {
    default: "SMM Lacost | أفضل سيرفر خدمات سوشيال ميديا",
    template: "%s | SMM Lacost",
  },
  description:
    "سيرفر SMM Lacost لخدمات وسائل التواصل الاجتماعي (تيك توك، فيسبوك، انستغرام، يوتيوب، تليجرام). أرخص الأسعار وتنفيذ فوري 24/7.",
  keywords: [
    "SMM Lacost",
    "سيرفر لاكوست",
    "خدمات سوشيال ميديا",
    "social media marketing",
    "تزويد متابعين",
    "لايكات",
    "مشاهدات",
    "Instagram",
    "YouTube",
    "TikTok",
  ],
  icons: {
    icon: [
      { url: "/logo-new.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/logo-new.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logo-new.png",
  },
  openGraph: {
    title: "SMM Lacost | أفضل سيرفر خدمات سوشيال ميديا",
    description: "سيرفر SMM Lacost الأسرع والأفضل لخدمات وسائل التواصل الاجتماعي وتنفيذ فوري 24/7.",
    url: "https://smm-lacost.vercel.app",
    siteName: "SMM Lacost",
    images: [
      {
        url: "/logo-new.png",
        width: 512,
        height: 512,
        alt: "SMM Lacost Logo",
      },
    ],
    locale: "ar_EG",
    type: "website",
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
