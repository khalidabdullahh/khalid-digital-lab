import pino from 'pino';

// Redact known sensitive field patterns
const REDACT_PATHS = [
  '*.apiKey',
  '*.api_key',
  '*.token',
  '*.secret',
  '*.password',
  '*.authorization',
  '*.serviceRoleKey',
  '*.service_role_key',
  'apiKey',
  'api_key',
  'token',
  'secret',
  'password',
  'authorization',
  'serviceRoleKey',
  'service_role_key',
];

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Creates a contextual child logger with a tracking correlation ID
 */
export function createCorrelationLogger(context: {
  correlationId?: string;
  leadId?: string;
  workerName?: string;
  jobId?: string;
}) {
  return logger.child(context);
}
