import {
  LeadsRepository,
  ResearchRepository,
  AIAnalysisRepository,
  EventsRepository,
} from '@growth/database';
import { LeadAnalyzerService, PainPointDetectorService } from '@growth/gemini';
import { CompositeScorer } from '@growth/scoring';
import { LeadStatus, QualificationStatus, EventType } from '@growth/shared';
import { createCorrelationLogger } from '@growth/logging';

export async function runLeadScoring(limit = 10) {
  const correlationId = `scoring_${Date.now()}`;
  const log = createCorrelationLogger({ correlationId, workerName: 'lead-scoring' });

  log.info({ limit }, 'Starting Lead Scoring & Qualification Worker');

  const leadsRepo = new LeadsRepository();
  const researchRepo = new ResearchRepository();
  const aiAnalysisRepo = new AIAnalysisRepository();
  const eventsRepo = new EventsRepository();
  const leadAnalyzer = new LeadAnalyzerService();
  const painPointDetector = new PainPointDetectorService();

  // Find leads in RESEARCHED state
  const { leads } = await leadsRepo.list({
    status: LeadStatus.RESEARCHED,
    limit,
  });

  log.info({ found: leads.length }, 'Found leads pending scoring');

  let scoredCount = 0;

  for (const lead of leads) {
    const leadLog = log.child({ leadId: lead.id, email: lead.email });
    leadLog.info('Scoring lead profile');

    try {
      await leadsRepo.updateStatus(lead.id, LeadStatus.SCORING);

      const research = await researchRepo.findByLeadId(lead.id);
      if (!research) {
        leadLog.warn('No research found for lead, reverting to NEW');
        await leadsRepo.updateStatus(lead.id, LeadStatus.NEW);
        continue;
      }

      // 1. Detect pain points via Gemini
      const { data: painData } = await painPointDetector.detectPainPoints({
        professionalFocus: research.professional_focus,
        relevantProjects: research.relevant_projects,
        tradingRelated: research.trading_related,
        pineScriptRelated: research.pine_script_related,
        systematicTradingRelated: research.systematic_trading_related,
      });

      const painDescriptions = painData.identified_pain_points.map((p) => p.description);
      const evidenceList = research.professional_evidence.map((e) => `${e.title}: ${e.detail}`);

      // 2. Run Gemini Lead Analyzer
      const { data: aiAnalysisData, promptVersion } = await leadAnalyzer.analyzeLead({
        fullName: lead.full_name,
        jobTitle: lead.job_title,
        company: lead.company,
        professionalFocus: research.professional_focus,
        evidenceList,
        painPoints: painDescriptions,
      });

      // 3. Compute deterministic + AI composite score
      const compositeResult = CompositeScorer.calculate({
        jobTitle: lead.job_title,
        company: lead.company,
        industry: lead.industry,
        headline: research.professional_focus,
        aiScores: {
          roleRelevance: aiAnalysisData.role_relevance,
          companyFit: aiAnalysisData.company_fit,
          problemRelevance: aiAnalysisData.problem_relevance,
          evidenceStrength: aiAnalysisData.evidence_strength,
        },
      });

      // 4. Persist AI Analysis
      await aiAnalysisRepo.create({
        lead_id: lead.id,
        qualification: compositeResult.qualificationStatus,
        composite_score: compositeResult.compositeScore,
        role_relevance: compositeResult.roleRelevance,
        company_fit: compositeResult.companyFit,
        problem_relevance: compositeResult.problemRelevance,
        evidence_strength: compositeResult.evidenceStrength,
        reasoning: aiAnalysisData.reasoning,
        pain_points: aiAnalysisData.pain_points,
        use_cases: aiAnalysisData.use_cases,
        confidence: aiAnalysisData.confidence,
        model_name: 'gemini-2.5-flash',
        prompt_version: promptVersion,
      });

      // 5. Update Lead Record with Qualification & Score
      await leadsRepo.updateQualification(
        lead.id,
        compositeResult.qualificationStatus,
        compositeResult.compositeScore,
        compositeResult.priority
      );

      // 6. Audit Logging
      const eventType =
        compositeResult.qualificationStatus === QualificationStatus.UNQUALIFIED ||
        compositeResult.qualificationStatus === QualificationStatus.DISQUALIFIED
          ? EventType.LEAD_REJECTED
          : EventType.LEAD_QUALIFIED;

      await eventsRepo.log({
        lead_id: lead.id,
        event_type: eventType,
        metadata: {
          score: compositeResult.compositeScore,
          qualification: compositeResult.qualificationStatus,
          priority: compositeResult.priority,
        },
        actor: 'worker:lead-scoring',
      });

      scoredCount++;
      leadLog.info(
        {
          score: compositeResult.compositeScore,
          qualification: compositeResult.qualificationStatus,
        },
        'Lead scoring completed'
      );
    } catch (err) {
      leadLog.error({ error: err }, 'Failed to score lead');
      await leadsRepo.updateStatus(lead.id, LeadStatus.RESEARCHED); // Revert for retry
    }
  }

  log.info({ scored: scoredCount }, 'Lead Scoring Worker Completed');
  return { scored: scoredCount };
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1])) {
  runLeadScoring()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
