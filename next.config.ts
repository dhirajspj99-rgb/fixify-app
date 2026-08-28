import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 🔥 YEH LINE SABSE ZAROORI HAI MOBILE APP KE LIYE!
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;