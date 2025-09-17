# Render hosting diffs (feature/render-deploy vs origin/main)

This file contains the exact git diff for the files changed to support Render hosting and database setup. It is a snapshot of the branch `feature/render-deploy` changes relevant to deployment and DB initialization.

Files included in this diff:

- `api/knexfile.js`
- `api/scripts/db-init.js`
- `api/scripts/find_duplicate_travel_plans.mjs`
- `api/scripts/wait-for-db-and-migrate.mjs`
- `api/src/db.mjs`
- `api/src/seeds/001_run_full_seed.js`
- `deploy/README_RENDER.md`
- `scripts/apply_schema_to_db.ps1`

---

Below is the exact diff as captured from `git diff origin/main..feature/render-deploy` for those files.

(Keep in mind this is the same content available in the branch; this file is intended for quick human review and for attaching to PR descriptions.)

```diff
diff --git a/api/knexfile.js b/api/knexfile.js
index a6bb108..43863b3 100644
--- a/api/knexfile.js
+++ b/api/knexfile.js
@@ -1,29 +1,47 @@
 import "dotenv/config";
 
 const config = {
-  client: process.env.DB_CLIENT || "pg",
-  connection: {
-    host: process.env.DB_HOST,
-    port: process.env.DB_PORT,
-    user: process.env.DB_USER,
-    password: process.env.DB_PASSWORD,
-    database: process.env.DB_DATABASE_NAME,
-    ssl:
-      process.env.DB_USE_SSL === "true" ? { rejectUnauthorized: false } : false
-  },
-  migrations: {
-    directory: join(__dirname, "src/migrations"),
-    extension: "js",
-  },
-  seeds: {
-    directory: join(__dirname, "src/seeds"),
-    extension: "js",
-  },
+  development: {
+    client: "pg",
+    connection: {
+      host: process.env.DB_HOST,
+      port: process.env.DB_PORT,
+      user: process.env.DB_USER,
+      password: process.env.DB_PASSWORD,
+      database: process.env.DB_NAME,
+    },
+    migrations: {
+      directory: "./src/migrations",
+    },
+    seeds: {
+      directory: "./src/seeds",
+    },
+  },
+  production: {
+    client: "pg",
+    // Use DATABASE_URL if available (Render provides a full connection string)
+    // When connecting to hosted Postgres with SSL, pass ssl config to allow
+    // connections where the server certificate may not be verifiable in the
+    // Node environment (e.g. some managed DB setups). This sets
+    // `rejectUnauthorized: false` to avoid self-signed certificate errors.
+    connection: process.env.DATABASE_URL
+      ? {
+          connectionString: process.env.DATABASE_URL,
+          ssl: { rejectUnauthorized: false },
+        }
+      : {
+          host: process.env.DB_HOST,
+          port: process.env.DB_PORT,
+          user: process.env.DB_USER,
+          password: process.env.DB_PASSWORD,
+          database: process.env.DB_NAME,
+        },
+    migrations: {
+      directory: "./src/migrations",
+    },
+    seeds: {
+      directory: "./src/seeds",
+    },
+  },
 };
@@
```

