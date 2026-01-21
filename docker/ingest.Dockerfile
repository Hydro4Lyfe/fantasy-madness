# docker/ingest.Dockerfile

# ---------- build stage ----------
FROM node:24-slim AS build
WORKDIR /repo

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy manifests first for caching
COPY package.json package-lock.json tsconfig*.json ./
COPY packages/db/package.json packages/db/tsconfig.json packages/db/
COPY apps/ingest/package.json apps/ingest/tsconfig.json apps/ingest/

# Avoid running postinstall before schema exists
RUN npm ci --ignore-scripts

# Copy source (includes prisma schema)
COPY packages/db packages/db
COPY apps/ingest apps/ingest

# Generate prisma + build
RUN npm run db:generate
RUN npm -w @fantasy-madness/db run build
RUN npm -w @fantasy-madness/ingest run build


# ---------- runtime stage ----------
FROM node:24-slim
WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy only package manifests (so npm can lay out workspaces correctly)
COPY package.json package-lock.json ./
COPY packages/db/package.json packages/db/package.json
COPY apps/ingest/package.json apps/ingest/package.json

# Install production deps only (no scripts)
RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts
COPY --from=build /repo/packages/db/dist /app/packages/db/dist
COPY --from=build /repo/apps/ingest/dist /app/apps/ingest/dist

# Copy generated Prisma client from build stage (critical)
COPY --from=build /repo/node_modules/.prisma /app/node_modules/.prisma

WORKDIR /app/apps/ingest
CMD ["node", "dist/index.js"]
