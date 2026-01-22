import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "packages/db/prisma/schema.prisma",
  migrations: { path: "packages/db/prisma/migrations" },
  datasource: {
    url: env("DIRECT_URL") ?? env("DATABASE_URL"),
  },
});

