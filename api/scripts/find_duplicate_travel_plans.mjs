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