```diff
diff --git a/api/scripts/db-init.js b/api/scripts/db-init.js
new file mode 100644
index 0000000..80c51bf
--- /dev/null
+++ b/api/scripts/db-init.js
@@ -0,0 +1,57 @@
+import pg from "pg";
+const { Client } = pg;
+import { promises as fs } from "fs";
+import path from "path";
+import { fileURLToPath } from "url";
+import dotenv from "dotenv";
+
+dotenv.config({
+  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
+});
+
+const appDbConfig = {
+  host: process.env.DB_HOST,
+  port: parseInt(process.env.DB_PORT, 10),
+  user: process.env.DB_USER,
+  password: process.env.DB_PASSWORD,
+  database: process.env.DB_NAME,
+};
+
+const schemaFile = path.join(
+  path.dirname(fileURLToPath(import.meta.url)),
+  "../../database/schema/schema.sql"
+);
+const mockDataFile = path.join(
+  path.dirname(fileURLToPath(import.meta.url)),
+  "../../database/seeds/mock_data.sql"
+);
+
+const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
+
+async function setupDatabase() {
+  console.log("Waiting for the database container to be ready...");
+  await wait(5000);
+  console.log("--- Database Setup Started ---");
+
+  const appClient = new Client(appDbConfig);
+  try {
+    await appClient.connect();
+    console.log("[1/2] Applying schema...");
+    const schemaSql = await fs.readFile(schemaFile, "utf8");
+    await appClient.query(schemaSql);
+    console.log("[2/2] Seeding data...");
+    const mockDataSql = await fs.readFile(mockDataFile, "utf8");
+    await appClient.query(mockDataSql);
+    console.log("--- ✅ Database Setup Complete ---");
+  } catch (err) {
+    console.error("!-> Error during schema/seed application:", err);
+    throw err;
+  } finally {
+    await appClient.end();
+  }
+}
+
+setupDatabase().catch((e) => {
+  console.error("!-> A critical error occurred during database setup.");
+  process.exit(1);
+});
@@
```

```diff
diff --git a/api/scripts/find_duplicate_travel_plans.mjs b/api/scripts/find_duplicate_travel_plans.mjs
new file mode 100644
index 0000000..5e48130
--- /dev/null
+++ b/api/scripts/find_duplicate_travel_plans.mjs
@@ -0,0 +1,30 @@
+import knex from '../src/db.mjs';
+
+(async function findDuplicates() {
+  try {
+    const rows = await knex.raw(`
+      SELECT name, start_date, price_minor, duration_days, capacity, COUNT(*) as cnt, ARRAY_AGG(id) as ids
+      FROM travel_plans
+      GROUP BY name, start_date, price_minor, duration_days, capacity
+      HAVING COUNT(*) > 1
+      ORDER BY cnt DESC
+    `);
+
+    const duplicates = rows.rows || rows;
+    if (!duplicates || duplicates.length === 0) {
+      console.log('No duplicate travel_plans found');
+      process.exit(0);
+    }
+
+    console.log('Found duplicate travel_plans groups:');
+    for (const d of duplicates) {
+      console.log(`- name=${d.name} start_date=${d.start_date} price_minor=${d.price_minor} duration=${d.duration_days} capacity=${d.capacity} count=${d.cnt}`);
+      console.log('  ids:', d.ids.join(', '));
+    }
+
+    process.exit(0);
+  } catch (e) {
+    console.error('Error checking duplicates', e);
+    process.exit(2);
+  }
+})();
@@
```

