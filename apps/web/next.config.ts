import type { NextConfig } from "next";

// Use standalone output only when NOT using custom WebSocket server
// Custom server requires programmatic Next.js API which doesn't work with standalone
const useStandalone = process.env.USE_STANDALONE_OUTPUT === "true";

const nextConfig: NextConfig = {
  // Helps Next transpile TS from workspace packages.
  transpilePackages: [
    "@fantasy-madness/db",
    "@fantasy-madness/domain",
  ],
  async headers() {
    return [
      {
        source: "/team-logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  // Only use standalone when explicitly requested (without WebSocket)
  ...(useStandalone && { output: "standalone" }),
};

export default nextConfig;
