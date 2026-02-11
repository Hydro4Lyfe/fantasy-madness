# AGENTS.md

Guidance for agentic coding tools working in this repo.
Keep edits small, respect existing file style, and avoid broad reformatting.

## Repo Snapshot
- Monorepo (npm workspaces) with Next.js web app and ingest service.
- Packages: `apps/web`, `apps/ingest`, `packages/db`, `packages/domain`, `packages/ui`.
- DAL code lives in `apps/web/server/dal` (no `packages/dal` folder currently).
- TypeScript strict mode across packages.

## Core Commands

### Setup
```bash
npm install
```

### Development
```bash
npm run dev:web
npm run dev:web-no-websocket
npm run dev:ingest
```

### WebSocket Server (web)
```bash
npm run dev:ws -w @fantasy-madness/web
npm run start:ws -w @fantasy-madness/web
```

### Build
```bash
npm run build
npm run build:db
npm run build:domain
npm run build:web
npm run build:ingest
```

### Start (prod-like)
```bash
npm run start:web
npm run start:ingest
```

### Typecheck / Lint
```bash
npm run typecheck -w @fantasy-madness/web
npm run typecheck -w @fantasy-madness/ingest
npm run lint -w @fantasy-madness/web
```

### Prisma
```bash
npm run prisma -w @fantasy-madness/db -- <command>
npm run generate -w @fantasy-madness/db
npm run migrate:dev -w @fantasy-madness/db
npm run migrate:deploy -w @fantasy-madness/db
```

### Docker (infra)
```bash
cd infra/compose
docker-compose up --build
docker-compose up --build web
docker-compose up --build ingest
```

## Tests
- There is no standard `test` script in package.json.
- A WebSocket integration test exists at `apps/web/lib/websocket/__tests__/integration.test.ts`.
- The test file mentions running `npm test -- integration.test.ts`, but this repo does not define a test runner.
- Expect to wire up your own runner (e.g., Jest/Vitest) or run ad-hoc checks locally.
- The integration test requires Postgres, Redis, and env vars; it will skip when `INTEGRATION_TEST` is not set.

## Environment Variables (high level)
- `DATABASE_URL` and `DIRECT_URL` required for DB access and migrations.
- Web: Supabase env vars, plus `ADMIN_EMAILS`.
- Ingest: Sportradar API credentials.

## Code Style and Conventions

### TypeScript / Modules
- Use TypeScript everywhere; `strict` is enabled.
- ES modules are standard (`type: module` in ingest/db/domain).
- Use `import type` for type-only imports (common in DAL).

### Formatting
- No formatter config found; style varies by file.
- Match the existing style in the file you are editing.
- Avoid repo-wide reformatting.
- Example patterns seen:
  - `apps/web/components/ui/*` uses semicolons and double quotes.
  - `apps/web/lib/utils.ts` uses no semicolons.

### Imports
- Group imports by origin with blank lines (node builtin, external, internal).
- In `apps/web`, use path aliases: `@/components`, `@/server`, `@/lib`, `@/hooks`.
- Prefer relative imports inside a folder when no alias exists.

### Naming
- Functions and variables: `camelCase`.
- Types/interfaces/components: `PascalCase`.
- Constants: `SCREAMING_SNAKE_CASE` only for true constants.
- Keep names explicit; avoid single-letter variables outside loops.

### React / Next.js (apps/web)
- Use App Router conventions; server actions start with `"use server"`.
- Server actions live in `apps/web/server/actions` and return `{ success, error? }`.
- Server queries live in `apps/web/server/queries` and are thin wrappers over DAL.
- Use `revalidatePath` after mutations that affect cached pages.
- Use `cn()` (`apps/web/lib/utils.ts`) to merge class names.
- UI components follow shadcn/ui patterns with `data-slot` attributes and `class-variance-authority`.

### Data Access / DAL
- Use Prisma client from `@fantasy-madness/db`.
- DAL functions in `apps/web/server/dal` often accept `{ db, input }` to support transactions.
- For reads, prefer DAL query functions over inline Prisma in pages/actions.
- Domain errors use `DomainError` with codes like `NOT_FOUND`, `CONFLICT`, `INVALID_STATE`.
- Map Prisma errors via `mapPrismaError` when crossing boundaries.

### Error Handling
- DAL: throw `DomainError` and let callers handle.
- Server actions: catch and return `{ success: false, error: message }`.
- Ingest: log via `log` and ensure process exits on fatal errors.

### Comments
- Keep comments minimal and purposeful; avoid restating obvious code.
- Do add brief comments for non-obvious logic (e.g., parsing rules, edge cases).

## Architecture Reminders
- Web app uses Supabase Auth with guards in `apps/web/server/auth/guards.ts`.
- `apps/ingest` is a CLI/service that runs pg-boss workers and syncs Sportradar data.
- Prisma schema and client live in `packages/db`.
- Shared types and Zod schemas live in `packages/domain`.

## Cursor/Copilot Rules
- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot rules found in `.github/copilot-instructions.md`.

## Practical Defaults for Agents
- Prefer smallest viable change.
- Avoid touching unrelated files.
- If you need a new dependency, add it only in the relevant workspace.
- Verify build/typecheck for the touched workspace when feasible.