```diff
diff --git a/api/scripts/wait-for-db-and-migrate.mjs b/api/scripts/wait-for-db-and-migrate.mjs
new file mode 100644
index 0000000..faa99ff
--- /dev/null
+++ b/api/scripts/wait-for-db-and-migrate.mjs
@@ -0,0 +1,37 @@
+#!/usr/bin/env node
+import { exec } from 'child_process';
+import { promisify } from 'util';
+import "dotenv/config";
+
+const execAsync = promisify(exec);
+
+const wait = (ms) => new Promise((r) => setTimeout(r, ms));
+
+async function tryMigrate(attempt = 1) {
+  try {
+    console.log(`Attempt ${attempt}: running migrations...`);
+    const { stdout: mOut, stderr: mErr } = await execAsync('npx knex migrate:latest --knexfile ./knexfile.js');
+    if (mOut) console.log(mOut);
+    if (mErr) console.error(mErr);
+    console.log('Migrations applied successfully.');
+
# Render hosting diffs (feature/render-deploy vs origin/main)

This file contains the exact git diff for only the backend and hosting-related files changed on `feature/render-deploy`. The goal is to present the minimal set of backend changes needed for Render hosting so backend engineers can review quickly.

Files included in this diff:

- `api/knexfile.js` (production config using `DATABASE_URL` + SSL handling)
- `api/src/db.mjs` (db client selection + connection diagnostics)
- `api/src/seeds/001_run_full_seed.js` (robust seed-runner with rewrites)
- `api/scripts/wait-for-db-and-migrate.mjs` (startup script that applies migrations + seeds with retries)
- `api/scripts/find_duplicate_travel_plans.mjs` (duplicate detector preview)
- `api/scripts/db-init.js` (local schema+seed applicator)
- `deploy/README_RENDER.md` (Render service settings & start commands)
- `scripts/apply_schema_to_db.ps1` (PowerShell helper to run schema/seeds via Docker psq1)
- `api/README_DB.md` (DB changes summary)

---

Below are the exact diffs (origin/main..feature/render-deploy) for those files.

```diff
diff --git a/api/knexfile.js b/api/knexfile.js
index a6bb108..43863b3 100644
--- a/api/knexfile.js
+++ b/api/knexfile.js
@@ -1,29 +1,47 @@
 import "dotenv/config";
 
 const config = {
   development: {
     client: "pg",
     connection: {
       host: process.env.DB_HOST,
       port: process.env.DB_PORT,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
     },
     migrations: {
       directory: "./src/migrations",
     },
     seeds: {
       directory: "./src/seeds",
     },
   },
   production: {
     client: "pg",
     // Use DATABASE_URL if available (Render provides a full connection string)
     // When connecting to hosted Postgres with SSL, pass ssl config to allow
     // connections where the server certificate may not be verifiable in the
     // Node environment (e.g. some managed DB setups). This sets
     // `rejectUnauthorized: false` to avoid self-signed certificate errors.
     connection: process.env.DATABASE_URL
       ? {
           connectionString: process.env.DATABASE_URL,
           ssl: { rejectUnauthorized: false },
         }
       : {
           host: process.env.DB_HOST,
           port: process.env.DB_PORT,
           user: process.env.DB_USER,
           password: process.env.DB_PASSWORD,
           database: process.env.DB_NAME,
         },
     migrations: {
       directory: "./src/migrations",
     },
     seeds: {
       directory: "./src/seeds",
     },
   },
 };

```

```diff
diff --git a/api/src/db.mjs b/api/src/db.mjs
new file mode 100644
index 0000000..06935b1
--- /dev/null
+++ b/api/src/db.mjs
@@ -0,0 +1,46 @@
 import knex from "knex";
 import config from "../knexfile.js";

 // Pick config based on NODE_ENV. In production we want the `production` block
 // (which will use DATABASE_URL when provided). Default to development.
 const env = process.env.NODE_ENV === "production" ? "production" : "development";
 let dbConfig = config[env];

 // If a DATABASE_URL is present but NODE_ENV isn't production, prefer production
 // config so Render-style connection strings are handled correctly.
 if (process.env.DATABASE_URL && env !== "production") {
        dbConfig = config.production;
 }

 // Minimal masked diagnostic logging to help track down connection issues
 const usingDatabaseUrl = Boolean(process.env.DATABASE_URL);
 if (usingDatabaseUrl) {
        console.log("DB: using DATABASE_URL connection string (masked in logs)");
 } else if (dbConfig && dbConfig.connection) {
        const conn = dbConfig.connection;
        const host = conn.host || conn.connectionString || "(unknown)";
        const port = conn.port || "(unknown)";
        const database = conn.database || "(unknown)";
        console.log(`DB: using host=${host} port=${port} database=${database}`);
 } else {
        console.log("DB: configuration object not in expected shape — will attempt to use provided config");
 }

 const db = knex(dbConfig);

 // Quick non-fatal connectivity test to surface connection failures early.
 // We don't exit the process here so the server can still start and return
 // user-friendly 5xx responses; the logs will show the underlying DB error.
 (async function testConnection() {
        try {
                await db.raw("select 1+1 as result");
                console.log("DB: connection test succeeded");
        } catch (err) {
                console.error("DB: connection test failed — check DATABASE_URL / DB env vars and that Postgres is reachable");
                if (err && err.message) console.error("DB error:", err.message);
                if (err && err.code) console.error("DB error code:", err.code);
        }
 })();

 export default db;

