import {
  LeadsRepository,
  OutreachRepository,
  EventsRepository,
} from '@growth/database';
import { defaultInstantlyClient } from '@growth/instantly';
import { LeadStatus, OutreachStatus, EventType } from '@growth/shared';
import { createCorrelationLogger } from '@growth/logging';

/**
 * Instantly Sync Worker
 * ONLY executes for outreach records that have received explicit Human Approval (status === 'APPROVED').
 * Attempting to sync any outreach in 'PENDING_APPROVAL', 'DRAFT', or 'REJECTED' will fail immediately.
 */
export async function runInstantlySync(limit = 10) {
  const correlationId = `instantly_sync_${Date.now()}`;
  const log = createCorrelationLogger({ correlationId, workerName: 'instantly-sync' });

  log.info({ limit }, 'Starting Instantly Sync Worker (Processing APPROVED Leads Only)');

  const leadsRepo = new LeadsRepository();
  const outreachRepo = new OutreachRepository();
  const eventsRepo = new EventsRepository();
  const instantlyClient = defaultInstantlyClient;

  // Find all approved outreach records
  const approvedList = await outreachRepo.listApproved();
  const eligibleRecords = approvedList.slice(0, limit);

  log.info({ count: eligibleRecords.length }, 'Found approved outreach records to sync');

  let syncedCount = 0;

  for (const item of eligibleRecords) {
    const lead = (item as any).lead;
    if (!lead || lead.opted_out || lead.status === LeadStatus.OPTED_OUT) {
      log.warn({ leadId: lead?.id, email: lead?.email }, 'Skipping sync: lead opted out, suppressed, or missing');
      continue;
    }

    // STRICT HUMAN APPROVAL GATE VERIFICATION
    if (item.status !== OutreachStatus.APPROVED) {
      log.error(
        { outreachId: item.id, status: item.status },
        'SAFETY BREACH ATTEMPT: Non-approved outreach record detected in sync queue. Halting item.'
      );
      continue;
    }

    const leadLog = log.child({ outreachId: item.id, email: lead.email });

    try {
      // 1. Atomically transition from APPROVED -> SYNCING (prevents concurrent race conditions)
      await outreachRepo.markSyncing(item.id);
      leadLog.info('Locked outreach record in SYNCING state');

      const campaignId = item.campaign_id || 'instantly_camp_quant_v1';

      // 2. Perform external Instantly sync
      const response = await instantlyClient.addLeadToCampaign(campaignId, {
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
        company_name: lead.company,
        personalization: item.personalization_snippet,
        custom_variables: {
          job_title: lead.job_title,
          lead_score: lead.lead_score,
          subject: item.subject,
          body: item.body_text,
        },
      });

      // 3. Mark outreach as SENT in database
      await outreachRepo.markSent(item.id, response.lead_id || `instantly_${Date.now()}`);

      // 4. Update lead status
      await leadsRepo.update(lead.id, {
        status: LeadStatus.SENT,
        last_contacted_at: new Date().toISOString(),
      });

      // 5. Audit Log
      await eventsRepo.log({
        lead_id: lead.id,
        event_type: EventType.OUTREACH_SENT,
        metadata: {
          outreach_id: item.id,
          campaign_id: campaignId,
          instantly_lead_id: response.lead_id,
        },
        actor: 'worker:instantly-sync',
      });

      syncedCount++;
      leadLog.info('Successfully synced approved lead to Instantly');
    } catch (err: any) {
      leadLog.error({ error: err }, 'Failed to sync lead to Instantly');
      try {
        await outreachRepo.markFailed(item.id, err?.message || 'Sync failure');
      } catch (failedErr) {
        leadLog.error({ error: failedErr }, 'Could not record failure state');
      }
    }
  }

  log.info({ synced: syncedCount }, 'Instantly Sync Worker Completed');
  return { synced: syncedCount };
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1])) {
  runInstantlySync()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
