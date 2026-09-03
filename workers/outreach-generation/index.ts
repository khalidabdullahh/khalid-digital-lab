import {
  LeadsRepository,
  ResearchRepository,
  AIAnalysisRepository,
  OutreachRepository,
  EventsRepository,
} from '@growth/database';
import { PersonalizationService, OutreachWriterService } from '@growth/gemini';
import { LeadStatus, OutreachStatus, EventType } from '@growth/shared';
import { createCorrelationLogger } from '@growth/logging';

export async function runOutreachGeneration(limit = 10) {
  const correlationId = `outreach_gen_${Date.now()}`;
  const log = createCorrelationLogger({ correlationId, workerName: 'outreach-generation' });

  log.info({ limit }, 'Starting Outreach Generation Worker');

  const leadsRepo = new LeadsRepository();
  const researchRepo = new ResearchRepository();
  const aiAnalysisRepo = new AIAnalysisRepository();
  const outreachRepo = new OutreachRepository();
  const eventsRepo = new EventsRepository();

  const personalizationService = new PersonalizationService();
  const outreachWriterService = new OutreachWriterService();

  // Find leads in QUALIFIED status
  const { leads } = await leadsRepo.list({
    status: LeadStatus.QUALIFIED,
    limit,
  });

  log.info({ found: leads.length }, 'Found qualified leads ready for outreach generation');

  let generatedCount = 0;

  for (const lead of leads) {
    const leadLog = log.child({ leadId: lead.id, email: lead.email });
    leadLog.info('Generating personalized cold email draft');

    try {
      const research = await researchRepo.findByLeadId(lead.id);
      const aiAnalysis = await aiAnalysisRepo.findByLeadId(lead.id);

      if (!research || !aiAnalysis) {
        leadLog.warn('Missing research or AI analysis record, skipping outreach generation');
        continue;
      }

      const primaryFact =
        research.professional_evidence.find((e) => e.evidence_type === 'verified_fact')?.detail ||
        research.professional_focus;

      const primaryPain = aiAnalysis.pain_points[0] || 'Systematic strategy validation and regime shifts';

      // 1. Generate Contextual Hook
      const { data: personalHook } = await personalizationService.generatePersonalization({
        fullName: lead.full_name,
        jobTitle: lead.job_title,
        company: lead.company,
        professionalFocus: research.professional_focus,
        evidenceSnippet: primaryFact,
        painPoint: primaryPain,
      });

      // 2. Draft Cold Email
      const { data: emailDraft, promptVersion } = await outreachWriterService.generateEmailDraft({
        firstName: lead.first_name,
        fullName: lead.full_name,
        jobTitle: lead.job_title,
        company: lead.company,
        icebreakerHook: personalHook.icebreaker_hook,
        painCategory: primaryPain,
        relevanceAngle: personalHook.relevance_angle,
      });

      // 3. Persist Outreach Draft (Status: PENDING_APPROVAL)
      const outreachRecord = await outreachRepo.create({
        lead_id: lead.id,
        campaign_id: lead.campaign_id,
        subject: emailDraft.subject,
        body_html: emailDraft.body_html,
        body_text: emailDraft.body_text,
        personalization_snippet: personalHook.icebreaker_hook,
        prompt_version: promptVersion,
        status: OutreachStatus.PENDING_APPROVAL,
      });

      // 4. Update Lead Status
      await leadsRepo.updateStatus(lead.id, LeadStatus.OUTREACH_GENERATED);

      // 5. Audit Logging
      await eventsRepo.log({
        lead_id: lead.id,
        event_type: EventType.OUTREACH_GENERATED,
        metadata: {
          outreach_id: outreachRecord.id,
          subject: emailDraft.subject,
          word_count: emailDraft.word_count,
        },
        actor: 'worker:outreach-generation',
      });

      generatedCount++;
      leadLog.info({ outreachId: outreachRecord.id }, 'Outreach draft created, queued for human review');
    } catch (err) {
      leadLog.error({ error: err }, 'Failed to generate outreach email draft');
    }
  }

  log.info({ generated: generatedCount }, 'Outreach Generation Worker Completed');
  return { generated: generatedCount };
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1])) {
  runOutreachGeneration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
