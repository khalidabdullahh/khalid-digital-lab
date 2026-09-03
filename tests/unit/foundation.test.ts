import { describe, it, expect, beforeEach } from 'vitest';
import {
  LeadSchema,
  ResearchOutputSchema,
  LeadAnalyzerOutputSchema,
  ReplyIntelligenceOutputSchema,
  getEnv,
  resetEnvCache,
} from '../../packages/shared/src/index.js';

describe('Foundation - Environment & Config', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  it('should load environment configuration with defaults', () => {
    const env = getEnv();
    expect(env).toBeDefined();
    expect(env.PORT).toBeTypeOf('number');
    expect(env.TRADING_OS_APP_URL).toBe('https://trading-os-blue.vercel.app');
    expect(env.GEMINI_MODEL).toMatch(/gemini/);
  });
});

describe('Foundation - Domain Schemas Validation', () => {
  it('should successfully validate a valid Lead record', () => {
    const validLead = {
      first_name: 'Marcus',
      last_name: 'Vance',
      full_name: 'Marcus Vance',
      email: 'marcus.vance@quantfunds.io',
      company: 'Vance Trading Labs',
      job_title: 'Lead Quantitative Researcher',
      source: 'apollo' as const,
    };

    const result = LeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email in Lead schema', () => {
    const invalidLead = {
      first_name: 'Marcus',
      last_name: 'Vance',
      full_name: 'Marcus Vance',
      email: 'invalid-email-string',
      company: 'Vance Trading Labs',
      job_title: 'Lead Quantitative Researcher',
    };

    const result = LeadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it('should validate structured Gemini ResearchOutput schema with strict evidence rules', () => {
    const validResearch = {
      professional_focus: 'Gaussian HMM regime modeling and systematic crypto futures',
      trading_related: true,
      quant_related: true,
      pine_script_related: false,
      systematic_trading_related: true,
      professional_evidence: [
        {
          title: 'Published quantitative paper',
          evidence_type: 'verified_fact' as const,
          detail: 'Authored empirical regime switching paper on SSRN',
        },
      ],
      confidence_score: 0.95,
    };

    const result = ResearchOutputSchema.safeParse(validResearch);
    expect(result.success).toBe(true);
  });

  it('should validate structured Gemini LeadAnalyzer output schema', () => {
    const validAnalysis = {
      qualification: 'HIGH_PRIORITY' as const,
      composite_score: 92,
      role_relevance: 95,
      company_fit: 90,
      problem_relevance: 90,
      evidence_strength: 92,
      reasoning: 'Strong alignment with Gaussian HMM regime validation needs',
      pain_points: ['Regime lag during volatility transitions', 'Overfitting on bull regimes'],
      use_cases: ['Stress test Pine Script strategies in Trading OS HMM regime engine'],
      confidence: 0.94,
    };

    const result = LeadAnalyzerOutputSchema.safeParse(validAnalysis);
    expect(result.success).toBe(true);
  });

  it('should validate structured Gemini ReplyIntelligence output schema', () => {
    const validReply = {
      classification: 'INTERESTED' as const,
      confidence: 0.98,
      summary: 'Prospect requested a 15-minute demo and access to the HMM regime simulator',
      suggested_action: 'Send Cal.com booking link and direct platform beta login',
      draft_reply: 'Hi Marcus, thrilled to share access...',
      requires_human_action: true,
      opt_out_detected: false,
    };

    const result = ReplyIntelligenceOutputSchema.safeParse(validReply);
    expect(result.success).toBe(true);
  });
});
