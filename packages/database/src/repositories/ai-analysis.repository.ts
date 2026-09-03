import { AIAnalysisResult, NewAIAnalysisResult } from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed } from '../client.js';
import { memoryStore } from '../memory-store.js';

export class AIAnalysisRepository {
  async findByLeadId(leadId: string): Promise<AIAnalysisResult | null> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findAIAnalysisByLeadId(leadId);
    }

    const res = await dbQuery<AIAnalysisResult>(
      'SELECT * FROM ai_analysis WHERE lead_id = $1 ORDER BY analyzed_at DESC LIMIT 1;',
      [leadId]
    );
    return res.rows[0] || null;
  }

  async create(analysis: NewAIAnalysisResult): Promise<AIAnalysisResult> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.createAIAnalysis(analysis);
    }

    const res = await dbQuery<AIAnalysisResult>(
      `INSERT INTO ai_analysis (
        lead_id, qualification, composite_score, role_relevance,
        company_fit, problem_relevance, evidence_strength, reasoning,
        pain_points, use_cases, confidence, model_name, prompt_version
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11, $12, $13
      ) RETURNING *;`,
      [
        analysis.lead_id,
        analysis.qualification,
        analysis.composite_score,
        analysis.role_relevance,
        analysis.company_fit,
        analysis.problem_relevance,
        analysis.evidence_strength,
        analysis.reasoning,
        JSON.stringify(analysis.pain_points || []),
        JSON.stringify(analysis.use_cases || []),
        analysis.confidence,
        analysis.model_name,
        analysis.prompt_version || 'v1',
      ]
    );

    return res.rows[0];
  }
}
