import { describe, it, expect } from 'vitest';
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
} from '../../packages/shared/src/index.js';

describe('End-to-End Pipeline Workflow Simulation', () => {
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
});
