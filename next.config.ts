import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export' ko yahan se hata diya gaya hai taaki Vercel par API aur Server features chal sakein
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