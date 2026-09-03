import { ApolloClient, defaultApolloClient } from '@growth/apollo';
import { LeadsRepository, EventsRepository } from '@growth/database';
import { EventType, ICPType, LeadStatus } from '@growth/shared';
import { logger, createCorrelationLogger } from '@growth/logging';

export async function runLeadDiscovery(options?: {
  keywords?: string;
  titles?: string[];
  limit?: number;
  campaignId?: string;
}) {
  const correlationId = `discovery_${Date.now()}`;
  const log = createCorrelationLogger({ correlationId, workerName: 'lead-discovery' });

  log.info('Starting Lead Discovery Worker');

  const apollo = defaultApolloClient;
  const leadsRepo = new LeadsRepository();
  const eventsRepo = new EventsRepository();

  const searchTitles = options?.titles || [
    'Quantitative Researcher',
    'Algorithmic Trader',
    'Pine Script Developer',
    'Systematic Trader',
    'Head of Quantitative Strategy',
  ];

  try {
    const rawLeads = await apollo.searchAndNormalize(
      {
        q_keywords: options?.keywords || 'trading backtest hmm monte carlo',
        person_titles: searchTitles,
        per_page: options?.limit || 10,
      },
      options?.campaignId
    );

    log.info({ count: rawLeads.length }, 'Discovered prospects from Apollo');

    let importedCount = 0;
    let duplicateCount = 0;

    for (const leadData of rawLeads) {
      // 1. Deduplication check by email
      const existingEmail = await leadsRepo.findByEmail(leadData.email);
      if (existingEmail) {
        log.debug({ email: leadData.email }, 'Skipping duplicate email');
        duplicateCount++;
        continue;
      }

      // 2. Deduplication check by source_id
      if (leadData.source_id) {
        const existingSource = await leadsRepo.findBySourceId('apollo', leadData.source_id);
        if (existingSource) {
          log.debug({ sourceId: leadData.source_id }, 'Skipping duplicate source_id');
          duplicateCount++;
          continue;
        }
      }

      // 3. Insert Lead
      const created = await leadsRepo.create(leadData);
      importedCount++;

      // 4. Audit Log
      await eventsRepo.log({
        lead_id: created.id,
        event_type: EventType.LEAD_IMPORTED,
        metadata: {
          source: 'apollo',
          source_id: leadData.source_id,
          job_title: leadData.job_title,
          company: leadData.company,
        },
        actor: 'worker:lead-discovery',
      });
    }

    log.info(
      { imported: importedCount, duplicates: duplicateCount },
      'Lead Discovery Worker Completed Successfully'
    );

    return { imported: importedCount, duplicates: duplicateCount };
  } catch (err) {
    log.error({ error: err }, 'Lead Discovery Worker failed');
    throw err;
  }
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1])) {
  runLeadDiscovery()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
