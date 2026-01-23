# ---------- deps ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /repo
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy manifests for caching (IMPORTANT: include dal + domain)
COPY package.json package-lock.json ./
COPY apps/ingest/package.json apps/ingest/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/dal/package.json packages/dal/package.json

# Install workspace deps (creates node_modules/@fantasy-madness/dal)
RUN npm ci


# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /repo
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /repo/node_modules ./node_modules
COPY . .

# Prisma client for db package
RUN npm run generate -w @fantasy-madness/db

# Build shared packages then ingest
RUN npm run build:db
RUN npm run build:domain
RUN npm run build:dal
RUN npm run build:ingest


# ---------- runner ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/ingest/dist ./apps/ingest/dist
COPY --from=build /repo/apps/ingest/package.json ./apps/ingest/package.json
COPY --from=build /repo/package.json ./package.json

WORKDIR /app/apps/ingest
CMD ["node", "dist/index.js"]
