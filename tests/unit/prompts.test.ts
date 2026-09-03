import { describe, it, expect } from 'vitest';
import {
  RESEARCHER_V1,
  PAIN_POINT_DETECTOR_V1,
  LEAD_ANALYZER_V1,
  PERSONALIZATION_V1,
  OUTREACH_V1,
  REPLY_INTELLIGENCE_V1,
} from '../../prompts/index.js';

describe('Prompt Engineering & Versioning', () => {
  it('should format Researcher v1 prompt correctly', () => {
    const prompt = RESEARCHER_V1.buildPrompt({
      fullName: 'Marcus Vance',
      jobTitle: 'Quantitative Researcher',
      company: 'Vance Trading Labs',
      location: 'Chicago, IL',
      industry: 'Quantitative Hedge Fund',
      linkedinUrl: 'https://linkedin.com/in/marcus-vance-quant',
    });

    expect(prompt).toContain('Marcus Vance');
    expect(prompt).toContain('Quantitative Researcher');
    expect(RESEARCHER_V1.version).toBe('v1.0.0');
  });

  it('should format Lead Analyzer v1 prompt correctly', () => {
    const prompt = LEAD_ANALYZER_V1.buildPrompt({
      fullName: 'Marcus Vance',
      jobTitle: 'Quantitative Researcher',
      company: 'Vance Trading Labs',
      professionalFocus: 'HMM market regime switching',
      evidenceList: ['GitHub: PyRegime package author'],
      painPoints: ['Overfitting on historical regime shifts'],
    });

    expect(prompt).toContain('Marcus Vance');
    expect(prompt).toContain('PyRegime');
    expect(LEAD_ANALYZER_V1.systemInstruction).toContain('Role Relevance');
  });

  it('should format Outreach Writer v1 prompt correctly', () => {
    const prompt = OUTREACH_V1.buildPrompt({
      firstName: 'Marcus',
      fullName: 'Marcus Vance',
      jobTitle: 'Quantitative Researcher',
      company: 'Vance Trading Labs',
      icebreakerHook: 'Noticed your work on Python-based HMM regime detection.',
      painCategory: 'regime_instability',
      relevanceAngle: 'Gaussian HMM regime validation',
    });

    expect(prompt).toContain('Marcus');
    expect(prompt).toContain('Noticed your work on Python-based HMM regime detection.');
    expect(OUTREACH_V1.systemInstruction).toContain('Under 100 words total');
  });

  it('should format Reply Intelligence v1 prompt correctly', () => {
    const prompt = REPLY_INTELLIGENCE_V1.buildPrompt({
      originalSubject: 'HMM regime stress-testing for Vance Trading Labs',
      originalBody: 'Would you be open to taking a quick look?',
      replyText: 'Yes, definitely interested. Please send over access details.',
      prospectName: 'Marcus Vance',
    });

    expect(prompt).toContain('Marcus Vance');
    expect(prompt).toContain('Yes, definitely interested.');
    expect(REPLY_INTELLIGENCE_V1.systemInstruction).toContain('INTERESTED');
  });
});
