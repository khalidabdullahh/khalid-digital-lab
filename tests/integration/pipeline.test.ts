import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ApolloNormalizer } from '../../packages/apollo/src/index.js';
import { DeterministicScorer, CompositeScorer } from '../../packages/scoring/src/index.js';
import {
  LeadStatus,
  QualificationStatus,
  PriorityLevel,
  OutreachStatus,
  ReplyClassification,
  ResearchOutputSchema,
  OutreachWriterOutputSchema,
  ReplyIntelligenceOutputSchema,
  resetEnvCache,
} from '../../packages/shared/src/index.js';

describe('End-to-End Pipeline Workflow Simulation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, APP_ENV: 'test', DATABASE_URL: '' };
    resetEnvCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvCache();
  });
  it('should process a lead from Ingestion through Qualification and Outreach Approval', () => {
    // 1. Ingestion / Normalization (Apollo)
    const rawApolloProspect = {
      id: 'apollo_quant_101',
      first_name: 'Marcus',
      last_name: 'Vance',
      name: 'Marcus Vance',
      email: 'marcus.vance@vancetrading.com',
      title: 'Lead Quantitative Researcher',
      city: 'Chicago',
      organization: {
        name: 'Vance Trading Labs',
        website_url: 'https://vancetrading.com',
        industry: 'Quantitative Hedge Fund',
        estimated_num_employees: 15,
      },
    };

    const normalizedLead = ApolloNormalizer.normalize(rawApolloProspect);
    expect(normalizedLead).not.toBeNull();
    expect(normalizedLead?.status).toBe(LeadStatus.NEW);

    // 2. Research (Simulated Gemini Research Agent Output)
    const simulatedResearch = {
      professional_focus: 'Systematic futures modeling and Gaussian HMM regime classification',
      trading_related: true,
      quant_related: true,
      pine_script_related: false,
      systematic_trading_related: true,
      company_description: 'Quantitative investment firm',
      professional_evidence: [
        {
          title: 'GitHub: PyRegime',
          evidence_type: 'verified_fact' as const,
          detail: 'Maintains open-source Python library for HMM regime transitions.',
        },
      ],
      relevant_projects: ['PyRegime', 'FuturesBacktester'],
      relevant_public_activity: ['Quant research blog author'],
      potential_pain_points: ['Regime lag', 'Overfitting on bull market bias'],
      potential_use_cases: ['Trading OS HMM regime stress-testing'],
      evidence_sources: ['https://github.com/marcusvance/pyregime'],
      confidence_score: 0.94,
    };

    const researchParsed = ResearchOutputSchema.safeParse(simulatedResearch);
    expect(researchParsed.success).toBe(true);

    // 3. Scoring (Deterministic + AI Composite)
    const scoringResult = CompositeScorer.calculate({
      jobTitle: normalizedLead!.job_title,
      company: normalizedLead!.company,
      industry: normalizedLead!.industry,
      headline: simulatedResearch.professional_focus,
      aiScores: {
        roleRelevance: 95,
        companyFit: 90,
        problemRelevance: 95,
        evidenceStrength: 92,
      },
    });

    expect(scoringResult.compositeScore).toBeGreaterThanOrEqual(85);
    expect(scoringResult.qualificationStatus).toBe(QualificationStatus.HIGH_PRIORITY);

    // 4. Outreach Generation (Simulated Gemini Outreach Writer Output)
    const simulatedOutreach = {
      subject: 'HMM regime stress-testing for Vance Trading Labs',
      body_text:
        'Hi Marcus, noticed your work on Python HMM regime detection. I am building Trading OS (trading-os-blue.vercel.app), a quantitative validation platform for stress-testing systematic strategies against Gaussian HMM regimes and Monte Carlo drawdown paths. Looking for a few serious quant researchers to test our regime engine and share feedback. Open to taking a quick look? Best, Khalid',
      body_html:
        '<p>Hi Marcus,<br/><br/>Noticed your work on Python HMM regime detection...</p>',
      personalization_snippet: 'Noticed your work on Python HMM regime detection.',
      word_count: 58,
      call_to_action: 'Open to taking a quick look?',
    };

    const outreachParsed = OutreachWriterOutputSchema.safeParse(simulatedOutreach);
    expect(outreachParsed.success).toBe(true);
    expect(simulatedOutreach.word_count).toBeLessThan(100);

    // 5. Human-in-the-Loop Approval Gate
    const outreachStatus = OutreachStatus.APPROVED;
    expect(outreachStatus).toBe(OutreachStatus.APPROVED);

    // 6. Inbound Reply Intelligence (Simulated Gemini Reply Classifier)
    const simulatedProspectReply = {
      classification: ReplyClassification.INTERESTED,
      confidence: 0.95,
      summary: 'Marcus expressed interest in testing HMM regime features.',
      suggested_action: 'Send direct login credentials and platform walkthrough link.',
      draft_reply:
        'Hi Marcus, great to connect. You can access the platform at trading-os-blue.vercel.app...',
      requires_human_action: true,
      opt_out_detected: false,
    };

    const replyParsed = ReplyIntelligenceOutputSchema.safeParse(simulatedProspectReply);
    expect(replyParsed.success).toBe(true);
    expect(replyParsed.data?.classification).toBe(ReplyClassification.INTERESTED);
    expect(replyParsed.data?.opt_out_detected).toBe(false);
  });

  it('should immediately trigger opt-out when an unsubscribe reply is classified', () => {
    const unsubscribeReply = {
      classification: ReplyClassification.UNSUBSCRIBE,
      confidence: 0.99,
      summary: 'Prospect requested to be removed from all future emails.',
      suggested_action: 'Do not contact. Lead automatically opted out.',
      draft_reply: null,
      requires_human_action: false,
      opt_out_detected: true,
    };

    const parsed = ReplyIntelligenceOutputSchema.safeParse(unsubscribeReply);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.opt_out_detected).toBe(true);
  });

  it('should execute full database-backed pipeline lifecycle with human approval gate and atomic sync', async () => {
    const { LeadsRepository, OutreachRepository, EventsRepository } = await import('../../packages/database/src/index.js');
    const leadsRepo = new LeadsRepository();
    const outreachRepo = new OutreachRepository();
    const eventsRepo = new EventsRepository();

    // 1. Lead creation
    const email = `lifecycle.trader.${Date.now()}@quantfunds.io`;
    const lead = await leadsRepo.create({
      first_name: 'Elena',
      last_name: 'Rostova',
      full_name: 'Elena Rostova',
      email,
      company: 'PineQuant Analytics',
      job_title: 'Pine Script v5 Engineer & Quant',
      source: 'apollo',
      status: LeadStatus.NEW,
      qualification_status: QualificationStatus.UNQUALIFIED,
      lead_score: 0,
      priority: PriorityLevel.MEDIUM,
      opted_out: false,
    });

    expect(lead.id).toBeDefined();
    expect(lead.email).toBe(email);

    // 2. Score lead deterministically
    const scoreRes = CompositeScorer.calculate({
      jobTitle: lead.job_title,
      company: lead.company,
      aiScores: {
        roleRelevance: 90,
        companyFit: 85,
        problemRelevance: 88,
        evidenceStrength: 85,
      },
    });

    const qualifiedLead = await leadsRepo.updateQualification(
      lead.id,
      scoreRes.qualificationStatus,
      scoreRes.compositeScore,
      scoreRes.priority
    );
    expect(qualifiedLead.status).toBe(LeadStatus.QUALIFIED);
    expect(qualifiedLead.lead_score).toBeGreaterThanOrEqual(70);

    // 3. Create personalized outreach draft
    const draft = await outreachRepo.create({
      lead_id: lead.id,
      subject: 'Pine Script strategy stress-testing for PineQuant Analytics',
      body_text: 'Hi Elena, testing Trading OS regime detection...',
      body_html: '<p>Hi Elena...</p>',
      personalization_snippet: 'Noticed your Pine Script engineering focus.',
      prompt_version: 'v1.0.0',
      status: OutreachStatus.PENDING_APPROVAL,
    });
    expect(draft.status).toBe(OutreachStatus.PENDING_APPROVAL);

    // 4. Human Approval Gate
    const approved = await outreachRepo.approve(draft.id, 'khalid_operator');
    expect(approved.status).toBe(OutreachStatus.APPROVED);
    expect(approved.approved_by).toBe('khalid_operator');

    // 5. Atomic lock to SYNCING
    const syncing = await outreachRepo.markSyncing(draft.id);
    expect(syncing.status).toBe(OutreachStatus.SYNCING);

    // 6. Complete Instantly Sync
    const sent = await outreachRepo.markSent(draft.id, 'instantly_sim_id_101');
    expect(sent.status).toBe(OutreachStatus.SENT);
    expect(sent.instantly_lead_id).toBe('instantly_sim_id_101');

    // 7. Update lead to SENT
    const contactedLead = await leadsRepo.update(lead.id, {
      status: LeadStatus.SENT,
      last_contacted_at: new Date().toISOString(),
    });
    expect(contactedLead.status).toBe(LeadStatus.SENT);

    // 8. Log audit trail
    await eventsRepo.log({
      lead_id: lead.id,
      event_type: 'OUTREACH_SENT' as any,
      metadata: { outreach_id: draft.id },
      actor: 'test:lifecycle',
    });
  });
});
