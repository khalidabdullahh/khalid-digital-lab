import { getEnv } from '@growth/shared';
import { logger } from '@growth/logging';
import { getDbPool, dbQuery, testDbConnection, closeDbPool } from './pool.js';

/**
 * Returns whether memory fallback is permitted.
 * STRICT RULE: Only permitted during isolated unit tests/development when DATABASE_URL is not set.
 * In 'production', this is ALWAYS FALSE.
 */
export function isMemoryFallbackAllowed(): boolean {
  const env = getEnv();
  if (env.APP_ENV === 'production') {
    return false;
  }
  return !env.DATABASE_URL;
}

export { getDbPool, dbQuery, testDbConnection, closeDbPool };
