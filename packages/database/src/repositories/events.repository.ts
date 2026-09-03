import { AuditEvent, NewAuditEvent, EventType } from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed } from '../client.js';
import { memoryStore } from '../memory-store.js';

export class EventsRepository {
  async log(event: {
    lead_id?: string | null;
    event_type: EventType;
    metadata?: Record<string, unknown>;
    actor?: string;
  }): Promise<AuditEvent> {
    const newEvent: NewAuditEvent = {
      lead_id: event.lead_id || null,
      event_type: event.event_type,
      metadata: event.metadata || {},
      actor: event.actor || 'system',
    };

    if (isMemoryFallbackAllowed()) {
      return memoryStore.logEvent(newEvent);
    }

    const res = await dbQuery<AuditEvent>(
      `INSERT INTO events (lead_id, event_type, metadata, actor)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [
        newEvent.lead_id,
        newEvent.event_type,
        JSON.stringify(newEvent.metadata || {}),
        newEvent.actor,
      ]
    );

    return res.rows[0];
  }

  async listByLeadId(leadId: string): Promise<AuditEvent[]> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.listEventsByLeadId(leadId);
    }

    const res = await dbQuery<AuditEvent>(
      'SELECT * FROM events WHERE lead_id = $1 ORDER BY created_at DESC;',
      [leadId]
    );
    return res.rows;
  }
}
