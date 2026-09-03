import { FastifyPluginAsync } from 'fastify';
import {
  OutreachRepository,
  LeadsRepository,
  ResearchRepository,
  AIAnalysisRepository,
  EventsRepository,
} from '@growth/database';
import { PersonalizationService, OutreachWriterService } from '@growth/gemini';
import { OutreachStatus, EventType } from '@growth/shared';
import { logger } from '@growth/logging';

export const outreachRoutes: FastifyPluginAsync = async (fastify) => {
  const outreachRepo = new OutreachRepository();
  const leadsRepo = new LeadsRepository();
  const researchRepo = new ResearchRepository();
  const aiAnalysisRepo = new AIAnalysisRepository();
  const eventsRepo = new EventsRepository();
  const personalizationService = new PersonalizationService();
  const outreachWriterService = new OutreachWriterService();

  // List all outreach pending human approval
  fastify.get('/outreach/pending', async (request, reply) => {
    const list = await outreachRepo.listPendingApprovals();
    return reply.send({ pending: list, count: list.length });
  });

  // Approve outreach draft
  fastify.post('/outreach/:id/approve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as { approved_by?: string };

    const approved = await outreachRepo.approve(id, body.approved_by || 'human_operator');

    await eventsRepo.log({
      lead_id: approved.lead_id,
      event_type: EventType.OUTREACH_APPROVED,
      metadata: { outreach_id: id, approved_by: body.approved_by || 'human_operator' },
      actor: 'api:outreach-approval',
    });

    return reply.send({ success: true, outreach: approved });
  });

  // Reject outreach draft
  fastify.post('/outreach/:id/reject', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as { rejection_reason?: string };

    const rejected = await outreachRepo.reject(id, body.rejection_reason || 'Manual rejection by operator');

    await eventsRepo.log({
      lead_id: rejected.lead_id,
      event_type: EventType.OUTREACH_REJECTED,
      metadata: { outreach_id: id, reason: body.rejection_reason },
      actor: 'api:outreach-rejection',
    });

    return reply.send({ success: true, outreach: rejected });
  });

  // Edit outreach subject / body
  fastify.put('/outreach/:id/edit', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { subject: string; body_text: string; body_html?: string };

    if (!body.subject || !body.body_text) {
      return reply.status(400).send({ error: 'Subject and body_text are required' });
    }

    const bodyHtml = body.body_html || body.body_text.replace(/\n/g, '<br/>');
    const updated = await outreachRepo.updateContent(id, body.subject, body.body_text, bodyHtml);

    return reply.send({ success: true, outreach: updated });
  });

  // Regenerate outreach draft with Gemini
  fastify.post('/outreach/:id/regenerate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await outreachRepo.findById(id);

    if (!existing) {
      return reply.status(404).send({ error: 'Outreach record not found' });
    }

    const lead = await leadsRepo.findById(existing.lead_id);
    const research = await researchRepo.findByLeadId(existing.lead_id);
    const aiAnalysis = await aiAnalysisRepo.findByLeadId(existing.lead_id);

    if (!lead || !research || !aiAnalysis) {
      return reply.status(400).send({ error: 'Lead context is incomplete' });
    }

    const primaryFact =
      research.professional_evidence.find((e) => e.evidence_type === 'verified_fact')?.detail ||
      research.professional_focus;
    const primaryPain = aiAnalysis.pain_points[0] || 'Systematic strategy validation';

    const { data: personalHook } = await personalizationService.generatePersonalization({
      fullName: lead.full_name,
      jobTitle: lead.job_title,
      company: lead.company,
      professionalFocus: research.professional_focus,
      evidenceSnippet: primaryFact,
      painPoint: primaryPain,
    });

    const { data: emailDraft } = await outreachWriterService.generateEmailDraft({
      firstName: lead.first_name,
      fullName: lead.full_name,
      jobTitle: lead.job_title,
      company: lead.company,
      icebreakerHook: personalHook.icebreaker_hook,
      painCategory: primaryPain,
      relevanceAngle: personalHook.relevance_angle,
    });

    const updated = await outreachRepo.updateContent(
      id,
      emailDraft.subject,
      emailDraft.body_text,
      emailDraft.body_html
    );

    return reply.send({ success: true, outreach: updated });
  });
};
