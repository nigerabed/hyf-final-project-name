import { Router } from "express";
import db from "../db.mjs";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    const tablesResult = await db.raw(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    );

    const tableNames = tablesResult.rows
      .map((row) => row.tablename)
      .filter((name) => !name.startsWith("knex_"));

    const tableSamples = {};

    for (const tableName of tableNames) {
      const sampleData = await db(tableName).select("*").limit(2);
      tableSamples[tableName] = sampleData;
    }

    res.status(200).json(tableSamples);
  } catch (error) {
    console.error("!-> Database health check failed:", error);
    // If the underlying error is a connection refusal, return 503 with a helpful hint
    if (error && (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('ECONNREFUSED')))) {
      return res.status(503).json({
        error: 'Database unreachable',
        message: 'Could not connect to Postgres. Check DATABASE_URL/DB_HOST and that the DB is running.'
      });
    }

    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
