import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true, // <-- यह लाइन कोड की चेकिंग वाले एरर को रोक देगी
  },
};

export default nextConfig;