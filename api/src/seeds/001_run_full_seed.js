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
      stmt = stmt.replace(/\(SELECT\s+id\s+FROM\s+travel_plans\s+WHERE\s+([^)]+)\)/gmi, '(SELECT id FROM travel_plans WHERE $1 LIMIT 1)');
    } catch (e) {
      // ignore regex replacement errors; proceed with original statement
    }
    try {
      // Make plain INSERT ... VALUES (...) idempotent by adding ON CONFLICT DO NOTHING
      // when it doesn't already contain an ON CONFLICT or is an INSERT ... SELECT.
      const insertValuesRegex = /^INSERT\s+INTO\s+[^\(]+\([^\)]+\)\s+VALUES\s*\(/ims;
      const insertSelectRegex = /^INSERT\s+INTO\s+[^\(]+\([^\)]+\)\s+SELECT\s/ims;
      const hasOnConflict = /ON\s+CONFLICT/ims.test(stmt);
      if ((insertValuesRegex.test(stmt) || insertSelectRegex.test(stmt)) && !hasOnConflict) {
        // Append ON CONFLICT DO NOTHING at the end of the statement if missing
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
