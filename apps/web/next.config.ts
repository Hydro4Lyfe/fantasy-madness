import type { NextConfig } from "next";

// Use standalone output only when NOT using custom WebSocket server
// Custom server requires programmatic Next.js API which doesn't work with standalone
const useStandalone = process.env.USE_STANDALONE_OUTPUT === "true";

const nextConfig: NextConfig = {
  // Helps Next transpile TS from workspace packages.
  transpilePackages: [
    "@fantasy-madness/db",
    "@fantasy-madness/dal",
    "@fantasy-madness/domain",
  ],
  // Only use standalone when explicitly requested (without WebSocket)
  ...(useStandalone && { output: "standalone" }),
};

export default nextConfig;
