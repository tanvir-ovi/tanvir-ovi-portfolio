import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the higher quality used for the portrait and thesis photos;
    // without this Next.js silently falls back to quality 75.
    qualities: [75, 92],
  },
};

export default nextConfig;