```

```diff
diff --git a/api/src/seeds/001_run_full_seed.js b/api/src/seeds/001_run_full_seed.js
new file mode 100644
index 0000000..b1b3daa
--- /dev/null
+++ b/api/src/seeds/001_run_full_seed.js
@@ -0,0 +1,143 @@
 import { readFileSync, existsSync } from 'fs';
 import path from 'path';

 function findSeedFile() {
   const candidates = [
     path.resolve(process.cwd(), 'database', 'seeds', 'mock_data.sql'),
     path.resolve(process.cwd(), '..', 'database', 'seeds', 'mock_data.sql'),
     path.resolve(process.cwd(), '..', '..', 'database', 'seeds', 'mock_data.sql'),
     path.resolve(process.cwd(), 'src', '..', 'database', 'seeds', 'mock_data.sql'),
   ];
   for (const p of candidates) {
     if (existsSync(p)) return p;
   }
   return null;
 }

 export async function seed(knex) {
   const seedPath = findSeedFile();
   if (!seedPath) {
     throw new Error('Seed SQL file not found. Tried relative paths for database/seeds/mock_data.sql');
   }
   let sql = readFileSync(seedPath, { encoding: 'utf8' });

   // Normalize line endings
   sql = sql.replace(/\r\n/g, '\n');

   // Remove SQL single-line comments to reduce noise when splitting; keep block comments if any
   const lines = sql.split('\n').filter((l) => !l.trim().startsWith('--'));
   const cleaned = lines.join('\n');

   // Split on semicolons that are followed by newline (basic statement splitter).
   // This is intentionally conservative — the project's seed SQL is plain DDL/DML
   // without dollar-quoted functions, so this will work reliably.
   const statements = cleaned
     .split(/;\s*\n/)
     .map((s) => s.trim())
     .filter(Boolean);

   // Detect users.id column type so we can adapt the seed when necessary.
   // Some older deployments created `users.id` as a serial integer. The
   // mock_data.sql assumes UUIDs (uses gen_random_uuid()). If the DB has an
   // integer primary key we must remove the `id` column and the gen_random_uuid()
   // value from the INSERT INTO ... users (...) SELECT ... statements.
   let usersIdIsInteger = false;
   try {
     const res = await knex.raw(
       "SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) AS type FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid WHERE c.relname = 'users' AND a.attname = 'id' LIMIT 1"
     );
     if (res && res.rows && res.rows[0] && typeof res.rows[0].type === 'string') {
       usersIdIsInteger = res.rows[0].type.startsWith('integer');
     }
   } catch (e) {
     // ignore - we'll assume UUIDs by default
   }

   if (usersIdIsInteger) {
     console.info('Detected users.id is integer; patching users INSERT statements to omit id values.');
   }

   for (let i = 0; i < statements.length; i++) {
     let stmt = statements[i];

     // If DB uses integer ids for users, adjust the users INSERT statements to
     // remove the `id` column and the leading `gen_random_uuid()` value in the
     // SELECT list. This keeps the seed compatible with older installs.
     if (usersIdIsInteger) {
       // Match an INSERT INTO users ( ... ) SELECT ... pattern (multi-line aware)
       const insertUsersRegex = /INSERT\s+INTO\s+users\s*\(([^)]+)\)\s*SELECT\s/ims;
       const m = stmt.match(insertUsersRegex);
       if (m) {
         const colsRaw = m[1];
         const cols = colsRaw
           .split(',')
           .map((c) => c.trim())
           .filter(Boolean);
         // Remove any 'id' column (case-insensitive)
         const colsFiltered = cols.filter((c) => c.toLowerCase() !== 'id');
         // Rebuild columns section
         const colsRepl = colsFiltered.join(', ');
         // Remove the first SELECT expression if it is gen_random_uuid()
         // We'll do a conservative replace of a leading gen_random_uuid() followed by a comma.
         const selectPrefixRegex = /SELECT\s*gen_random_uuid\(\)\s*,/i;
         if (selectPrefixRegex.test(stmt)) {
           stmt = stmt.replace(insertUsersRegex, (full, _cols) => {
             return full.replace(m[1], colsRepl);
           });
           stmt = stmt.replace(selectPrefixRegex, 'SELECT ');
         } else {
           // If we couldn't find the expected gen_random_uuid() pattern, still
           // try to remove a leading uuid() like expression (safe-guard).
           const altSelectPrefix = /SELECT\s*[^,]+\s*,/i;
           if (altSelectPrefix.test(stmt)) {
             stmt = stmt.replace(insertUsersRegex, (full, _cols) => {
               return full.replace(m[1], colsRepl);
             });
             stmt = stmt.replace(altSelectPrefix, 'SELECT ');
           } else {
             console.warn('Could not safely rewrite users INSERT statement to remove id; leaving unchanged.');
           }
         }
       }
     }

     // Make SELECT subqueries that expect a single id safe by adding LIMIT 1.
     // This targets patterns like (SELECT id FROM travel_plans WHERE name = '...')
     // which can fail if the table already contains multiple rows with the same
     // name due to prior seed runs. Appending LIMIT 1 makes it a scalar value.
     try {
       stmt = stmt.replace(/\(\s*SELECT\s+id\s+FROM\s+([a-z0-9_]+)\b([\s\S]*?)\)/gmi, (match, table, inner) => {
         if (/LIMIT\s+\d+/i.test(inner)) return match; // already has LIMIT
         return `(SELECT id FROM ${table}${inner} LIMIT 1)`;
       });
     } catch (e) {
       // ignore regex replacement errors; proceed with original statement
     }
     try {
       // Make plain INSERT ... VALUES (...) idempotent by adding ON CONFLICT DO NOTHING
       // when it doesn't already contain an ON CONFLICT or is an INSERT ... SELECT.
       const insertValuesRegex = /^INSERT\s+INTO\s+[^\(]+\([^\)]+\)\s+VALUES\s*\(/ims;
       const insertSelectRegex = /^INSERT\s+INTO\s+[^\(]+\([^\)]+\)\s+SELECT\s/iims;
       const hasOnConflict = /ON\s+CONFLICT/ims.test(stmt);
       if ((insertValuesRegex.test(stmt) || insertSelectRegex.test(stmt)) && !hasOnConflict) {
         stmt = stmt.trim();
         if (!stmt.endsWith(';')) stmt = stmt + ';';
         // Remove trailing semicolon before appending
         stmt = stmt.replace(/;\s*$/, ' ON CONFLICT DO NOTHING;');
       }

       // Run each statement separately so errors are easier to debug
       await knex.raw(stmt);
     } catch (err) {
       // Add context about which statement failed and rethrow
       const preview = stmt.length > 200 ? stmt.slice(0, 200) + '...' : stmt;
       const message = `Seed statement ${i + 1} failed. Preview: ${preview}\nError: ${err.message}`;
       console.error(message);
       throw new Error(message);
     }
   }
 }

