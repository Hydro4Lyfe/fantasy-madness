# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /repo

# 1) Copy lockfiles + workspace manifests first (cache-friendly)
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

COPY apps/ingest/package.json apps/ingest/package.json
COPY packages/db/package.json packages/db/package.json

# 2) Install deps WITHOUT running postinstall (schema not copied yet)
RUN npm ci --ignore-scripts

# 3) Copy source (now prisma schema exists)
COPY apps/ingest apps/ingest
COPY packages/db packages/db

# 4) Generate Prisma client + build packages
RUN npm run db:generate
RUN npm -w @fantasy-madness/db run build
RUN npm -w @fantasy-madness/ingest run build


# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and compiled output
COPY --from=build /repo/node_modules /app/node_modules
COPY --from=build /repo/apps/ingest/dist /app/apps/ingest/dist

# Copy db package (compiled output + prisma runtime assets)
# If you want slimmer images later, we can copy only dist + prisma folder.
COPY --from=build /repo/packages/db /app/packages/db

# IMPORTANT:
# Use ENTRYPOINT so "sync ...", "backfill ...", etc are passed as args
ENTRYPOINT ["node", "apps/ingest/dist/index.js"]

# Default command = live mode (or whatever your CLI default is)
CMD ["live"]
