import { describe, it, expect } from 'vitest';
import { DeterministicScorer, CompositeScorer } from '../../packages/scoring/src/index.js';
import { QualificationStatus, PriorityLevel } from '../../packages/shared/src/index.js';

describe('Deterministic Scorer', () => {
  it('should score high for quantitative role keywords', () => {
    const result = DeterministicScorer.evaluate({
      jobTitle: 'Senior Quantitative Researcher & Backtesting Engineer',
      company: 'Alpha Trading Labs',
      industry: 'Quantitative Hedge Fund',
      headline: 'Building systematic HMM regime models',
    });

    expect(result.disqualified).toBe(false);
    expect(result.baseRoleScore).toBeGreaterThanOrEqual(85);
    expect(result.companyScore).toBe(90);
    expect(result.detectedKeywords).toContain('quant');
    expect(result.detectedKeywords).toContain('backtest');
    expect(result.detectedKeywords).toContain('systematic');
  });

  it('should immediately disqualify non-ICP profiles with negative keywords', () => {
    const result = DeterministicScorer.evaluate({
      jobTitle: 'Technical Recruiter / Talent Acquisition Specialist',
      company: 'Quant Search HR',
      industry: 'Human Resources',
    });

    expect(result.disqualified).toBe(true);
    expect(result.baseRoleScore).toBe(0);
    expect(result.disqualifyReason).toContain('recruiter');
  });

  it('should disqualify manual scalpers and retail signal sellers', () => {
    const result = DeterministicScorer.evaluate({
      jobTitle: 'Manual Scalper / 1m Forex Signals',
      company: 'Self Employed',
      industry: 'Retail Trading',
    });

    expect(result.disqualified).toBe(true);
    expect(result.disqualifyReason).toContain('manual scalper');
  });
});

describe('Composite Scorer', () => {
  it('should compute weighted composite score according to formula', () => {
    // Formula: 0.35 * Role + 0.25 * Company + 0.20 * Problem + 0.20 * Evidence
    const result = CompositeScorer.calculate({
      jobTitle: 'Quantitative Strategist',
      company: 'Nexus Capital',
      industry: 'Hedge Fund',
      aiScores: {
        roleRelevance: 90,
        companyFit: 80,
        problemRelevance: 85,
        evidenceStrength: 90,
      },
    });

    expect(result.disqualified).toBe(false);
    expect(result.compositeScore).toBeGreaterThanOrEqual(80);
    expect(result.qualificationStatus).toBe(QualificationStatus.HIGH_PRIORITY);
    expect(result.priority).toBe(PriorityLevel.URGENT);
  });

  it('should classify intermediate scores as REVIEW', () => {
    const result = CompositeScorer.calculate({
      jobTitle: 'Junior Data Analyst',
      company: 'General Fintech Corp',
      industry: 'Technology',
      aiScores: {
        roleRelevance: 60,
        companyFit: 60,
        problemRelevance: 60,
        evidenceStrength: 50,
      },
    });

    expect(result.disqualified).toBe(false);
    expect(result.compositeScore).toBeGreaterThanOrEqual(50);
    expect(result.compositeScore).toBeLessThan(70);
    expect(result.qualificationStatus).toBe(QualificationStatus.REVIEW);
    expect(result.priority).toBe(PriorityLevel.MEDIUM);
  });
});
