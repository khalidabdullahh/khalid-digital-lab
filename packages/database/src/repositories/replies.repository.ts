import { ReplyRecord, NewReplyRecord } from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed } from '../client.js';
import { memoryStore } from '../memory-store.js';

export class RepliesRepository {
  async findById(id: string): Promise<ReplyRecord | null> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findReplyById(id);
    }

    const res = await dbQuery<ReplyRecord>(
      'SELECT * FROM replies WHERE id = $1 LIMIT 1;',
      [id]
    );
    return res.rows[0] || null;
  }

  async findByLeadId(leadId: string): Promise<ReplyRecord[]> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findRepliesByLeadId(leadId);
    }

    const res = await dbQuery<ReplyRecord>(
      'SELECT * FROM replies WHERE lead_id = $1 ORDER BY received_at DESC;',
      [leadId]
    );
    return res.rows;
  }

  async create(reply: NewReplyRecord): Promise<ReplyRecord> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.createReply(reply);
    }

    const res = await dbQuery<ReplyRecord>(
      `INSERT INTO replies (
        lead_id, outreach_id, raw_reply_text, classification,
        confidence, summary, suggested_action, draft_reply,
        prompt_version, requires_human_action
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10
      ) RETURNING *;`,
      [
        reply.lead_id,
        reply.outreach_id || null,
        reply.raw_reply_text,
        reply.classification,
        reply.confidence,
        reply.summary,
        reply.suggested_action,
        reply.draft_reply || null,
        reply.prompt_version || 'v1',
        reply.requires_human_action ?? true,
      ]
    );

    return res.rows[0];
  }

  async listActionable(): Promise<ReplyRecord[]> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.listActionableReplies();
    }

    const res = await dbQuery<ReplyRecord>(
      `SELECT r.*, 
              json_build_object(
                'id', l.id,
                'full_name', l.full_name,
                'email', l.email,
                'company', l.company,
                'job_title', l.job_title
              ) as lead
       FROM replies r
       INNER JOIN leads l ON r.lead_id = l.id
       WHERE r.requires_human_action = TRUE
       ORDER BY r.received_at DESC;`
    );

    return res.rows;
  }

  async markResolved(id: string): Promise<ReplyRecord> {
    if (isMemoryFallbackAllowed()) {
      const existing = memoryStore.findReplyById(id);
      if (!existing) throw new Error(`Reply ${id} not found`);
      const updated = { ...existing, requires_human_action: false };
      memoryStore.replies.set(id, updated);
      return updated;
    }

    const res = await dbQuery<ReplyRecord>(
      `UPDATE replies SET requires_human_action = FALSE WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new Error(`Reply ${id} not found for resolution`);
    }

    return res.rows[0];
  }
}