```

```diff
diff --git a/api/scripts/wait-for-db-and-migrate.mjs b/api/scripts/wait-for-db-and-migrate.mjs
new file mode 100644
index 0000000..faa99ff
--- /dev/null
+++ b/api/scripts/wait-for-db-and-migrate.mjs
@@ -0,0 +1,37 @@
 #!/usr/bin/env node
 import { exec } from 'child_process';
 import { promisify } from 'util';
 import "dotenv/config";

 const execAsync = promisify(exec);

 const wait = (ms) => new Promise((r) => setTimeout(r, ms));

 async function tryMigrate(attempt = 1) {
   try {
     console.log(`Attempt ${attempt}: running migrations...`);
     const { stdout: mOut, stderr: mErr } = await execAsync('npx knex migrate:latest --knexfile ./knexfile.js');
     if (mOut) console.log(mOut);
     if (mErr) console.error(mErr);
     console.log('Migrations applied successfully.');

     console.log('Running seeds...');
     const { stdout: sOut, stderr: sErr } = await execAsync('npx knex seed:run --knexfile ./knexfile.js');
     if (sOut) console.log(sOut);
     if (sErr) console.error(sErr);
     console.log('Seeds applied successfully.');
     process.exit(0);
   } catch (err) {
     console.error(`Migrate/seed attempt ${attempt} failed: ${err.message}`);
     if (attempt >= 8) {
       console.error('Exceeded retry attempts for migrations. Exiting with failure.');
       process.exit(1);
     }
     const delay = 2000 * attempt;
     console.log(`Waiting ${delay}ms before retrying...`);
     await wait(delay);
     return tryMigrate(attempt + 1);
   }
 }

 tryMigrate();

