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

Your ingest service remains the only place that calls Sportradar.
