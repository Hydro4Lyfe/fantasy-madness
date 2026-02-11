# Ingest Service (drop-in slot)

This directory is intentionally a **placeholder**.

✅ How to drop in your existing ingest service:
1. Copy your ingest source into this folder (overwriting the stub files).
2. Ensure `apps/ingest/package.json` exists and has a workspace name (recommended):
   - `"name": "@fantasy-madness/ingest"`
3. From repo root:
   ```bash
   npm install
   ```

Your ingest service remains the only place that calls third-party data providers.

## Team Logo Sync (one-time)

Use this command to fetch team logos and write files to
`apps/web/public/team-logos/<teamId>.<ext>`.

```bash
npm run sync-logos -w @fantasy-madness/ingest -- --provider espn --dryRun
```

Then remove `--dryRun` to write files.

Optional Sportradar mode:

```bash
npm run sync-logos -w @fantasy-madness/ingest -- --provider sportradar --endpoint "/cms_assets/ap_sample/public/ncaamb/logos/manifest.json"
```

Notes:
- ESPN mode defaults to `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams?limit=500`.
- You can override ESPN via `--endpoint` or `ESPN_LOGOS_ENDPOINT`.
- Sportradar mode can use `SPORTRADAR_LOGOS_ENDPOINT` instead of passing `--endpoint`.
- Ingest now auto-loads `.env` from common locations, including repo root and `apps/ingest/.env`.
- You can force a specific env file with `INGEST_ENV_FILE=/absolute/path/.env`.
- `--dryRun` will parse and match without writing files.
- Team matching uses abbreviation/name/full-name heuristics.
