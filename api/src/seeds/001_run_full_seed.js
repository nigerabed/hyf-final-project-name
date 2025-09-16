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

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
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
