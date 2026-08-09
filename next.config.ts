import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
typescript: {
    ignoreBuildErrors: true, // <-- यह लाइन TypeScript के सारे एरर को नजरअंदाज कर देगी!
  },
};
export default nextConfig;