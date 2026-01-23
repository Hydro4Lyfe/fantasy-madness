# Fantasy Madness — Monorepo Skeleton (npm workspaces + Prisma 7)

This is a **project skeleton** matching the architecture discussed:

- `apps/web` — Next.js App Router web application (stateless)
- `apps/ingest` — drop-in slot for your existing ingest service (keep your current design)
- `packages/db` — Prisma schema + migrations + Prisma client factory (**Prisma 7**)
- `packages/domain` — shared domain types/enums/zod/rules/errors (no DB imports)
- `packages/dal` — all Prisma access (queries + mutations) accepting `db` arg
- `infra` — Kubernetes and Docker manifest stubs
- `tooling` — shared tsconfig (stub)

## Using npm workspaces

Install:
```bash
npm install
```

Run web:
```bash
npm run dev:web
```

Prisma (from packages/db):
```bash
npm run prisma -w @fantasy-madness/db -- -v
npm run generate -w @fantasy-madness/db
npm run migrate:dev -w @fantasy-madness/db
```

## Dropping in your existing ingest service

Option A (simplest): **copy your current ingest repo contents into `apps/ingest/`**
- Replace this stub `apps/ingest/package.json` with your real one.
- Keep the package name `@fantasy-madness/ingest` (recommended).
- Run `npm install` again at the repo root.

Option B: If your ingest already lives elsewhere in this monorepo, just ensure it sits under `apps/ingest`
and that it has a valid workspace `package.json`.

> This skeleton intentionally does not redesign ingest.
