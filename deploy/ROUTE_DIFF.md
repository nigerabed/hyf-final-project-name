# Router diffs (feature/render-deploy vs origin/develop)

This file contains the git diffs for router-level changes introduced on the `feature/render-deploy` branch. It's separated from `RENDER_DIFF.md` to keep hosting/deployment diffs distinct from API route changes.

Captured from:
`git diff origin/develop..feature/render-deploy -- api/src/routers`

The exact diff output is included below for reviewer consumption.

```diff
diff --git a/api/src/routers/healthCheck.mjs b/api/src/routers/healthCheck.mjs
index 12ddd18..34ffd39 100644
--- a/api/src/routers/healthCheck.mjs
+++ b/api/src/routers/healthCheck.mjs
@@ -23,6 +23,14 @@ router.get("/health", async (req, res) => {
     res.status(200).json(tableSamples);
   } catch (error) {
     console.error("!-> Database health check failed:", error);
+    // If the underlying error is a connection refusal, return 503 with a helpful hint
+    if (error && (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('ECONNREFUSED')))) {
+      return res.status(503).json({
+        error: 'Database unreachable',
+        message: 'Could not connect to Postgres. Check DATABASE_URL/DB_HOST and that the DB is running.'
+      });
+    }
+
     res.status(500).json({
       error: error.message,
     });
diff --git a/api/src/routers/tours.js b/api/src/routers/tours.js
index e6ee69e..b11f9cf 100644
--- a/api/src/routers/tours.js
+++ b/api/src/routers/tours.js
@@ -116,8 +116,16 @@ router.get("/", async (req, res) => {
     // Execute the query
     const tours = await query;
 
+    // Defensive: dedupe server-side by id in case joins or seed issues produced duplicates
+    const dedupedTours = Array.isArray(tours)
+      ? tours.filter((v, i, a) => a.findIndex((t) => String(t?.id) === String(v?.id)) === i)
+      : tours;
+    if (Array.isArray(tours) && dedupedTours.length !== tours.length) {
+      console.warn(`Tours API: removed ${tours.length - dedupedTours.length} duplicate tour rows before responding`);
+    }
+
     // Transform the data to match the expected response format
-    const transformedTours = tours.map((tour) => ({
+    const transformedTours = dedupedTours.map((tour) => ({
       id: tour.id,
       name: tour.name,
       destination: tour.description, // Using description as destination for now
```
