import { OutreachRecord, NewOutreachRecord, OutreachStatus } from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed } from '../client.js';
import { memoryStore } from '../memory-store.js';

export class OutreachRepository {
  async findById(id: string): Promise<OutreachRecord | null> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findOutreachById(id);
    }

    const res = await dbQuery<OutreachRecord>(
      'SELECT * FROM outreach WHERE id = $1 LIMIT 1;',
      [id]
    );
    return res.rows[0] || null;
  }

  async findByLeadId(leadId: string): Promise<OutreachRecord[]> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findOutreachByLeadId(leadId);
    }

    const res = await dbQuery<OutreachRecord>(
      'SELECT * FROM outreach WHERE lead_id = $1 ORDER BY created_at DESC;',
      [leadId]
    );
    return res.rows;
  }

  async create(record: NewOutreachRecord): Promise<OutreachRecord> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.createOutreach(record);
    }

    const res = await dbQuery<OutreachRecord>(
      `INSERT INTO outreach (
        lead_id, campaign_id, subject, body_html, body_text,
        personalization_snippet, prompt_version, status, rejection_reason
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9
      ) RETURNING *;`,
      [
        record.lead_id,
        record.campaign_id || null,
        record.subject,
        record.body_html,
        record.body_text,
        record.personalization_snippet,
        record.prompt_version || 'v1',
        record.status || OutreachStatus.PENDING_APPROVAL,
        record.rejection_reason || null,
      ]
    );

    return res.rows[0];
  }

  async approve(id: string, approvedBy: string): Promise<OutreachRecord> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.updateOutreach(id, {
        status: OutreachStatus.APPROVED,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      });
    }

    const res = await dbQuery<OutreachRecord>(
      `UPDATE outreach 
       SET status = $1, approved_by = $2, approved_at = NOW() 
       WHERE id = $3 
       RETURNING *;`,
      [OutreachStatus.APPROVED, approvedBy, id]
    );

    if (res.rows.length === 0) {
      throw new Error(`Outreach record ${id} not found for approval`);
    }

    return res.rows[0];
  }

  async reject(id: string, rejectionReason: string): Promise<OutreachRecord> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.updateOutreach(id, {
        status: OutreachStatus.REJECTED,
        rejection_reason: rejectionReason,
      });
    }

    const res = await dbQuery<OutreachRecord>(
      `UPDATE outreach 
       SET status = $1, rejection_reason = $2 
       WHERE id = $3 
       RETURNING *;`,
      [OutreachStatus.REJECTED, rejectionReason, id]
    );

    if (res.rows.length === 0) {
      throw new Error(`Outreach record ${id} not found for rejection`);
    }

    return res.rows[0];
  }

  async updateContent(id: string, subject: string, bodyText: string, bodyHtml: string): Promise<OutreachRecord> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.updateOutreach(id, {
        subject,
        body_text: bodyText,
        body_html: bodyHtml,
      });
    }

    const res = await dbQuery<OutreachRecord>(
      `UPDATE outreach 
       SET subject = $1, body_text = $2, body_html = $3 
       WHERE id = $4 
       RETURNING *;`,
      [subject, bodyText, bodyHtml, id]
    );

    if (res.rows.length === 0) {
      throw new Error(`Outreach record ${id} not found for content update`);
    }

    return res.rows[0];
  }

  /**
   * Transitions an APPROVED outreach record to SYNCING atomically.
   * Prevents race conditions and duplicate concurrent sends.
   */
  async markSyncing(id: string): Promise<OutreachRecord> {
    const current = await this.findById(id);
    if (!current) {
      throw new Error(`Outreach ${id} not found`);
    }

    if (current.status !== OutreachStatus.APPROVED) {
      throw new Error(
        `SAFETY VIOLATION: Cannot mark outreach as SYNCING. Current status is '${current.status}', but must be '${OutreachStatus.APPROVED}'.`
      );
    }

    if (isMemoryFallbackAllowed()) {
      return memoryStore.updateOutreach(id, {
        status: OutreachStatus.SYNCING,
      });
    }

    const res = await dbQuery<OutreachRecord>(
      `UPDATE outreach 
       SET status = $1 
       WHERE id = $2 AND status = $3
       RETURNING *;`,
      [OutreachStatus.SYNCING, id, OutreachStatus.APPROVED]
    );

    if (res.rows.length === 0) {
      throw new Error(`Failed to mark outreach ${id} as SYNCING: concurrent lock or status changed`);
    }

    return res.rows[0];
  }

  /**
   * Transitions a SYNCING outreach record to FAILED.
   */
  async markFailed(id: string, reason: string): Promise<OutreachRecord> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.updateOutreach(id, {
        status: OutreachStatus.FAILED,
        rejection_reason: reason,
      });
    }

    const res = await dbQuery<OutreachRecord>(
      `UPDATE outreach 
       SET status = $1, rejection_reason = $2 
       WHERE id = $3
       RETURNING *;`,
      [OutreachStatus.FAILED, reason, id]
    );

    if (res.rows.length === 0) {
      throw new Error(`Outreach ${id} not found for failure recording`);
    }

    return res.rows[0];
  }

  /**
   * Transitions an APPROVED or SYNCING outreach record to SENT.
   * STRICT SAFETY GATE: Throws an error if outreach is not in APPROVED or SYNCING state.
   */
  async markSent(id: string, instantlyLeadId: string): Promise<OutreachRecord> {
    const current = await this.findById(id);
    if (!current) {
      throw new Error(`Outreach ${id} not found`);
    }

    if (current.status !== OutreachStatus.APPROVED && current.status !== OutreachStatus.SYNCING) {
      throw new Error(
        `SAFETY VIOLATION: Cannot mark outreach as SENT. Current status is '${current.status}', but must be '${OutreachStatus.APPROVED}' or '${OutreachStatus.SYNCING}'. Human approval is strictly mandatory.`
      );
    }

    if (isMemoryFallbackAllowed()) {
      return memoryStore.updateOutreach(id, {
        status: OutreachStatus.SENT,
        sent_at: new Date().toISOString(),
        instantly_lead_id: instantlyLeadId,
      });
    }

    const res = await dbQuery<OutreachRecord>(
      `UPDATE outreach 
       SET status = $1, sent_at = NOW(), instantly_lead_id = $2 
       WHERE id = $3 AND (status = $4 OR status = $5)
       RETURNING *;`,
      [OutreachStatus.SENT, instantlyLeadId, id, OutreachStatus.APPROVED, OutreachStatus.SYNCING]
    );

    if (res.rows.length === 0) {
      throw new Error(`Failed to mark outreach ${id} as sent: state transition precondition failed`);
    }

    return res.rows[0];
  }

  async listPendingApprovals(): Promise<OutreachRecord[]> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.listPendingOutreach();
    }

    const res = await dbQuery<OutreachRecord>(
      `SELECT o.*, 
              json_build_object(
                'id', l.id,
                'full_name', l.full_name,
                'first_name', l.first_name,
                'last_name', l.last_name,
                'email', l.email,
                'company', l.company,
                'job_title', l.job_title,
                'lead_score', l.lead_score,
                'qualification_status', l.qualification_status,
                'priority', l.priority
              ) as lead
       FROM outreach o
       INNER JOIN leads l ON o.lead_id = l.id
       WHERE o.status = $1
       ORDER BY o.created_at DESC;`,
      [OutreachStatus.PENDING_APPROVAL]
    );

    return res.rows;
  }

  async listApproved(): Promise<OutreachRecord[]> {
    if (isMemoryFallbackAllowed()) {
      return Array.from(memoryStore.outreach.values()).filter(
        (o) => o.status === OutreachStatus.APPROVED
      );
    }

    const res = await dbQuery<OutreachRecord>(
      `SELECT o.*, 
              json_build_object(
                'id', l.id,
                'full_name', l.full_name,
                'first_name', l.first_name,
                'last_name', l.last_name,
                'email', l.email,
                'company', l.company,
                'job_title', l.job_title,
                'lead_score', l.lead_score,
                'opted_out', l.opted_out
              ) as lead
       FROM outreach o
       INNER JOIN leads l ON o.lead_id = l.id
       WHERE o.status = $1
       ORDER BY o.created_at ASC;`,
      [OutreachStatus.APPROVED]
    );

    return res.rows;
  }
}
