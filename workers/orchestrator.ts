import { runLeadDiscovery } from './lead-discovery/index.js';
import { runLeadResearch } from './lead-research/index.js';
import { runLeadScoring } from './lead-scoring/index.js';
import { runOutreachGeneration } from './outreach-generation/index.js';
import { calculateFunnelMetrics } from './analytics/index.js';
import { logger } from '@growth/logging';

export interface PipelineOptions {
  discoveryLimit?: number;
  batchSize?: number;
}

/**
 * Master Controlled Pipeline Orchestrator
 *
 * STRICT SAFETY PIPELINE:
 * Apollo Discovery -> Neon Database -> Research -> Gemini Analysis -> Lead Scoring -> Outreach Generation -> Store as PENDING_APPROVAL -> STOP.
 *
 * This runner NEVER sends emails or synchronizes to Instantly automatically.
 * All outreach remains in PENDING_APPROVAL awaiting explicit Human-in-the-Loop review.
 */
export async function runControlledPipeline(options?: PipelineOptions) {
  const startTime = Date.now();
  const batchSize = options?.batchSize || 10;
  const discoveryLimit = options?.discoveryLimit || 10;

  logger.info({ batchSize, discoveryLimit }, '🚀 Starting Controlled Pipeline Execution (Safety Mode: Active)');

  try {
    // Step 1: Discover & Ingest Leads from Apollo (or Mock in dev) -> Neon DB
    logger.info('--- [Step 1/5: Lead Discovery & Ingestion] ---');
    const discoveryResult = await runLeadDiscovery({ limit: discoveryLimit });
    logger.info({ discoveryResult }, 'Step 1 Complete: Leads persisted to database in NEW status');

    // Step 2: Extract Verifiable Research via Gemini Research Agent -> Neon DB
    logger.info('--- [Step 2/5: Gemini AI Research & Fact Extraction] ---');
    const researchResult = await runLeadResearch(batchSize);
    logger.info({ researchResult }, 'Step 2 Complete: Research dossiers persisted in RESEARCHED status');

    // Step 3: Compute Deterministic + AI Qualification Scoring -> Neon DB
    logger.info('--- [Step 3/5: Lead Scoring & ICP Qualification] ---');
    const scoringResult = await runLeadScoring(batchSize);
    logger.info({ scoringResult }, 'Step 3 Complete: Qualification scores & priority levels assigned');

    // Step 4: Generate Personalized Outreach Drafts -> Neon DB (Status: PENDING_APPROVAL)
    logger.info('--- [Step 4/5: Gemini Personalization & Cold Outreach Drafting] ---');
    const outreachResult = await runOutreachGeneration(batchSize);
    logger.info(
      { outreachResult },
      'Step 4 Complete: Cold email drafts created and queued in PENDING_APPROVAL status'
    );

    // Step 5: Recalculate Funnel Analytics
    logger.info('--- [Step 5/5: Recalculating Funnel & Conversion Analytics] ---');
    const metrics = await calculateFunnelMetrics();
    logger.info({ metrics }, 'Step 5 Complete: Telemetry updated');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(
      { durationSeconds: duration },
      '🛑 Pipeline Execution Complete. Outreach is strictly held in PENDING_APPROVAL awaiting operator review in the dashboard.'
    );

    return {
      success: true,
      durationSeconds: duration,
      metrics,
    };
  } catch (err) {
    logger.error({ error: err }, '❌ Pipeline Execution Failed');
    throw err;
  }
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1])) {
  const isDaemonAttempt = process.argv.includes('--daemon') || process.argv.includes('-d');

  if (isDaemonAttempt) {
    logger.warn('⚠️ Autonomous daemon execution is permanently LOCKED for safety. Use "npm run pipeline" for controlled one-shot execution.');
    process.exit(0);
  }

  runControlledPipeline()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
