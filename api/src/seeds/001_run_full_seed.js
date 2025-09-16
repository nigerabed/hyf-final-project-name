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
  const sql = readFileSync(seedPath, { encoding: 'utf8' });
  // Execute the seed SQL in one call. Some seed files include multiple
  // statements and temporary tables, so we rely on knex.raw to execute them.
  await knex.raw(sql);
}
