import { QualificationStatus, PriorityLevel } from '@growth/shared';
import { DeterministicScorer } from './deterministic.js';

export interface CompositeScoreInput {
  jobTitle: string;
  company: string;
  industry?: string | null;
  headline?: string;
  aiScores?: {
    roleRelevance: number;
    companyFit: number;
    problemRelevance: number;
    evidenceStrength: number;
  };
}

export interface CompositeScoreOutput {
  compositeScore: number;
  roleRelevance: number;
  companyFit: number;
  problemRelevance: number;
  evidenceStrength: number;
  qualificationStatus: QualificationStatus;
  priority: PriorityLevel;
  disqualified: boolean;
  disqualifyReason?: string;
}

export class CompositeScorer {
  /**
   * Weights:
   * Role Relevance: 35%
   * Company Fit: 25%
   * Problem Relevance: 20%
   * Evidence Strength: 20%
   */
  static calculate(input: CompositeScoreInput): CompositeScoreOutput {
    const det = DeterministicScorer.evaluate({
      jobTitle: input.jobTitle,
      company: input.company,
      industry: input.industry,
      headline: input.headline,
    });

    if (det.disqualified) {
      return {
        compositeScore: 0,
        roleRelevance: 0,
        companyFit: 0,
        problemRelevance: 0,
        evidenceStrength: 0,
        qualificationStatus: QualificationStatus.DISQUALIFIED,
        priority: PriorityLevel.LOW,
        disqualified: true,
        disqualifyReason: det.disqualifyReason,
      };
    }

    // Role relevance blends deterministic keyword baseline with AI breakdown if available
    const roleRelevance = input.aiScores
      ? Math.round(det.baseRoleScore * 0.3 + input.aiScores.roleRelevance * 0.7)
      : det.baseRoleScore;

    const companyFit = input.aiScores
      ? Math.round(det.companyScore * 0.3 + input.aiScores.companyFit * 0.7)
      : det.companyScore;

    const problemRelevance = input.aiScores ? input.aiScores.problemRelevance : 50;
    const evidenceStrength = input.aiScores ? input.aiScores.evidenceStrength : 50;

    // Mathematical formula
    const rawScore =
      0.35 * roleRelevance +
      0.25 * companyFit +
      0.20 * problemRelevance +
      0.20 * evidenceStrength;

    const compositeScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    let qualificationStatus: QualificationStatus;
    let priority: PriorityLevel;

    if (compositeScore >= 85) {
      qualificationStatus = QualificationStatus.HIGH_PRIORITY;
      priority = PriorityLevel.URGENT;
    } else if (compositeScore >= 70) {
      qualificationStatus = QualificationStatus.QUALIFIED;
      priority = PriorityLevel.HIGH;
    } else if (compositeScore >= 50) {
      qualificationStatus = QualificationStatus.REVIEW;
      priority = PriorityLevel.MEDIUM;
    } else {
      qualificationStatus = QualificationStatus.UNQUALIFIED;
      priority = PriorityLevel.LOW;
    }

    return {
      compositeScore,
      roleRelevance,
      companyFit,
      problemRelevance,
      evidenceStrength,
      qualificationStatus,
      priority,
      disqualified: false,
    };
  }
}
