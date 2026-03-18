import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    include: [
      "packages/**/*.test.ts",
      "apps/web/**/*.test.ts",
    ],
    exclude: [
      "node_modules/**",
      "**/websocket/__tests__/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/web"),
      "@/lib": path.resolve(__dirname, "apps/web/lib"),
      "@/components": path.resolve(__dirname, "apps/web/components"),
      "@/server": path.resolve(__dirname, "apps/web/server"),
    },
  },
});
