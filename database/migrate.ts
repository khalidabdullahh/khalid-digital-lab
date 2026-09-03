import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbQuery, testDbConnection, closeDbPool } from '@growth/database';
import { getEnv } from '@growth/shared';
import { logger } from '@growth/logging';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  const env = getEnv();
  logger.info({ env: env.APP_ENV }, 'Starting Neon PostgreSQL Schema Migration');

  if (!env.DATABASE_URL) {
    if (env.APP_ENV === 'production') {
      logger.fatal('Cannot run migrations: DATABASE_URL is not set in production');
      throw new Error('DATABASE_URL is required for migrations');
    }
    logger.warn('DATABASE_URL is empty. Migration skipped in local mode.');
    return { success: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  // 1. Test connection
  const conn = await testDbConnection();
  if (!conn.connected) {
    logger.error({ error: conn.error }, 'Failed to connect to Neon PostgreSQL for migrations');
    throw new Error(`Neon connection failed: ${conn.error}`);
  }

  logger.info({ version: conn.version }, 'Connected to Neon PostgreSQL successfully');

  // 2. Read migration file
  const migrationPath = path.resolve(__dirname, './migrations/001_initial_schema.sql');
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found at: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  logger.info('Applying migration: 001_initial_schema.sql');

  // 3. Execute migration DDL
  try {
    await dbQuery(sql);
    logger.info('✅ Migration 001_initial_schema.sql executed successfully!');

    // 4. Verify tables exist
    const tableCheck = await dbQuery<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tableCheck.rows.map((r) => r.table_name);
    logger.info({ tables: tableNames }, 'Verified public schema tables in Neon');

    return {
      success: true,
      tables: tableNames,
    };
  } catch (err) {
    logger.error({ error: err }, '❌ Migration execution failed');
    throw err;
  }
}

// Allow direct execution from CLI: npm run db:migrate
if (import.meta.url.endsWith(process.argv[1])) {
  runMigrations()
    .then(async () => {
      await closeDbPool();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error({ error: err }, 'Migration runner failed');
      await closeDbPool();
      process.exit(1);
    });
}
