export interface DeterministicScoreResult {
  baseRoleScore: number;
  companyScore: number;
  disqualified: boolean;
  disqualifyReason?: string;
  detectedKeywords: string[];
}

const POSITIVE_ROLE_KEYWORDS = [
  'quant',
  'quantitative',
  'algorithmic',
  'systematic',
  'backtest',
  'pine script',
  'pinescript',
  'tradingview',
  'automated trading',
  'statistical arbitrage',
  'stat arb',
  'prop trader',
  'hft',
  'portfolio manager',
];

const DISQUALIFY_KEYWORDS = [
  'recruiter',
  'talent acquisition',
  'human resources',
  'sales representative',
  'account executive',
  'marketing manager',
  'crypto promoter',
  'affiliate marketer',
  'manual scalper',
  'forex signals',
];

export class DeterministicScorer {
  /**
   * Computes baseline deterministic score based on job title, company, and industry.
   */
  static evaluate(params: {
    jobTitle: string;
    company: string;
    industry?: string | null;
    headline?: string;
  }): DeterministicScoreResult {
    const textToScan = `${params.jobTitle} ${params.headline || ''} ${params.industry || ''}`.toLowerCase();

    // 1. Check for immediate disqualification
    for (const badKeyword of DISQUALIFY_KEYWORDS) {
      if (textToScan.includes(badKeyword)) {
        return {
          baseRoleScore: 0,
          companyScore: 0,
          disqualified: true,
          disqualifyReason: `Contains non-ICP keyword: "${badKeyword}"`,
          detectedKeywords: [badKeyword],
        };
      }
    }

    // 2. Score positive keywords
    const detected: string[] = [];
    let roleScore = 40; // baseline

    for (const goodKeyword of POSITIVE_ROLE_KEYWORDS) {
      if (textToScan.includes(goodKeyword)) {
        detected.push(goodKeyword);
        roleScore += 15;
      }
    }

    roleScore = Math.min(100, roleScore);

    // 3. Evaluate company industry
    let companyScore = 60;
    const ind = (params.industry || '').toLowerCase();
    if (ind.includes('quant') || ind.includes('hedge fund') || ind.includes('prop')) {
      companyScore = 90;
    } else if (ind.includes('financial services') || ind.includes('fintech') || ind.includes('capital markets')) {
      companyScore = 80;
    }

    return {
      baseRoleScore: roleScore,
      companyScore,
      disqualified: false,
      detectedKeywords: detected,
    };
  }
}
