import {
  Lead,
  NewLead,
  LeadStatus,
  QualificationStatus,
  PriorityLevel,
} from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed } from '../client.js';
import { memoryStore } from '../memory-store.js';
import { logger } from '@growth/logging';

export class LeadsRepository {
  async findById(id: string): Promise<Lead | null> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findLeadById(id);
    }

    const res = await dbQuery<Lead>(
      'SELECT * FROM leads WHERE id = $1 LIMIT 1;',
      [id]
    );
    return res.rows[0] || null;
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findLeadByEmail(cleanEmail);
    }

    const res = await dbQuery<Lead>(
      'SELECT * FROM leads WHERE LOWER(TRIM(email)) = $1 LIMIT 1;',
      [cleanEmail]
    );
    return res.rows[0] || null;
  }

  async findBySourceId(source: string, sourceId: string): Promise<Lead | null> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findLeadBySourceId(source, sourceId);
    }

    const res = await dbQuery<Lead>(
      'SELECT * FROM leads WHERE source = $1 AND source_id = $2 LIMIT 1;',
      [source, sourceId]
    );
    return res.rows[0] || null;
  }

  async create(lead: NewLead): Promise<Lead> {
    const cleanEmail = lead.email.toLowerCase().trim();

    if (isMemoryFallbackAllowed()) {
      return memoryStore.createLead({ ...lead, email: cleanEmail });
    }

    const res = await dbQuery<Lead>(
      `INSERT INTO leads (
        campaign_id, first_name, last_name, full_name, email, company, job_title,
        linkedin_url, company_url, location, industry, company_size, source, source_id,
        status, qualification_status, lead_score, priority, opted_out
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19
      ) RETURNING *;`,
      [
        lead.campaign_id || null,
        lead.first_name,
        lead.last_name,
        lead.full_name,
        cleanEmail,
        lead.company,
        lead.job_title,
        lead.linkedin_url || null,
        lead.company_url || null,
        lead.location || null,
        lead.industry || null,
        lead.company_size || null,
        lead.source || 'apollo',
        lead.source_id || null,
        lead.status || LeadStatus.NEW,
        lead.qualification_status || QualificationStatus.UNQUALIFIED,
        lead.lead_score ?? 0,
        lead.priority || PriorityLevel.MEDIUM,
        lead.opted_out ?? false,
      ]
    );

    return res.rows[0];
  }

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.updateLead(id, updates);
    }

    const keys = Object.keys(updates).filter((k) => k !== 'id');
    if (keys.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error(`Lead ${id} not found`);
      return existing;
    }

    const setClauses = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = keys.map((key) => (updates as any)[key]);

    const res = await dbQuery<Lead>(
      `UPDATE leads SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *;`,
      [id, ...values]
    );

    if (res.rows.length === 0) {
      throw new Error(`Lead ${id} not found for update`);
    }

    return res.rows[0];
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.update(id, { status });
  }

  async updateQualification(
    id: string,
    qualification_status: QualificationStatus,
    lead_score: number,
    priority: PriorityLevel
  ): Promise<Lead> {
    const isDisqualified =
      qualification_status === QualificationStatus.DISQUALIFIED ||
      qualification_status === QualificationStatus.UNQUALIFIED;

    return this.update(id, {
      qualification_status,
      lead_score,
      priority,
      status: isDisqualified ? LeadStatus.REJECTED : LeadStatus.QUALIFIED,
    });
  }

  async setOptedOut(email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    if (isMemoryFallbackAllowed()) {
      const lead = memoryStore.findLeadByEmail(cleanEmail);
      if (lead) {
        memoryStore.updateLead(lead.id, { opted_out: true, status: LeadStatus.OPTED_OUT });
      }
      return;
    }

    await dbQuery(
      `UPDATE leads SET opted_out = TRUE, status = $1, updated_at = NOW() WHERE LOWER(TRIM(email)) = $2;`,
      [LeadStatus.OPTED_OUT, cleanEmail]
    );
  }

  async list(filters?: {
    status?: LeadStatus;
    qualification_status?: QualificationStatus;
    campaign_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ leads: Lead[]; total: number }> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.listLeads(filters);
    }

    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters?.qualification_status) {
      params.push(filters.qualification_status);
      conditions.push(`qualification_status = $${params.length}`);
    }
    if (filters?.campaign_id) {
      params.push(filters.campaign_id);
      conditions.push(`campaign_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countRes = await dbQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM leads ${whereClause};`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    // Paginated list
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const res = await dbQuery<Lead>(
      `SELECT * FROM leads ${whereClause} ORDER BY lead_score DESC, created_at DESC LIMIT ${limitParam} OFFSET ${offsetParam};`,
      params
    );

    return {
      leads: res.rows,
      total,
    };
  }
}
