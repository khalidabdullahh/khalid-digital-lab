import { FastifyPluginAsync } from 'fastify';
import { LeadsRepository, ResearchRepository, AIAnalysisRepository, OutreachRepository } from '@growth/database';
import { LeadStatus, QualificationStatus } from '@growth/shared';

export const leadsRoutes: FastifyPluginAsync = async (fastify) => {
  const leadsRepo = new LeadsRepository();
  const researchRepo = new ResearchRepository();
  const aiAnalysisRepo = new AIAnalysisRepository();
  const outreachRepo = new OutreachRepository();

  // List leads with filters
  fastify.get('/leads', async (request, reply) => {
    const query = request.query as {
      status?: LeadStatus;
      qualification_status?: QualificationStatus;
      limit?: string;
      offset?: string;
    };

    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    const result = await leadsRepo.list({
      status: query.status,
      qualification_status: query.qualification_status,
      limit,
      offset,
    });

    return reply.send(result);
  });

  // Get lead detail by ID with complete research, analysis, and outreach history
  fastify.get('/leads/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const lead = await leadsRepo.findById(id);

    if (!lead) {
      return reply.status(404).send({ error: 'Lead not found' });
    }

    const research = await researchRepo.findByLeadId(id);
    const aiAnalysis = await aiAnalysisRepo.findByLeadId(id);
    const outreachHistory = await outreachRepo.findByLeadId(id);

    return reply.send({
      lead,
      research,
      aiAnalysis,
      outreachHistory,
    });
  });
};
