import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <-- Yeh line 'out' folder banayegi
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
};

export default nextConfig;