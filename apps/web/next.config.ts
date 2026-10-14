import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: false,
  images: {
    // AVIF first, WebP fallback: smaller downloads than the default WebP-only.
    formats: ["image/avif", "image/webp"],
    // Optimised images are cached for a day instead of the 4h default.
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  async redirects() {
    const rawStudioUrl =
      process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
      process.env.SANITY_STUDIO_URL ||
      "https://sanity.ushopgh.com";
    const studioUrl = rawStudioUrl.replace(/\/+$/, "");

    return [
      {
        source: "/studio",
        destination: studioUrl,
        permanent: false,
      },
      {
        source: "/studio/:path*",
        destination: `${studioUrl}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
