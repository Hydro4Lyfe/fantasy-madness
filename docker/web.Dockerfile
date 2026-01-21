# docker/web.Dockerfile
FROM node:24-slim AS build
WORKDIR /repo

COPY package.json package-lock.json tsconfig*.json ./
COPY packages/db/package.json packages/db/tsconfig.json packages/db/
COPY apps/web/package.json apps/web/tsconfig.json apps/web/ 2>/dev/null || true

RUN npm ci

COPY packages/db packages/db
COPY apps/web apps/web

# Prisma client must be generated for linux
RUN npm run db:generate
RUN npm -w @fantasy-madness/db run build

# Build Next app (use prefix so workspace name doesn't matter)
# If Next build touches Prisma at build time, provide a dummy DATABASE_URL:
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm --prefix apps/web run build

# Runtime image (standalone)
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./.next/static
COPY --from=build /repo/apps/web/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
