import { readFileSync } from 'fs';
import path from 'path';

export async function seed(knex) {
  const seedPath = path.resolve(process.cwd(), 'database', 'seeds', 'mock_data.sql');
  const sql = readFileSync(seedPath, { encoding: 'utf8' });
  // Run the seed SQL as a single raw command. Some seed files include multiple
  // statements and temporary tables, so we rely on knex.raw to execute them.
  await knex.raw(sql);
}
