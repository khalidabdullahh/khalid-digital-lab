import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env / .env.local
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const defaultAppEnv = (process.env.APP_ENV as any) || (process.env.NODE_ENV === 'test' ? 'test' : 'development');

const EnvSchema = z
  .object({
    APP_ENV: z.enum(['development', 'production', 'test']).default(defaultAppEnv),
    PORT: z.coerce.number().default(4000),
    HOST: z.string().default('0.0.0.0'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    TRADING_OS_APP_URL: z.string().url().default('https://trading-os-blue.vercel.app'),

    // Neon PostgreSQL Database Connection
    DATABASE_URL: z.string().optional().default(''),

    // Google Gemini API (AI Intelligence Layer)
    GEMINI_API_KEY: z.string().optional().default(''),
    GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

    // Apollo API (Lead Discovery)
    APOLLO_API_KEY: z.string().optional().default(''),
    APOLLO_BASE_URL: z.string().url().default('https://api.apollo.io/v1'),

    // Instantly API & Webhooks
    INSTANTLY_API_KEY: z.string().optional().default(''),
    INSTANTLY_BASE_URL: z.string().url().default('https://api.instantly.ai/api/v2'),
    INSTANTLY_WEBHOOK_SECRET: z.string().optional().default(''),

    // Explicit Mock Controls
    MOCK_APOLLO: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    MOCK_GEMINI: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    MOCK_INSTANTLY: z
      .string()
      .transform((val) => val !== 'false')
      .default('true'),

    // Private Dashboard Access Key
    AUTH_TOKEN: z.string().optional().default(''),
  })
  .refine(
    (data) => {
      // Production must have DATABASE_URL
      if (data.APP_ENV === 'production') {
        return !!data.DATABASE_URL && data.DATABASE_URL.length > 10;
      }
      return true;
    },
    {
      message: 'FATAL: DATABASE_URL is strictly required in production mode. Refusing to run.',
      path: ['DATABASE_URL'],
    }
  );

export type EnvConfig = z.infer<typeof EnvSchema>;

let parsedEnv: EnvConfig | null = null;

/**
 * Validates and returns the loaded environment configuration.
 */
export function getEnv(): EnvConfig {
  if (parsedEnv) {
    return parsedEnv;
  }

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment validation error:', JSON.stringify(result.error.format(), null, 2));
    throw new Error(`Environment validation failed: ${JSON.stringify(result.error.issues)}`);
  }

  parsedEnv = result.data;
  return parsedEnv;
}

/**
 * Resets cached env (useful for unit testing dynamic env swaps)
 */
export function resetEnvCache(): void {
  parsedEnv = null;
}
