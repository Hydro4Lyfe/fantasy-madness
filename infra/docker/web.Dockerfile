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

# Disable timer worker during build to prevent Redis connection attempts
ARG DISABLE_TIMER_WORKER=true
ENV DISABLE_TIMER_WORKER=${DISABLE_TIMER_WORKER}

# Prisma client must exist for builds that import @fantasy-madness/db
RUN npm run generate -w @fantasy-madness/db

# Build shared packages then web
RUN npm run build:db
RUN npm run build:domain
RUN npm run build:dal
RUN npm run build:web

# ---------- runner ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl wget \
  && rm -rf /var/lib/apt/lists/*

# Copy node_modules (needed for ws, ioredis, next, tsx, etc.)
COPY --from=build /repo/node_modules ./node_modules

# Copy package files for workspace resolution
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/apps/web/package.json ./apps/web/package.json
COPY --from=build /repo/packages/db/package.json ./packages/db/package.json
COPY --from=build /repo/packages/domain/package.json ./packages/domain/package.json
COPY --from=build /repo/packages/dal/package.json ./packages/dal/package.json

# Copy built packages
COPY --from=build /repo/packages ./packages

# Copy Next.js build output and source files
COPY --from=build /repo/apps/web/.next ./apps/web/.next
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/lib ./apps/web/lib
COPY --from=build /repo/apps/web/hooks ./apps/web/hooks
COPY --from=build /repo/apps/web/server.ts ./apps/web/server.ts
COPY --from=build /repo/apps/web/tsconfig.json ./apps/web/tsconfig.json

# Copy next.config
COPY --from=build /repo/apps/web/next.config.ts ./apps/web/next.config.ts

WORKDIR /app/apps/web

EXPOSE 3000

# Run the custom WebSocket server using tsx (handles TypeScript directly)
CMD ["npx", "tsx", "server.ts"]
