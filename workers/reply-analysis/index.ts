import {
  LeadsRepository,
  OutreachRepository,
  RepliesRepository,
  EventsRepository,
} from '@growth/database';
import { ReplyIntelligenceService } from '@growth/gemini';
import { LeadStatus, ReplyClassification, EventType } from '@growth/shared';
import { createCorrelationLogger } from '@growth/logging';

export async function processProspectReply(params: {
  leadEmail: string;
  replyText: string;
  campaignId?: string;
  outreachId?: string;
}) {
  const correlationId = `reply_proc_${Date.now()}`;
  const log = createCorrelationLogger({ correlationId, workerName: 'reply-analysis' });

  log.info({ leadEmail: params.leadEmail }, 'Processing incoming prospect reply');

  const leadsRepo = new LeadsRepository();
  const outreachRepo = new OutreachRepository();
  const repliesRepo = new RepliesRepository();
  const eventsRepo = new EventsRepository();
  const replyIntelligence = new ReplyIntelligenceService();

  const lead = await leadsRepo.findByEmail(params.leadEmail);
  if (!lead) {
    log.error({ email: params.leadEmail }, 'Lead not found for incoming reply');
    throw new Error(`Lead not found for email: ${params.leadEmail}`);
  }

  // Get most recent outreach sent to lead
  let outreachRecord = null;
  if (params.outreachId) {
    outreachRecord = await outreachRepo.findById(params.outreachId);
  } else {
    const list = await outreachRepo.findByLeadId(lead.id);
    outreachRecord = list[0] || null;
  }

  const originalSubject = outreachRecord?.subject || 'Trading OS quantitative platform beta invitation';
  const originalBody = outreachRecord?.body_text || 'Trading OS beta research environment';

  // 1. Analyze Reply via Gemini Reply Intelligence
  const { data: analysis, promptVersion } = await replyIntelligence.analyzeReply({
    originalSubject,
    originalBody,
    replyText: params.replyText,
    prospectName: lead.full_name,
  });

  // 2. Persist to replies table
  const replyRecord = await repliesRepo.create({
    lead_id: lead.id,
    outreach_id: outreachRecord?.id || null,
    raw_reply_text: params.replyText,
    classification: analysis.classification,
    confidence: analysis.confidence,
    summary: analysis.summary,
    suggested_action: analysis.suggested_action,
    draft_reply: analysis.draft_reply,
    prompt_version: promptVersion,
    requires_human_action: analysis.requires_human_action,
    received_at: new Date().toISOString(),
  });

  // 3. Handle Immediate Opt-Out Rule
  if (analysis.classification === ReplyClassification.UNSUBSCRIBE || analysis.opt_out_detected) {
    log.warn({ email: lead.email }, 'Immediate unsubscribe detected. Opting out lead.');
    await leadsRepo.setOptedOut(lead.email);

    await eventsRepo.log({
      lead_id: lead.id,
      event_type: EventType.UNSUBSCRIBED,
      metadata: { reason: analysis.summary },
      actor: 'worker:reply-analysis',
    });
  } else {
    // Update Lead status
    await leadsRepo.update(lead.id, {
      status: LeadStatus.REPLIED,
      last_replied_at: new Date().toISOString(),
    });
  }

  // 4. Audit Log
  await eventsRepo.log({
    lead_id: lead.id,
    event_type: EventType.REPLY_ANALYZED,
    metadata: {
      reply_id: replyRecord.id,
      classification: analysis.classification,
      confidence: analysis.confidence,
      requires_human_action: analysis.requires_human_action,
    },
    actor: 'worker:reply-analysis',
  });

  log.info(
    {
      replyId: replyRecord.id,
      classification: analysis.classification,
      action: analysis.suggested_action,
    },
    'Reply processed and analyzed successfully'
  );

  return replyRecord;
}
