import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Helps Next transpile TS from workspace packages.
  transpilePackages: [
    "@fantasy-madness/db",
    "@fantasy-madness/dal",
    "@fantasy-madness/domain",
  ],
  output: "standalone",
};

export default nextConfig;
