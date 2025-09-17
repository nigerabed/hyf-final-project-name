# Database changes & deployment notes

This document summarizes the database-related changes I made to get the project working reliably on a hosted environment (Render). It explains what was added, why, and how to run and verify the migrations and seeds safely.

If your local development DB already had the full schema and seeds, the app worked locally. Managed DBs (Render) start empty — the changes below make deploys reproducible and idempotent.

---

## High-level summary of changes

- Added a full-schema, idempotent Knex migration that creates the complete schema in-code (so a fresh DB can be created during deploy). File: `api/src/migrations/004_apply_full_schema.js`.
- Added a robust seed runner that executes the canonical monolithic SQL seed file statement-by-statement, with runtime adaptations to handle environment differences and to make seeding idempotent. File: `api/src/seeds/001_run_full_seed.js`.
- Hardened `knex` config for production to use `DATABASE_URL` and enable `ssl.rejectUnauthorized=false` when appropriate. File: `api/knexfile.js`.
- Hardened DB connection startup diagnostics and fallback logic to prefer `DATABASE_URL` where applicable. File: `api/src/db.mjs`.
- Added a migration to detect and remove duplicate `travel_plans` rows and create a unique index to prevent future duplicates. File: `api/src/migrations/005_remove_duplicate_travel_plans.js`.
- Added a small detector script to preview duplicate `travel_plans` groups before deleting anything. File: `api/scripts/find_duplicate_travel_plans.mjs`.
- The API router for tours was made defensive (dedupe results returned and log if duplicates were removed). File: `api/src/routers/tours.js`.

Additionally, small client-side and server-side defensive changes were made while debugging (frontend normalization/dedupe and debug logs) — these are not DB changes but helped diagnose and mitigate symptoms.

---

## Why these changes were necessary

- The repository stored the canonical schema and seeds as large SQL files under `database/` but not as structured migrations. That works when you manually import the SQL locally, but a fresh managed Postgres instance needs a reproducible, in-repo process to create the schema and load seeds.
- Render provides `DATABASE_URL` (single connection string) and often requires SSL settings. The code needed to support that configuration.
- The large monolithic SQL seed contained non-idempotent inserts and statements that failed when executed raw in a different DB state (e.g. multi-row subqueries, uuid vs integer id mismatch, and duplicate-key violations). The seed runner was made fault-tolerant and idempotent.
- Seed files may reference absolute or repo-relative file paths; Render's CWD can differ, so the runner searches multiple candidate paths.

---

## Key implementation notes and behaviors

- `004_apply_full_schema.js`:
  - Creates `pgcrypto` extension.
  - Attempts to detect whether `users.id` is integer or uuid (for older installs) and creates foreign keys that match existing types.
  - Uses `CREATE TABLE IF NOT EXISTS` equivalents via Knex to be idempotent.

- `001_run_full_seed.js` (seed runner):
  - Searches a list of likely locations for the seed SQL (`database/seeds/mock_data.sql` etc.).
  - Normalizes line endings, strips single-line SQL comments, then splits into statements and runs them sequentially.
  - Detects when `users.id` is integer (older DB) and rewrites users INSERT ... SELECT statements to omit `id` values or `gen_random_uuid()` calls.
  - Appends `ON CONFLICT DO NOTHING` to `INSERT` statements that lack conflict handling to make seeds idempotent.
  - Patches single-row-subqueries `(SELECT id FROM table WHERE ...)` to `(SELECT id FROM table WHERE ... LIMIT 1)` when necessary.
  - Reports failures per-statement (statement index and preview) to make errors actionable in logs.

- `005_remove_duplicate_travel_plans.js`:
  - Detects duplicate `travel_plans` groups by `(name, start_date, price_minor, duration_days, capacity)`.
  - Keeps one `id` per group (the first in array order) and deletes the rest.
  - Creates a unique index on those columns to prevent re-insertion of duplicates.
  - Note: this deletion is destructive — back up your DB first and review duplicate groups with the detector script.

- `api/scripts/find_duplicate_travel_plans.mjs`:
  - Prints groups with COUNT(*) > 1 and lists the `id`s that would be affected. Run before applying the migration to preview changes.

---

## Commands — local / Render

Run these commands in the `api/` folder (PowerShell examples):

1) Back up the DB (strongly recommended):

```powershell
$env:DATABASE_URL = 'postgres://USER:PASS@HOST:PORT/DBNAME'
# $env:DATABASE_URL must be set to a reachable DB for these commands
pg_dump --dbname="$env:DATABASE_URL" -Fc -f "..\backups\travelplans_backup_$(Get-Date -Format yyyyMMdd_HHmmss).dump"
```

2) Preview duplicates (do this BEFORE running the dedupe migration):

```powershell
cd api
# $env:DATABASE_URL may already be set in your environment
node .\scripts\find_duplicate_travel_plans.mjs
```