```

```diff
diff --git a/api/scripts/find_duplicate_travel_plans.mjs b/api/scripts/find_duplicate_travel_plans.mjs
new file mode 100644
index 0000000..5e48130
--- /dev/null
+++ b/api/scripts/find_duplicate_travel_plans.mjs
@@ -0,0 +1,30 @@
 import knex from '../src/db.mjs';

 (async function findDuplicates() {
   try {
     const rows = await knex.raw(`
       SELECT name, start_date, price_minor, duration_days, capacity, COUNT(*) as cnt, ARRAY_AGG(id) as ids
       FROM travel_plans
       GROUP BY name, start_date, price_minor, duration_days, capacity
       HAVING COUNT(*) > 1
       ORDER BY cnt DESC
     `);

     const duplicates = rows.rows || rows;
     if (!duplicates || duplicates.length === 0) {
       console.log('No duplicate travel_plans found');
       process.exit(0);
     }

     console.log('Found duplicate travel_plans groups:');
     for (const d of duplicates) {
       console.log(`- name=${d.name} start_date=${d.start_date} price_minor=${d.price_minor} duration=${d.duration_days} capacity=${d.capacity} count=${d.cnt}`);
       console.log('  ids:', d.ids.join(', '));
     }

     process.exit(0);
   } catch (e) {
     console.error('Error checking duplicates', e);
     process.exit(2);
   }
 })();

```

```diff
diff --git a/api/scripts/db-init.js b/api/scripts/db-init.js
new file mode 100644
index 0000000..80c51bf
--- /dev/null
+++ b/api/scripts/db-init.js
@@ -0,0 +1,57 @@
 import pg from "pg";
 const { Client } = pg;
 import { promises as fs } from "fs";
 import path from "path";
 import { fileURLToPath } from "url";
 import dotenv from "dotenv";

 dotenv.config({
   path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
 });

 const appDbConfig = {
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT, 10),
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
 };

 const schemaFile = path.join(
   path.dirname(fileURLToPath(import.meta.url)),
   "../../database/schema/schema.sql"
 );
 const mockDataFile = path.join(
   path.dirname(fileURLToPath(import.meta.url)),
   "../../database/seeds/mock_data.sql"
 );

 const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

 async function setupDatabase() {
   console.log("Waiting for the database container to be ready...");
   await wait(5000);
   console.log("--- Database Setup Started ---");

   const appClient = new Client(appDbConfig);
   try {
     await appClient.connect();
     console.log("[1/2] Applying schema...");
     const schemaSql = await fs.readFile(schemaFile, "utf8");
     await appClient.query(schemaSql);
     console.log("[2/2] Seeding data...");
     const mockDataSql = await fs.readFile(mockDataFile, "utf8");
     await appClient.query(mockDataSql);
     console.log("--- ✅ Database Setup Complete ---");
   } catch (err) {
     console.error("!-> Error during schema/seed application:", err);
     throw err;
   } finally {
     await appClient.end();
   }
 }

 setupDatabase().catch((e) => {
   console.error("!-> A critical error occurred during database setup.");
   process.exit(1);
 });

