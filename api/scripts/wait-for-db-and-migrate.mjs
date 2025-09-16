#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import "dotenv/config";

const execAsync = promisify(exec);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryMigrate(attempt = 1) {
  try {
    console.log(`Attempt ${attempt}: running migrations...`);
    const { stdout, stderr } = await execAsync('npx knex migrate:latest --knexfile ./knexfile.js');
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('Migrations applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error(`Migrate attempt ${attempt} failed: ${err.message}`);
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
