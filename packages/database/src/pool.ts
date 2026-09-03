import pg from 'pg';
import { getEnv } from '@growth/shared';
import { logger } from '@growth/logging';

const { Pool } = pg;

let pool: pg.Pool | null = null;

/**
 * Returns the singleton pg.Pool instance configured for Neon PostgreSQL.
 */
export function getDbPool(): pg.Pool {
  if (pool) {
    return pool;
  }

  const env = getEnv();

  if (!env.DATABASE_URL) {
    if (env.APP_ENV === 'production') {
      logger.fatal('DATABASE_URL is not set in production. System refusing to start.');
      throw new Error('FATAL: DATABASE_URL is required in production mode');
    }
    logger.warn('DATABASE_URL is not set. Running in development without persistent PostgreSQL.');
  }

  // Neon PostgreSQL connection pool configuration
  pool = new Pool({
    connectionString: env.DATABASE_URL || undefined,
    ssl: env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    logger.error({ error: err }, 'Unexpected idle PostgreSQL pool error');
  });

  return pool;
}

/**
 * Executes a parameterized SQL query against Neon PostgreSQL.
 */
export async function dbQuery<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const env = getEnv();

  if (!env.DATABASE_URL) {
    if (env.APP_ENV === 'production') {
      throw new Error('FATAL: DATABASE_URL required for production query');
    }
  }

  const db = getDbPool();
  const start = Date.now();
  try {
    const res = await db.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug({ text: text.slice(0, 100), duration, rows: res.rowCount }, 'Executed PostgreSQL query');
    return res;
  } catch (err) {
    logger.error({ error: err, text, params }, 'PostgreSQL query execution failed');
    throw err;
  }
}

/**
 * Verifies live connection to Neon PostgreSQL
 */
export async function testDbConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
  const env = getEnv();
  if (!env.DATABASE_URL) {
    return { connected: false, error: 'DATABASE_URL not configured' };
  }

  try {
    const res = await dbQuery('SELECT version(), current_database(), current_user;');
    return {
      connected: true,
      version: res.rows[0]?.version,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message,
    };
  }
}

/**
 * Closes the database pool (useful for test teardown)
 */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
