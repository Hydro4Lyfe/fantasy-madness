# ---------- deps ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/ingest/package.json apps/ingest/package.json
COPY packages/db/package.json packages/db/package.json

RUN npm ci

# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .

RUN npm run generate -w @fantasy-madness/db
RUN npm run build -w @fantasy-madness/db
RUN npm run build -w @fantasy-madness/ingest

# ---------- runner ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what ingest needs to run
COPY --from=build /repo/apps/ingest/dist ./apps/ingest/dist
COPY --from=build /repo/apps/ingest/package.json ./apps/ingest/package.json

# db runtime output (so ESM exports resolve)
COPY --from=build /repo/packages/db/dist ./packages/db/dist
COPY --from=build /repo/packages/db/package.json ./packages/db/package.json

# Node needs the production dependencies
COPY --from=build /repo/node_modules ./node_modules

WORKDIR /app/apps/ingest
CMD ["node", "dist/index.js"]