3) Run migrations (applies full schema and cleanup migration):

```powershell
cd api
npx knex migrate:latest --knexfile .\knexfile.js
```

4) Run seeds (the robust runner is registered in `api/src/seeds` so you can run all seeds with Knex seed runner):

```powershell
npx knex seed:run --knexfile .\knexfile.js
# or rely on your existing startup script which runs migrations+seeds (e.g. wait-for-db-and-migrate.mjs)
```

5) Verify API responds and returns tours (quick check):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3001/api/tours?limit=12&page=1' -Headers @{Accept='application/json'} | ConvertTo-Json -Depth 6
```

---

## Render-specific notes

- Make sure the frontend and API services use the `feature/render-deploy` branch (or whichever branch you push these changes to).
- Render provides `DATABASE_URL` — the code is configured to consume it. For some Render Postgres installations you must allow SSL but skip server verification; the knex config uses `ssl: { rejectUnauthorized: false }` when a connection string is used.
- Render's DB host is private; you cannot psql into it from your laptop unless you create a private tunnel or use a Render one-off shell. That is why migrations and seeds must run inside the deployed instance (the repo's startup script runs migrations/seeds at boot).

---

## Rollback & safety

- The dedupe migration (`005_...`) has a `down` that removes the unique index but does not restore deleted rows. Use the backup (pg_restore) to restore rows if needed.
- Always run the detector script first and inspect the ids before applying the migration in production.

---

## Files changed / added (paths)

- `api/knexfile.js` — production SSL and DATABASE_URL handling
- `api/src/db.mjs` — DB connection selection & diagnostics
- `api/src/migrations/004_apply_full_schema.js` — full idempotent schema migration
- `api/src/migrations/005_remove_duplicate_travel_plans.js` — dedupe and unique index
- `api/src/seeds/001_run_full_seed.js` — robust seed runner (statement-level execution + rewrites)
- `api/scripts/find_duplicate_travel_plans.mjs` — duplicate detector (preview)
- `api/src/routers/tours.js` — defensive dedupe & logging in API responses

Additional helper scripts and where to find them:

- `api/scripts/wait-for-db-and-migrate.mjs` — waits for the DB to be reachable, runs `npx knex migrate:latest` then `npx knex seed:run` with retries. This is the script referenced by the Render start command (`node scripts/wait-for-db-and-migrate.mjs && npm run start:prod`).
- `api/scripts/db-init.js` — an automated local helper that can apply `database/schema/schema.sql` and `database/seeds/mock_data.sql` via `psql` (or Docker-based psql) for quick local resets. It is also used by the `npm run db:reset` script.
- `scripts/apply_schema_to_db.ps1` (repo root) — PowerShell helper that runs the canonical `schema.sql` and seeds inside a Docker `postgres` container (useful on systems without a local Postgres client).

---

## Recommended next steps

1. Run the duplicate detector on production (or staging) and review groups.
2. Take a DB backup (pg_dump) before running migrations in production.
3. Run `npx knex migrate:latest` in the environment that can reach the DB (or redeploy the API service so `wait-for-db-and-migrate.mjs` runs it on boot).
4. Verify the frontend and API and watch logs for seeded errors.
5. Consider converting the large SQL seed into smaller, explicit Knex seed files (optional, longer-term).
6. Add a small CI job that runs migrations + seeds against a disposable Postgres container to catch environment-specific regressions early.

## Quick script reference (useful commands)

PowerShell examples (Windows):

```powershell
cd api
#$env:DATABASE_URL = 'postgres://USER:PASS@HOST:PORT/DBNAME'
npx knex migrate:latest --knexfile .\knexfile.js
npx knex seed:run --knexfile .\knexfile.js
node .\scripts\find_duplicate_travel_plans.mjs
node .\scripts\wait-for-db-and-migrate.mjs
pg_dump --dbname="$env:DATABASE_URL" -Fc -f "..\backups\travelplans_backup_$(Get-Date -Format yyyyMMdd_HHmmss).dump"
pg_restore --dbname="$env:DATABASE_URL" "..\backups\travelplans_backup_YYYYMMDD_HHMMSS.dump"
```

Bash examples (macOS / Linux / CI):

```bash
cd api
export DATABASE_URL='postgres://USER:PASS@HOST:PORT/DBNAME'
npx knex migrate:latest --knexfile ./knexfile.js
npx knex seed:run --knexfile ./knexfile.js
node ./scripts/find_duplicate_travel_plans.mjs
node ./scripts/wait-for-db-and-migrate.mjs
pg_dump --dbname="$DATABASE_URL" -Fc -f "../backups/travelplans_backup_$(date +%Y%m%d_%H%M%S).dump"
pg_restore --dbname="$DATABASE_URL" "../backups/travelplans_backup_YYYYMMDD_HHMMSS.dump"
```

Add this brief list of useful `npm` scripts from `api/package.json` (run from `api/`):

```powershell
npm run migrate        # runs `knex migrate:latest`
npm run migrate:rollback
npm run migrate:make
npm run db:reset       # runs the local db-init helper
```

Log verification tips (what to search in Render logs):

- "Attempt X: running migrations" / "Migrations applied successfully." — the `wait-for-db-and-migrate.mjs` script is running and succeeding.
- "Batch X run: Y migrations" — Knex applied migrations; Y should be >= 1 for new deployments.
- "Seed SQL" / "Failed statement" — the seed-runner printed a statement execution or failure; inspect the statement number and preview.
- "duplicate key value" / "ERROR: subquery returned more than than one row" — see the Common error logs section for remediation.

---

## Optional follow-ups I can implement

- Convert the monolithic SQL into incremental Knex migrations (cleaner but longer), or
- Add an automatic `migration_audit` table and update the dedupe migration to record how many rows were deleted (non-destructive auditing), or
- Create a small CI smoke test that runs migrations+seeds in GitHub Actions using PostgreSQL service.

If you want me to generate any of the above or tweak the dedupe uniqueness key (for example, include `owner_id`), tell me which option and I will implement it.

---

## Common error logs, causes and remediation

Below are typical error lines you may see in deployment logs (Render) or local startup output, with brief explanations and recommended actions. Collecting these log lines and including them in an issue will greatly help backend devs diagnose problems.

- "getaddrinfo ENOTFOUND <host>" or "ECONNREFUSED" when running detector or psql
  - Cause: Your environment cannot resolve or reach the DB host (common for Render's private DB hosts).
  - Fix: Run the detector or `psql` from a machine that can reach the DB (Render one-off shell) or run the migration+seed inside the deployed instance. Verify `DATABASE_URL` is correct.

- "function min(uuid) does not exist" or PG error about `min` on uuid
  - Cause: A migration used `MIN(id)` while `id` is a `uuid` type; `MIN()` doesn't exist for `uuid` in Postgres.
  - Fix: Use an expression that works with UUIDs (for example `(ARRAY_AGG(id ORDER BY id))[1]` to pick one id) or cast/transform in a UUID-safe way. The migration `005_remove_duplicate_travel_plans.js` was updated to be UUID-safe.

- "duplicate key value violates unique constraint" during seeds
  - Cause: The canonical seed contains inserts that run multiple times or assume an empty DB.
  - Fix: Run the robust seed runner (`001_run_full_seed.js`) which appends `ON CONFLICT DO NOTHING` where safe and rewrites certain `INSERT` statements to be idempotent. If the conflict is unexpected, inspect the conflicting row ids in the seed-runner logs.

- "ERROR: subquery returned more than one row" when executing a statement from the SQL seed
  - Cause: The seed contains `INSERT ... SELECT (SELECT id FROM table WHERE ...)` that assumes a single match. In a different DB state the WHERE may match multiple rows.
  - Fix: The seed runner patches single-row subqueries to add `LIMIT 1`. For permanent fixes, inspect the seed SQL and make the subqueries deterministic.

- SSL / certificate errors when connecting with `DATABASE_URL` (e.g., self-signed certs)
  - Cause: The DB requires SSL but your client is trying to validate the server certificate.
  - Fix: For Render-managed Postgres it's common to set `ssl: { rejectUnauthorized: false }` in production connection options (see `api/knexfile.js`). Prefer consulting your provider's recommended SSL settings.

- "Migrations failed" or "Batch X run: 0 migrations" with stack traces
  - Cause: A migration threw an error (SQL problem, type mismatch, dependency order issue) causing the batch to fail.
  - Fix: Inspect the migration's error stack and logs. Locally, run `npx knex migrate:latest --knexfile ./knexfile.js` and reproduce the exact error; fix the migration or adjust the schema/order.

- Seed runner per-statement error output (e.g. "Failed statement #N: ...")
  - Cause: A specific SQL statement in the monolithic seed failed (path problem, syntax, or environment mismatch).
  - Fix: Read the printed statement preview and error message in the logs. The seed runner prints statement index and a short preview to help identify the failing SQL.

How to collect logs from Render

- Use Render's web UI: open the service, go to "Logs" and filter for recent deploy / startup logs.
- For one-off commands, use Render's shell to run the detector or `psql` and capture the output there.
- Useful strings to search for in logs: `Migrations applied successfully.`, `Batch`, `Seed SQL`, `Failed statement`, `getaddrinfo ENOTFOUND`, `duplicate key value`, `ERROR: subquery returned more than one row`.

When opening an issue for backend devs, paste the relevant log lines (with timestamps) and mention the command you ran (for example `npx knex migrate:latest --knexfile ./knexfile.js` or `node ./scripts/find_duplicate_travel_plans.mjs`) and the `DATABASE_URL` environment (masked). This speeds triage significantly.
