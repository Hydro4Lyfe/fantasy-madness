# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /repo

# 1) Copy lockfiles + workspace manifests first (cache-friendly)
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

COPY apps/ingest/package.json apps/ingest/package.json
COPY packages/db/package.json packages/db/package.json

# 2) Install deps WITHOUT running postinstall (prisma schema not copied yet)
RUN npm ci --ignore-scripts

# 3) Copy source (now prisma schema exists)
COPY apps/ingest apps/ingest
COPY packages/db packages/db

# 4) Now it’s safe to run scripts

# prisma client generation (your root script)
RUN npm run db:generate

# build the db workspace package (so @fantasy-madness/db has dist/types)
RUN npm -w @fantasy-madness/db run build

# now build ingest
RUN npm -w @fantasy-madness/ingest run build
RUN npm run db:generate
RUN npm -w @fantasy-madness/ingest run build


# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and compiled output
COPY --from=build /repo/node_modules /app/node_modules
COPY --from=build /repo/apps/ingest/dist /app/apps/ingest/dist

# Copy db package (prisma client/runtime assets)
COPY --from=build /repo/packages/db /app/packages/db

CMD ["node", "apps/ingest/dist/index.js"]
