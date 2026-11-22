import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Ensure database URL fallback is set during Next.js initialization
const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_3VqDfxXUF9lc@ep-green-mode-bewo2r7e-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const DEFAULT_DIRECT_URL =
  "postgresql://neondb_owner:npg_3VqDfxXUF9lc@ep-green-mode-bewo2r7e.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}
if (!process.env.DIRECT_URL || process.env.DIRECT_URL.trim() === "") {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL;
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  process.env.JWT_SECRET = "smm-lacost-super-secret-key-2026";
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL || DEFAULT_DIRECT_URL,
    JWT_SECRET: process.env.JWT_SECRET || "smm-lacost-super-secret-key-2026",
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/home",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "/home/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
