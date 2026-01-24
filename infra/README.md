# Infrastructure Documentation

This directory contains Docker configuration and orchestration files for running the Fantasy Madness application in containerized environments.

## Directory Structure

```
infra/
├── compose/
│   └── docker-compose.yml    # Docker Compose orchestration
└── docker/
    ├── web.Dockerfile         # Next.js web application
    └── ingest.Dockerfile      # Data ingestion service
```

## Quick Start - Run Both Services

From the project root, navigate to the compose directory and run:

```bash
cd infra/compose
docker-compose up --build
```

This will:
- Build both the web and ingest services
- Start both containers
- Web will be available at http://localhost:3000
- Ingest will run in live mode by default

## Individual Service Commands

### Build and Run Web Only

```bash
cd infra/compose
docker-compose up --build web
```

### Build and Run Ingest Only

```bash
cd infra/compose
docker-compose up --build ingest
```

### Run in Detached Mode (Background)

```bash
cd infra/compose
docker-compose up -d --build
```

### View Logs

```bash
# Both services
docker-compose logs -f

# Web only
docker-compose logs -f web

# Ingest only
docker-compose logs -f ingest
```

### Stop Containers

```bash
docker-compose down
```

### Rebuild Without Cache

If you need to force a complete rebuild:

```bash
docker-compose build --no-cache
docker-compose up
```

## Customizing Ingest Command

The ingest service uses an ENTRYPOINT pattern that allows passing different commands. To run ingest with specific commands (like `sync` or `backfill`), edit `compose/docker-compose.yml` and add a command override:

```yaml
ingest:
  # ... existing config ...
  command: ["sync", "tourney", "2025"]  # Example: run sync instead of live
```

Common ingest commands:
- `live` - Run in live mode (default)
- `sync tourney <year>` - Sync tournament data
- `backfill <options>` - Backfill historical data

## Environment Variables

Both services require environment variables to be configured. The docker-compose.yml references a root-level `.env` file.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (pooled)
- `DIRECT_URL` - PostgreSQL direct connection string
- `DEV_USER_ID` - Development user ID (for local auth scaffold)
- `DEV_ADMIN` - Admin flag (0 or 1)
- `REVALIDATE_SECRET` - (Optional) Secret for revalidation endpoint

Example `.env` file:
```env
DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/database
DEV_USER_ID=dev-user-1
DEV_ADMIN=1
REVALIDATE_SECRET=your-secret-here
```

## Service Details

### Web Service

- **Base Image**: node:22-bookworm-slim (build), node:22-alpine (runtime)
- **Port**: 3000
- **Build Context**: Repository root
- **Output**: Next.js standalone mode
- **Dependencies**: @fantasy-madness/db, @fantasy-madness/dal, @fantasy-madness/domain

The web Dockerfile uses a multi-stage build:
1. **deps** - Install Node dependencies
2. **build** - Generate Prisma client and build all packages
3. **runner** - Copy standalone output and serve

### Ingest Service

- **Base Image**: node:22-bookworm-slim
- **Build Context**: Repository root
- **Entry Point**: `node apps/ingest/dist/index.js`
- **Default Command**: `live`
- **Dependencies**: @fantasy-madness/db, @fantasy-madness/dal, @fantasy-madness/domain

The ingest Dockerfile uses a multi-stage build:
1. **deps** - Install Node dependencies
2. **build** - Generate Prisma client and build packages
3. **runner** - Copy compiled output and node_modules

## Build Process

Both services follow the same build order:
1. Generate Prisma client (`@fantasy-madness/db`)
2. Build database package
3. Build domain package
4. Build DAL (Data Access Layer) package
5. Build the target application (web or ingest)

This ensures all workspace dependencies are properly compiled before the main application.

## Important Notes

1. **Next.js Standalone**: The web service is configured with `output: "standalone"` in `apps/web/next.config.ts`, which creates an optimized production bundle.

2. **Workspace Dependencies**: Both Dockerfiles properly handle npm workspaces and copy all necessary package.json files for dependency resolution.

3. **Prisma Client**: The Prisma client is generated during the build process and must complete before building dependent packages.

4. **.dockerignore**: A `.dockerignore` file exists at the repository root to exclude unnecessary files from the Docker build context.

5. **Build Context**: Both Dockerfiles use the repository root as the build context to access all workspace packages.

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it in `docker-compose.yml`:

```yaml
web:
  ports:
    - "3001:3000"  # Maps host port 3001 to container port 3000
```

### Database Connection Issues

Ensure your database is accessible from the Docker containers. If running a local database, use `host.docker.internal` instead of `localhost` in your connection string.

### Build Failures

If builds fail:
1. Check that all environment variables are set
2. Try rebuilding without cache: `docker-compose build --no-cache`
3. Check Docker logs: `docker-compose logs`
4. Ensure you have enough disk space and memory allocated to Docker

### Viewing Container Status

```bash
docker-compose ps
```

This shows the status of all services.
