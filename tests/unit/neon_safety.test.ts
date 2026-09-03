import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  LeadsRepository,
  OutreachRepository,
  isMemoryFallbackAllowed,
} from '../../packages/database/src/index.js';
import {
  LeadStatus,
  QualificationStatus,
  PriorityLevel,
  OutreachStatus,
  resetEnvCache,
} from '../../packages/shared/src/index.js';

describe('Neon Database & Production Safety Isolation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvCache();
  });

  it('should forbid memory fallback when in production mode', () => {
    process.env.APP_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:pass@ep-xyz.neon.tech/neondb';
    resetEnvCache();

    expect(isMemoryFallbackAllowed()).toBe(false);
  });

  it('should allow memory fallback ONLY during isolated unit tests with test env', () => {
    process.env.APP_ENV = 'test';
    process.env.DATABASE_URL = '';
    resetEnvCache();

    expect(isMemoryFallbackAllowed()).toBe(true);
  });
});

describe('Human Approval Enforcement & State Transition Safety', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, APP_ENV: 'test', DATABASE_URL: '' };
    resetEnvCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvCache();
  });

  const outreachRepo = new OutreachRepository();
  const leadsRepo = new LeadsRepository();

  it('should allow approval transition from PENDING_APPROVAL to APPROVED', async () => {
    const lead = await leadsRepo.create({
      first_name: 'Alex',
      last_name: 'Quant',
      full_name: 'Alex Quant',
      email: `alex.quant.${Date.now()}@test.io`,
      company: 'Quant Capital',
      job_title: 'Quant Trader',
      source: 'apollo',
      status: LeadStatus.QUALIFIED,
      qualification_status: QualificationStatus.HIGH_PRIORITY,
      lead_score: 92,
      priority: PriorityLevel.URGENT,
      opted_out: false,
    });

    const draft = await outreachRepo.create({
      lead_id: lead.id,
      subject: 'HMM regime stress-testing for Quant Capital',
      body_text: 'Hi Alex, testing Trading OS...',
      body_html: '<p>Hi Alex...</p>',
      personalization_snippet: 'Noticed your quant work.',
      prompt_version: 'v1.0.0',
      status: OutreachStatus.PENDING_APPROVAL,
    });

    expect(draft.status).toBe(OutreachStatus.PENDING_APPROVAL);

    // Approve
    const approved = await outreachRepo.approve(draft.id, 'khalid_operator');
    expect(approved.status).toBe(OutreachStatus.APPROVED);
    expect(approved.approved_by).toBe('khalid_operator');
    expect(approved.approved_at).toBeDefined();
  });

  it('should REJECT attempting to mark unapproved outreach as SENT', async () => {
    const lead = await leadsRepo.create({
      first_name: 'Unapproved',
      last_name: 'Prospect',
      full_name: 'Unapproved Prospect',
      email: `unapproved.${Date.now()}@test.io`,
      company: 'Test Co',
      job_title: 'Trader',
      source: 'apollo',
      status: LeadStatus.QUALIFIED,
      qualification_status: QualificationStatus.QUALIFIED,
      lead_score: 75,
      priority: PriorityLevel.HIGH,
      opted_out: false,
    });

    const pendingDraft = await outreachRepo.create({
      lead_id: lead.id,
      subject: 'Unapproved Subject',
      body_text: 'Body...',
      body_html: '<p>Body</p>',
      personalization_snippet: 'Snippet',
      prompt_version: 'v1.0.0',
      status: OutreachStatus.PENDING_APPROVAL,
    });

    // Attempting markSent on PENDING_APPROVAL must throw a safety violation error!
    await expect(
      outreachRepo.markSent(pendingDraft.id, 'instantly_sim_123')
    ).rejects.toThrow(/SAFETY VIOLATION/);
  });
});
