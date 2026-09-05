import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEnv } from '@growth/shared';
import { logger } from '@growth/logging';
import { testDbConnection } from '@growth/database';
import { leadsRoutes } from './routes/leads.js';
import { outreachRoutes } from './routes/outreach.js';
import { repliesRoutes } from './routes/replies.js';
import { analyticsRoutes } from './routes/analytics.js';
import { webhooksRoutes } from './routes/webhooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildServer() {
  const env = getEnv();

  const fastify = Fastify({
    logger: false, // Use our structured Pino instance
  });

  await fastify.register(cors, {
    origin: true,
  });

  // Serve Dashboard Static Files
  const projectRootDir = path.resolve(__dirname, '../../../');

  await fastify.register(fastifyStatic, {
    root: projectRootDir,
    prefix: '/',
  });

  // Direct script serving routes to prevent any 404
  fastify.get('/app.js', async (request, reply) => {
    return reply.sendFile('apps/dashboard/app.js');
  });

  fastify.get('/dashboard/app.js', async (request, reply) => {
    return reply.sendFile('apps/dashboard/app.js');
  });

  // Redirect root and /dashboard to dashboard UI
  fastify.get('/dashboard', async (request, reply) => {
    return reply.sendFile('apps/dashboard/index.html');
  });

  // Lightweight in-memory rate limiter for API endpoints
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  fastify.addHook('onRequest', async (request, reply) => {
    if (!request.url.startsWith('/api')) return;

    const ip = request.ip || '127.0.0.1';
    const now = Date.now();
    const isHeavy = request.url.includes('/pipeline/run') || request.url.includes('/leads/create');
    const maxRequests = isHeavy ? 20 : 180;
    const windowMs = 60 * 1000;

    const key = `${ip}:${isHeavy ? 'heavy' : 'general'}`;
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      record.count++;
      if (record.count > maxRequests) {
        logger.warn({ ip, url: request.url }, 'Rate limit exceeded for client');
        return reply.status(429).send({ error: 'Too Many Requests: Rate limit exceeded. Please wait.' });
      }
    }
  });

  // Private Auth Token verification hook if AUTH_TOKEN is configured
  if (env.AUTH_TOKEN) {
    fastify.addHook('onRequest', async (request, reply) => {
      // Exclude static assets, public health and webhook endpoints
      if (
        request.url === '/health' ||
        request.url.startsWith('/api/v1/webhooks') ||
        request.url.startsWith('/apps/dashboard') ||
        request.url === '/dashboard' ||
        request.url === '/app.js' ||
        request.url === '/dashboard/app.js' ||
        request.url.endsWith('.css') ||
        request.url.endsWith('.js') ||
        request.url.endsWith('.html') ||
        request.url.endsWith('.png') ||
        request.url.endsWith('.svg')
      ) {
        return;
      }

      const clientToken = request.headers['x-auth-token'] || (request.query as any)?.token;
      if (clientToken !== env.AUTH_TOKEN) {
        return reply.status(401).send({ error: 'Unauthorized: Invalid or missing private access token' });
      }
    });
  }

  // System Healthcheck endpoint
  fastify.get('/health', async () => {
    const dbStatus = await testDbConnection();
    return {
      status: dbStatus.connected ? 'healthy' : 'degraded',
      service: 'trading-os-growth-engine',
      env: env.APP_ENV,
      database: dbStatus,
      timestamp: new Date().toISOString(),
      tradingOsAppUrl: env.TRADING_OS_APP_URL,
    };
  });

  // Register API routes
  await fastify.register(leadsRoutes, { prefix: '/api' });
  await fastify.register(outreachRoutes, { prefix: '/api' });
  await fastify.register(repliesRoutes, { prefix: '/api' });
  await fastify.register(analyticsRoutes, { prefix: '/api' });
  await fastify.register(webhooksRoutes, { prefix: '/api/v1' });

  return fastify;
}

export async function startServer() {
  const env = getEnv();
  const server = await buildServer();

  try {
    const address = await server.listen({
      port: env.PORT,
      host: env.HOST,
    });
    logger.info({ address, port: env.PORT, env: env.APP_ENV }, '🚀 Trading OS Business Automation API Server is running');
    logger.info(`📱 Dashboard is accessible at: http://localhost:${env.PORT}/dashboard`);
    logger.info(`📱 Full Path: http://localhost:${env.PORT}/apps/dashboard/index.html`);
  } catch (err) {
    logger.error({ error: err }, 'Failed to start API server');
    process.exit(1);
  }
}

// Auto-start when executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  startServer();
}
