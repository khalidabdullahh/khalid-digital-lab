import { LeadsRepository, ResearchRepository, EventsRepository } from '@growth/database';
import { ResearchAgentService } from '@growth/gemini';
import { LeadStatus, EventType } from '@growth/shared';
import { createCorrelationLogger } from '@growth/logging';

export async function runLeadResearch(limit = 10) {
  const correlationId = `research_${Date.now()}`;
  const log = createCorrelationLogger({ correlationId, workerName: 'lead-research' });

  log.info({ limit }, 'Starting Lead Research Worker');

  const leadsRepo = new LeadsRepository();
  const researchRepo = new ResearchRepository();
  const eventsRepo = new EventsRepository();
  const researchAgent = new ResearchAgentService();

  // Find leads in NEW state
  const { leads } = await leadsRepo.list({
    status: LeadStatus.NEW,
    limit,
  });

  log.info({ found: leads.length }, 'Found leads pending research');

  let processedCount = 0;

  for (const lead of leads) {
    const leadLog = log.child({ leadId: lead.id, email: lead.email });
    leadLog.info('Researching prospect profile');

    try {
      await leadsRepo.updateStatus(lead.id, LeadStatus.RESEARCHING);
      await eventsRepo.log({
        lead_id: lead.id,
        event_type: EventType.RESEARCH_STARTED,
        actor: 'worker:lead-research',
      });

      const { data: researchData, promptVersion } = await researchAgent.executeResearch({
        fullName: lead.full_name,
        jobTitle: lead.job_title,
        company: lead.company,
        location: lead.location,
        industry: lead.industry,
        linkedinUrl: lead.linkedin_url,
        companyUrl: lead.company_url,
      });

      await researchRepo.create({
        lead_id: lead.id,
        professional_focus: researchData.professional_focus,
        trading_related: researchData.trading_related,
        quant_related: researchData.quant_related,
        pine_script_related: researchData.pine_script_related,
        systematic_trading_related: researchData.systematic_trading_related,
        company_description: researchData.company_description,
        professional_evidence: researchData.professional_evidence,
        relevant_projects: researchData.relevant_projects,
        relevant_public_activity: researchData.relevant_public_activity,
        potential_pain_points: researchData.potential_pain_points,
        potential_use_cases: researchData.potential_use_cases,
        evidence_sources: researchData.evidence_sources,
        confidence_score: researchData.confidence_score,
        prompt_version: promptVersion,
      });

      await leadsRepo.updateStatus(lead.id, LeadStatus.RESEARCHED);

      await eventsRepo.log({
        lead_id: lead.id,
        event_type: EventType.RESEARCH_COMPLETED,
        metadata: {
          confidence: researchData.confidence_score,
          tradingRelated: researchData.trading_related,
          quantRelated: researchData.quant_related,
          pineScriptRelated: researchData.pine_script_related,
        },
        actor: 'worker:lead-research',
      });

      processedCount++;
      leadLog.info('Research successfully completed and persisted');
    } catch (err) {
      leadLog.error({ error: err }, 'Failed to research lead');
      await leadsRepo.updateStatus(lead.id, LeadStatus.NEW); // Revert for retry
    }
  }

  log.info({ processed: processedCount }, 'Lead Research Worker Completed');
  return { processed: processedCount };
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1])) {
  runLeadResearch()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
