import { ResearchRecord, NewResearchRecord } from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed } from '../client.js';
import { memoryStore } from '../memory-store.js';

export class ResearchRepository {
  async findByLeadId(leadId: string): Promise<ResearchRecord | null> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findResearchByLeadId(leadId);
    }

    const res = await dbQuery<ResearchRecord>(
      'SELECT * FROM research WHERE lead_id = $1 ORDER BY researched_at DESC LIMIT 1;',
      [leadId]
    );
    return res.rows[0] || null;
  }

  async create(record: NewResearchRecord): Promise<ResearchRecord> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.createResearch(record);
    }

    const res = await dbQuery<ResearchRecord>(
      `INSERT INTO research (
        lead_id, professional_focus, trading_related, quant_related,
        pine_script_related, systematic_trading_related, company_description,
        professional_evidence, relevant_projects, relevant_public_activity,
        potential_pain_points, potential_use_cases, evidence_sources,
        confidence_score, prompt_version
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13,
        $14, $15
      ) RETURNING *;`,
      [
        record.lead_id,
        record.professional_focus,
        record.trading_related,
        record.quant_related,
        record.pine_script_related,
        record.systematic_trading_related,
        record.company_description || null,
        JSON.stringify(record.professional_evidence || []),
        JSON.stringify(record.relevant_projects || []),
        JSON.stringify(record.relevant_public_activity || []),
        JSON.stringify(record.potential_pain_points || []),
        JSON.stringify(record.potential_use_cases || []),
        JSON.stringify(record.evidence_sources || []),
        record.confidence_score,
        record.prompt_version || 'v1',
      ]
    );

    return res.rows[0];
  }
}