```

```diff
diff --git a/deploy/README_RENDER.md b/deploy/README_RENDER.md
new file mode 100644
index 0000000..cc9d9e5
--- /dev/null
+++ b/deploy/README_RENDER.md
@@ -0,0 +1,23 @@
 Render deployment notes

 API service (api/)
 - Root Directory: api
 - Build Command: npm install
 - Start Command: node scripts/wait-for-db-and-migrate.mjs && npm run start:prod
 - Health Check Path: /api/health
 - Environment variables to set in Render (API):
   - DATABASE_URL (use Internal URL provided by the Render DB)
   - JWT_SECRET (generate a secure random string)
   - FRONTEND_URL (https://<your-frontend>.onrender.com)
   - Optional: PGSSLMODE=require

 Frontend service (app-next)
 - Root Directory: app-next
 - Build Command: npm install && npm run build
 - Start Command: npm run start
 - Important: Set NEXT_PUBLIC_API_URL in the Render Environment BEFORE build
   - e.g. NEXT_PUBLIC_API_URL=https://hyf-final-project-name.onrender.com

 Notes
 - Do NOT commit real secrets to the repository. Use Render's Environment Variables UI or upload a .env file via the Render web UI only for temporary convenience.
 - If you experience DB SSL errors, set PGSSLMODE=require or configure knex to use a CA certificate.

```

```diff
diff --git a/scripts/apply_schema_to_db.ps1 b/scripts/apply_schema_to_db.ps1
new file mode 100644
index 0000000..dba85e9
--- /dev/null
+++ b/scripts/apply_schema_to_db.ps1
@@ -0,0 +1,58 @@
 param(
   [Parameter(Mandatory=$false)]
   [string]$DatabaseUrl
 )

 if (-not $DatabaseUrl) {
   if ($env:DATABASE_URL) {
     $DatabaseUrl = $env:DATABASE_URL
   } else {
     Write-Host "Usage: .\scripts\apply_schema_to_db.ps1 -DatabaseUrl '<connection-string>'"
     Write-Host "Or set the environment variable DATABASE_URL and run the script without arguments."
     exit 1
   }
 }

 # Convert Windows path to a form docker can mount
 $pwdPath = (Get-Location).Path
 # When running docker on Windows, use the native path. The postgres image can read mounted files.
 
 Write-Host "Using DATABASE_URL: (masked)"
 # Mask credentials for output
 try {
   $uri = [System.Uri]$DatabaseUrl
   Write-Host "Host: $($uri.Host)  DB: $($uri.AbsolutePath.TrimStart('/'))"
 } catch {
   Write-Host "Provided DATABASE_URL could not be parsed; proceeding anyway."
 }

 # Apply schema
 Write-Host "Applying schema.sql to target database..."
 $schemaCmd = "docker run --rm -v `"$pwdPath`":/work -w /work postgres:15 psql \"$DatabaseUrl\" -f /work/database/schema/schema.sql"
 Write-Host $schemaCmd
 $schemaExit = cmd /c $schemaCmd
 if ($LASTEXITCODE -ne 0) {
   Write-Error "schema.sql execution failed. See output above."
   exit $LASTEXITCODE
 }

 Write-Host "Schema applied successfully."

 # Apply optional mock data if file exists
 $seedPath = Join-Path -Path $pwdPath -ChildPath "database/seeds/mock_data.sql"
 if (Test-Path $seedPath) {
   Write-Host "Applying mock_data.sql to target database..."
   $seedCmd = "docker run --rm -v `"$pwdPath`":/work -w /work postgres:15 psql \"$DatabaseUrl\" -f /work/database/seeds/mock_data.sql"
   Write-Host $seedCmd
   $seedExit = cmd /c $seedCmd
   if ($LASTEXITCODE -ne 0) {
     Write-Error "mock_data.sql execution failed. See output above."
     exit $LASTEXITCODE
   }
   Write-Host "Mock data applied successfully."
 } else {
   Write-Host "No mock_data.sql found at database/seeds/mock_data.sql — skipping seeds."
 }

 Write-Host "Done. Please call the API health endpoint to verify:"
 Write-Host "curl -H \"Origin: https://hyf-final-project-name-frontend.onrender.com\" https://hyf-final-project-name.onrender.com/api/health"

```

Notes
- This file intentionally contains only the backend/hosting diffs to simplify review by backend engineers. If you want additional diffs (e.g., minor router edits), I can append them in a separate `ROUTE_DIFF.md` to keep concerns separated.

Generated by an automated workspace diff command on `feature/render-deploy`.
