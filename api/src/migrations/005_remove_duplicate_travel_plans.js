/*
  Migration 005: remove duplicate travel_plans and add a unique index to prevent re-insertion.
  Strategy:
  - Identify duplicate groups by (name, start_date, price_minor, duration_days, capacity).
  - Keep the row with the smallest id (MIN(id)) and delete the others.
  - Create a unique index on those columns to prevent future duplicate rows.

  Note: this migration is conservative and uses columns that safely identify a tour in this data model.
*/

export async function up(knex) {
  // Delete duplicate rows, keeping the MIN(id) for each group
  await knex.raw(`
    WITH dup AS (
      SELECT
        (ARRAY_AGG(id ORDER BY id))[1] AS keep_id,
        ARRAY_AGG(id) AS ids
      FROM travel_plans
      GROUP BY name, start_date, price_minor, duration_days, capacity
      HAVING COUNT(*) > 1
    )
    DELETE FROM travel_plans
    USING dup
    WHERE travel_plans.id = ANY(dup.ids) AND travel_plans.id <> dup.keep_id;
  `);

  // Create a unique index to prevent future duplicates
  // IF NOT EXISTS is used to be idempotent across DB versions that support it.
  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS travel_plans_unique_idx
    ON travel_plans (name, start_date, price_minor, duration_days, capacity);
  `);
}

export async function down(knex) {
  // Drop the unique index created above
  await knex.raw(`DROP INDEX IF EXISTS travel_plans_unique_idx`);
}
