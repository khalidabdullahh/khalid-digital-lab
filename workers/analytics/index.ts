import { dbQuery, isMemoryFallbackAllowed, memoryStore } from '@growth/database';
import { FunnelMetrics, QualificationStatus, OutreachStatus, ReplyClassification } from '@growth/shared';
import { logger } from '@growth/logging';

export async function calculateFunnelMetrics(): Promise<FunnelMetrics> {
  logger.info('Calculating Funnel & Growth Analytics');

  if (isMemoryFallbackAllowed()) {
    const totalLeads = memoryStore.leads.size;
    let qualifiedLeads = 0;
    let optedOutCount = 0;

    for (const l of memoryStore.leads.values()) {
      if (
        l.qualification_status === QualificationStatus.QUALIFIED ||
        l.qualification_status === QualificationStatus.HIGH_PRIORITY
      ) {
        qualifiedLeads++;
      }
      if (l.opted_out) optedOutCount++;
    }

    const totalOutreach = memoryStore.outreach.size;
    let approvedOutreach = 0;
    let sentOutreach = 0;

    for (const o of memoryStore.outreach.values()) {
      if (o.status === OutreachStatus.APPROVED || o.status === OutreachStatus.SENT) approvedOutreach++;
      if (o.status === OutreachStatus.SENT) sentOutreach++;
    }

    const totalReplies = memoryStore.replies.size;
    let positiveReplies = 0;
    for (const r of memoryStore.replies.values()) {
      if (
        r.classification === ReplyClassification.INTERESTED ||
        r.classification === ReplyClassification.VERY_INTERESTED
      ) {
        positiveReplies++;
      }
    }

    const qualificationRate = totalLeads > 0 ? Number(((qualifiedLeads / totalLeads) * 100).toFixed(1)) : 0;
    const replyRate = sentOutreach > 0 ? Number(((totalReplies / sentOutreach) * 100).toFixed(1)) : 0;
    const positiveReplyRate = totalReplies > 0 ? Number(((positiveReplies / totalReplies) * 100).toFixed(1)) : 0;

    return {
      total_leads_discovered: totalLeads,
      total_leads_imported: totalLeads,
      duplicates_filtered: 0,
      total_qualified: qualifiedLeads,
      qualification_rate: qualificationRate,
      outreach_generated: totalOutreach,
      outreach_approved: approvedOutreach,
      outreach_sent: sentOutreach,
      emails_delivered: sentOutreach,
      emails_bounced: 0,
      replies_received: totalReplies,
      reply_rate: replyRate,
      positive_replies: positiveReplies,
      positive_reply_rate: positiveReplyRate,
      meetings_booked: 0,
      opt_outs: optedOutCount,
    };
  }

  try {
    const [totalLeadsRes, qualifiedLeadsRes, optedOutRes, totalOutreachRes, approvedOutreachRes, sentOutreachRes, totalRepliesRes, positiveRepliesRes] = await Promise.all([
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM leads;'),
      dbQuery<{ count: string }>(`SELECT COUNT(*) as count FROM leads WHERE qualification_status IN ('QUALIFIED', 'HIGH_PRIORITY');`),
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM leads WHERE opted_out = TRUE;'),
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM outreach;'),
      dbQuery<{ count: string }>(`SELECT COUNT(*) as count FROM outreach WHERE status IN ('APPROVED', 'SENT');`),
      dbQuery<{ count: string }>(`SELECT COUNT(*) as count FROM outreach WHERE status = 'SENT';`),
      dbQuery<{ count: string }>('SELECT COUNT(*) as count FROM replies;'),
      dbQuery<{ count: string }>(`SELECT COUNT(*) as count FROM replies WHERE classification IN ('INTERESTED', 'VERY_INTERESTED');`),
    ]);

    const total = parseInt(totalLeadsRes.rows[0]?.count || '0', 10);
    const qualified = parseInt(qualifiedLeadsRes.rows[0]?.count || '0', 10);
    const optedOut = parseInt(optedOutRes.rows[0]?.count || '0', 10);
    const outreachGen = parseInt(totalOutreachRes.rows[0]?.count || '0', 10);
    const approved = parseInt(approvedOutreachRes.rows[0]?.count || '0', 10);
    const sent = parseInt(sentOutreachRes.rows[0]?.count || '0', 10);
    const replies = parseInt(totalRepliesRes.rows[0]?.count || '0', 10);
    const positive = parseInt(positiveRepliesRes.rows[0]?.count || '0', 10);

    const qualificationRate = total > 0 ? Number(((qualified / total) * 100).toFixed(1)) : 0;
    const replyRate = sent > 0 ? Number(((replies / sent) * 100).toFixed(1)) : 0;
    const positiveReplyRate = replies > 0 ? Number(((positive / replies) * 100).toFixed(1)) : 0;

    const metrics: FunnelMetrics = {
      total_leads_discovered: total,
      total_leads_imported: total,
      duplicates_filtered: 0,
      total_qualified: qualified,
      qualification_rate: qualificationRate,
      outreach_generated: outreachGen,
      outreach_approved: approved,
      outreach_sent: sent,
      emails_delivered: sent,
      emails_bounced: 0,
      replies_received: replies,
      reply_rate: replyRate,
      positive_replies: positive,
      positive_reply_rate: positiveReplyRate,
      meetings_booked: 0,
      opt_outs: optedOut,
    };

    logger.info({ metrics }, 'Funnel metrics calculated successfully from Neon PostgreSQL');
    return metrics;
  } catch (err) {
    logger.error({ error: err }, 'Failed to calculate funnel metrics from Neon PostgreSQL');
    throw err;
  }
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1])) {
  calculateFunnelMetrics()
    .then((metrics) => {
      console.log('Funnel Metrics Result:', JSON.stringify(metrics, null, 2));
      process.exit(0);
    })
    .catch(() => process.exit(1));
}
