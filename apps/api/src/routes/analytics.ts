import { FastifyPluginAsync } from 'fastify';
import { calculateFunnelMetrics } from '@growth/workers/analytics/index.js';

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get Funnel KPIs and metrics
  fastify.get('/analytics/funnel', async (request, reply) => {
    const metrics = await calculateFunnelMetrics();
    return reply.send({ metrics });
  });
};
