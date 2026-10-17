import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ملاحظة: أزلنا output: "standalone" — نشر Cloudflare يُدار عبر OpenNext
  // (npm run cf:deploy) بينما التطوير المحلي يعمل كالمعتاد (npm run dev)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
