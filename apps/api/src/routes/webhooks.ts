import { FastifyPluginAsync } from 'fastify';
import { InstantlyWebhookPayloadSchema, EventType, getEnv } from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed, EventsRepository, LeadsRepository } from '@growth/database';
import { processProspectReply } from '@growth/workers/reply-analysis/index.js';
import { logger } from '@growth/logging';

export const webhooksRoutes: FastifyPluginAsync = async (fastify) => {
  const eventsRepo = new EventsRepository();
  const leadsRepo = new LeadsRepository();

  fastify.post('/webhooks/instantly', async (request, reply) => {
    logger.info({ body: request.body }, 'Received Instantly Webhook event');

    const env = getEnv();
    if (env.INSTANTLY_WEBHOOK_SECRET) {
      const clientSecret =
        request.headers['x-webhook-secret'] ||
        (request.query as any)?.secret ||
        (typeof request.headers['authorization'] === 'string'
          ? request.headers['authorization'].replace(/^Bearer\s+/i, '')
          : '');

      if (clientSecret !== env.INSTANTLY_WEBHOOK_SECRET) {
        logger.warn('Unauthorized Instantly webhook invocation rejected: secret mismatch');
        return reply.status(401).send({ error: 'Unauthorized: Invalid webhook secret' });
      }
    }

    const parsed = InstantlyWebhookPayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      logger.warn({ error: parsed.error.format() }, 'Invalid Instantly webhook payload');
      return reply.status(400).send({ error: 'Invalid payload structure' });
    }

    const payload = parsed.data;
    let webhookRecordId: string | null = null;

    // 1. Store raw webhook for audit trail if DB is connected
    if (!isMemoryFallbackAllowed()) {
      try {
        const res = await dbQuery<{ id: string }>(
          `INSERT INTO webhooks (provider, event_type, payload, processed)
           VALUES ($1, $2, $3, $4)
           RETURNING id;`,
          ['instantly', payload.event_type, JSON.stringify(request.body || {}), false]
        );
        webhookRecordId = res.rows[0]?.id || null;
      } catch (hookErr) {
        logger.error({ error: hookErr }, 'Failed to record webhook in database');
      }
    }

    try {
      if (payload.event_type === 'reply_received' && payload.reply_text) {
        // Process reply through Gemini Reply Intelligence
        await processProspectReply({
          leadEmail: payload.lead_email,
          replyText: payload.reply_text,
          campaignId: payload.campaign_id,
        });
      } else if (payload.event_type === 'unsubscribed') {
        // Immediate opt-out
        await leadsRepo.setOptedOut(payload.lead_email);
        const lead = await leadsRepo.findByEmail(payload.lead_email);
        await eventsRepo.log({
          lead_id: lead?.id,
          event_type: EventType.UNSUBSCRIBED,
          metadata: { provider: 'instantly_webhook' },
          actor: 'webhook:instantly',
        });
      } else if (payload.event_type === 'email_bounced') {
        const lead = await leadsRepo.findByEmail(payload.lead_email);
        await eventsRepo.log({
          lead_id: lead?.id,
          event_type: EventType.EMAIL_BOUNCED,
          metadata: { email: payload.lead_email },
          actor: 'webhook:instantly',
        });
      }

      // Mark webhook processed
      if (webhookRecordId && !isMemoryFallbackAllowed()) {
        await dbQuery(`UPDATE webhooks SET processed = TRUE WHERE id = $1;`, [webhookRecordId]);
      }

      return reply.send({ success: true, received: true });
    } catch (err) {
      logger.error({ error: err, payload }, 'Failed to process webhook event');

      if (webhookRecordId && !isMemoryFallbackAllowed()) {
        await dbQuery(
          `UPDATE webhooks SET processed = FALSE, error = $1 WHERE id = $2;`,
          [(err as Error)?.message, webhookRecordId]
        );
      }

      return reply.status(500).send({ error: 'Webhook processing error' });
    }
  });
};
