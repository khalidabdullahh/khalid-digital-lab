import { FastifyPluginAsync } from 'fastify';
import {
  LeadsRepository,
  ResearchRepository,
  AIAnalysisRepository,
  OutreachRepository,
  EventsRepository,
} from '@growth/database';
import { LeadStatus, QualificationStatus, PriorityLevel, EventType, NewLead } from '@growth/shared';
import { runControlledPipeline } from '@growth/workers/orchestrator.js';
import { ResearchAgentService, PainPointDetectorService, LeadAnalyzerService, PersonalizationService, OutreachWriterService } from '@growth/gemini';
import { CompositeScorer } from '@growth/scoring';
import { logger } from '@growth/logging';

export const leadsRoutes: FastifyPluginAsync = async (fastify) => {
  const leadsRepo = new LeadsRepository();
  const researchRepo = new ResearchRepository();
  const aiAnalysisRepo = new AIAnalysisRepository();
  const outreachRepo = new OutreachRepository();
  const eventsRepo = new EventsRepository();

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

  // Manually add / import a prospect & optionally auto-process with Gemini 3.6 Flash
  fastify.post('/leads/create', async (request, reply) => {
    const body = request.body as {
      full_name: string;
      email: string;
      company: string;
      job_title: string;
      linkedin_url?: string;
      company_url?: string;
      location?: string;
      auto_process?: boolean;
    };

    if (!body.full_name || !body.email || !body.company || !body.job_title) {
      return reply.status(400).send({ error: 'Full name, email, company, and job title are required' });
    }

    const nameParts = body.full_name.trim().split(' ');
    const firstName = nameParts[0] || 'Trader';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check duplicate
    const existing = await leadsRepo.findByEmail(body.email);
    if (existing) {
      return reply.status(409).send({ error: 'Lead with this email already exists in database', lead: existing });
    }

    const newLead: NewLead = {
      first_name: firstName,
      last_name: lastName,
      full_name: body.full_name.trim(),
      email: body.email.trim(),
      company: body.company.trim(),
      job_title: body.job_title.trim(),
      linkedin_url: body.linkedin_url || null,
      company_url: body.company_url || null,
      location: body.location || null,
      source: 'manual',
      status: LeadStatus.NEW,
      qualification_status: QualificationStatus.UNQUALIFIED,
      lead_score: 0,
      priority: PriorityLevel.MEDIUM,
      opted_out: false,
    };

    const lead = await leadsRepo.create(newLead);
    await eventsRepo.log({
      lead_id: lead.id,
      event_type: EventType.LEAD_IMPORTED,
      metadata: { source: 'manual_dashboard_input' },
      actor: 'dashboard:user',
    });

    // Auto-process with Gemini AI if requested
    if (body.auto_process) {
      try {
        const researchService = new ResearchAgentService();
        const painPointService = new PainPointDetectorService();
        const analyzerService = new LeadAnalyzerService();
        const personalizationService = new PersonalizationService();
        const writerService = new OutreachWriterService();

        // 1. Research
        const researchRes = await researchService.executeResearch({
          fullName: lead.full_name,
          company: lead.company,
          jobTitle: lead.job_title,
          linkedinUrl: lead.linkedin_url || undefined,
        });

        await researchRepo.create({
          lead_id: lead.id,
          ...researchRes.data,
          prompt_version: 'v1.0.0',
        });

        // 2. Pain Points & Analysis
        const painRes = await painPointService.detectPainPoints({
          professionalFocus: researchRes.data.professional_focus,
          relevantProjects: researchRes.data.relevant_projects,
          tradingRelated: researchRes.data.trading_related,
          pineScriptRelated: researchRes.data.pine_script_related,
          systematicTradingRelated: researchRes.data.systematic_trading_related,
        });

        const evidenceList = researchRes.data.professional_evidence
          .map((e) => e.detail);

        const analysisRes = await analyzerService.analyzeLead({
          fullName: lead.full_name,
          jobTitle: lead.job_title,
          company: lead.company,
          professionalFocus: researchRes.data.professional_focus,
          evidenceList,
          painPoints: painRes.data.identified_pain_points.map((p) => p.description),
        });

        const composite = CompositeScorer.calculate({
          jobTitle: lead.job_title,
          company: lead.company,
          industry: lead.industry,
          aiScores: {
            roleRelevance: analysisRes.data.role_relevance,
            companyFit: analysisRes.data.company_fit,
            problemRelevance: analysisRes.data.problem_relevance,
            evidenceStrength: analysisRes.data.evidence_strength,
          },
        });

        await aiAnalysisRepo.create({
          lead_id: lead.id,
          qualification: composite.qualificationStatus,
          composite_score: composite.compositeScore,
          role_relevance: composite.roleRelevance,
          company_fit: composite.companyFit,
          problem_relevance: composite.problemRelevance,
          evidence_strength: composite.evidenceStrength,
          reasoning: analysisRes.data.reasoning,
          pain_points: analysisRes.data.pain_points,
          use_cases: analysisRes.data.use_cases,
          confidence: analysisRes.data.confidence,
          model_name: 'gemini-3.6-flash',
          prompt_version: 'v1.0.0',
        });

        await leadsRepo.updateQualification(lead.id, composite.qualificationStatus, composite.compositeScore, composite.priority);

        // 3. Outreach Draft
        const primaryFact =
          researchRes.data.professional_evidence.find((e) => e.evidence_type === 'verified_fact')?.detail ||
          researchRes.data.professional_focus;
        const primaryPain = painRes.data.identified_pain_points[0]?.pain_category || 'regime_instability';

        const personalRes = await personalizationService.generatePersonalization({
          fullName: lead.full_name,
          jobTitle: lead.job_title,
          company: lead.company,
          professionalFocus: researchRes.data.professional_focus,
          evidenceSnippet: primaryFact,
          painPoint: primaryPain,
        });

        const draftRes = await writerService.generateEmailDraft({
          firstName: lead.first_name,
          fullName: lead.full_name,
          jobTitle: lead.job_title,
          company: lead.company,
          icebreakerHook: personalRes.data.icebreaker_hook,
          painCategory: primaryPain,
          relevanceAngle: personalRes.data.relevance_angle,
        });

        const outreach = await outreachRepo.create({
          lead_id: lead.id,
          subject: draftRes.data.subject,
          body_text: draftRes.data.body_text,
          body_html: draftRes.data.body_html,
          personalization_snippet: personalRes.data.icebreaker_hook,
          prompt_version: 'v1.0.0',
          status: 'PENDING_APPROVAL' as any,
        });

        return reply.send({ success: true, lead, outreach, processed: true });
      } catch (err: any) {
        logger.error({ error: err }, 'Failed auto-processing lead with Gemini');
        return reply.send({ success: true, lead, processed: false, error: err.message });
      }
    }

    return reply.send({ success: true, lead });
  });

  // Trigger full pipeline execution
  fastify.post('/pipeline/run', async (request, reply) => {
    try {
      const result = await runControlledPipeline();
      return reply.send({ success: true, result });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // Sender & Email Configuration
  fastify.get('/sender/config', async (request, reply) => {
    return reply.send({
      sender_name: 'Khalid Abdullah',
      sender_email: 'khalid@trading-os.com',
      reply_to_email: 'khalid@trading-os.com',
      sending_platform: 'Instantly.ai (v2 API)',
      connected_accounts_count: 3,
      daily_throttle_limit: 25,
      warmup_status: 'Active (100% Health Score)',
      instantly_campaign_id: 'instantly_camp_quant_v1',
      campaign_name: 'Trading OS — Alpha Cohort 1 (Quant & Pine Developers)',
    });
  });
};
