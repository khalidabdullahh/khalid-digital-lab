import { FastifyPluginAsync } from 'fastify';
import { RepliesRepository } from '@growth/database';

export const repliesRoutes: FastifyPluginAsync = async (fastify) => {
  const repliesRepo = new RepliesRepository();

  // List actionable replies
  fastify.get('/replies/actionable', async (request, reply) => {
    const actionable = await repliesRepo.listActionable();
    return reply.send({ replies: actionable, count: actionable.length });
  });

  // Mark reply resolved
  fastify.post('/replies/:id/resolve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const resolved = await repliesRepo.markResolved(id);
    return reply.send({ success: true, reply: resolved });
  });
};
