"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/Header/Header";

const features = [
  { icon: Zap, key: "fast" },
  { icon: ShieldCheck, key: "secure" },
  { icon: Globe, key: "global" },
] as const;

const featureDetails: Record<string, { title: string; description: string }> = {
  fast: {
    title: "سرعة فائقة",
    description: "تبدأ الطلبات بالمعالجة والتنفيذ فور تأكيدها خلال ثوانٍ معدودة.",
  },
  secure: {
    title: "أمان بنسبة 100%",
    description: "بياناتك ومعاملاتك المالية محمية ومشفرة بأعلى معايير الأمان.",
  },
  global: {
    title: "تغطية عالمية شاملة",
    description: "خدمات متكاملة لكافة منصات التواصل الاجتماعي الأكثر شهرة عالمياً.",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <Header />

      {/* ── Hero ── */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-24 sm:py-32">
        {/* Subtle Luxury Gradient glow background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#00df82]/15 via-emerald-950/20 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full bg-emerald-950/60 border border-[#00df82]/40 text-[#00df82] uppercase tracking-widest font-mono font-bold shadow-[0_0_15px_rgba(0,223,130,0.15)]">
              The Premier SMM Platform
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("app.title")}
          </motion.h1>

          <motion.p
            className="text-lg text-gray-300 sm:text-xl max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("app.description")}
          </motion.p>

          <motion.div
            className="pt-4 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/home/services">
              <Button size="lg" className="gap-2 bg-[#00df82] hover:bg-[#10e57a] text-black font-extrabold rounded-xl px-6 h-12 shadow-lg shadow-[#00df82]/30 cursor-pointer">
                {t("nav.services")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl px-6 h-12 cursor-pointer">
                {t("nav.register")}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl px-6 h-12 cursor-pointer">
                {t("nav.login")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-zinc-800/80 bg-zinc-950/60 px-4 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {features.map(({ icon: Icon, key }, i) => (
            <motion.div
              key={key}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="group rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-md transition-all hover:border-[#00df82]/40 hover:shadow-[0_0_25px_rgba(0,223,130,0.15)]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-emerald-950/60 border border-[#00df82]/30 p-3 text-[#00df82] group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {featureDetails[key].title}
              </h3>
              <p className="mt-1.5 text-sm text-gray-300 leading-relaxed">
                {featureDetails[key].description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
