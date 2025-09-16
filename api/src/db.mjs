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
		// Print concise error info without leaking credentials
		if (err && err.message) console.error("DB error:", err.message);
		if (err && err.code) console.error("DB error code:", err.code);
	}
})();

export default db;
