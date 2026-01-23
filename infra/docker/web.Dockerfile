# ---------- deps ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /repo
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*


# Copy only the manifests first for caching
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/dal/package.json packages/dal/package.json

# Install workspace deps
RUN npm ci

# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /repo
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /repo/node_modules ./node_modules
COPY . .

# Prisma client must exist for builds that import @fantasy-madness/db
RUN npm run generate -w @fantasy-madness/db

# Build shared packages then web
RUN npm run build:db
RUN npm run build:domain
RUN npm run build:dal
RUN npm run build:web

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next standalone output
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static

# If your standalone server expects to run from apps/web:
WORKDIR /app/apps/web

EXPOSE 3000
CMD ["node", "server.js"]
