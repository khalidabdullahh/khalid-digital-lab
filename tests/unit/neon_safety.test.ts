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

  it('should REJECT attempting to markSyncing on non-approved outreach', async () => {
    const lead = await leadsRepo.create({
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
      email: `sync.fail.${Date.now()}@test.io`,
      company: 'Test Co',
      job_title: 'Trader',
      source: 'apollo',
      status: LeadStatus.QUALIFIED,
      qualification_status: QualificationStatus.QUALIFIED,
      lead_score: 80,
      priority: PriorityLevel.HIGH,
      opted_out: false,
    });

    const pendingDraft = await outreachRepo.create({
      lead_id: lead.id,
      subject: 'Subject',
      body_text: 'Body...',
      body_html: '<p>Body</p>',
      personalization_snippet: 'Snippet',
      prompt_version: 'v1.0.0',
      status: OutreachStatus.PENDING_APPROVAL,
    });

    await expect(outreachRepo.markSyncing(pendingDraft.id)).rejects.toThrow(/SAFETY VIOLATION/);

    const rejectedDraft = await outreachRepo.reject(pendingDraft.id, 'Operator rejected');
    expect(rejectedDraft.status).toBe(OutreachStatus.REJECTED);

    await expect(outreachRepo.markSyncing(rejectedDraft.id)).rejects.toThrow(/SAFETY VIOLATION/);
  });

  it('should properly handle atomic SYNCING -> SENT transition for APPROVED outreach', async () => {
    const lead = await leadsRepo.create({
      first_name: 'Approved',
      last_name: 'Sync',
      full_name: 'Approved Sync',
      email: `approved.sync.${Date.now()}@test.io`,
      company: 'Quant Alpha',
      job_title: 'Quant Trader',
      source: 'apollo',
      status: LeadStatus.QUALIFIED,
      qualification_status: QualificationStatus.QUALIFIED,
      lead_score: 88,
      priority: PriorityLevel.HIGH,
      opted_out: false,
    });

    const draft = await outreachRepo.create({
      lead_id: lead.id,
      subject: 'Subject',
      body_text: 'Body',
      body_html: '<p>Body</p>',
      personalization_snippet: 'Snippet',
      prompt_version: 'v1.0.0',
      status: OutreachStatus.PENDING_APPROVAL,
    });

    // 1. Approve
    await outreachRepo.approve(draft.id, 'khalid_operator');

    // 2. Lock to SYNCING
    const syncing = await outreachRepo.markSyncing(draft.id);
    expect(syncing.status).toBe(OutreachStatus.SYNCING);

    // 3. Mark SENT
    const sent = await outreachRepo.markSent(draft.id, 'instantly_live_999');
    expect(sent.status).toBe(OutreachStatus.SENT);
    expect(sent.sent_at).toBeDefined();
    expect(sent.instantly_lead_id).toBe('instantly_live_999');
  });

  it('should normalize email to lowercase trimmed and enforce deduplication', async () => {
    const email = `TRADER.DEDUPE.${Date.now()}@EXAMPLE.COM`;
    const lead1 = await leadsRepo.create({
      first_name: 'Trader',
      last_name: 'One',
      full_name: 'Trader One',
      email: email,
      company: 'Dedupe Corp',
      job_title: 'Quant',
      source: 'apollo',
      status: LeadStatus.NEW,
      qualification_status: QualificationStatus.UNQUALIFIED,
      lead_score: 0,
      priority: PriorityLevel.MEDIUM,
      opted_out: false,
    });

    expect(lead1.email).toBe(email.toLowerCase().trim());

    const found = await leadsRepo.findByEmail(`  ${email.toUpperCase()}  `);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(lead1.id);
  });

  it('should immediately set opted_out = true and status = OPTED_OUT when unsubscribed', async () => {
    const email = `unsub.${Date.now()}@optout.io`;
    const lead = await leadsRepo.create({
      first_name: 'Opt',
      last_name: 'Out',
      full_name: 'Opt Out',
      email,
      company: 'Optout LLC',
      job_title: 'Trader',
      source: 'apollo',
      status: LeadStatus.SENT,
      qualification_status: QualificationStatus.QUALIFIED,
      lead_score: 75,
      priority: PriorityLevel.HIGH,
      opted_out: false,
    });

    await leadsRepo.setOptedOut(email);

    const updated = await leadsRepo.findById(lead.id);
    expect(updated?.opted_out).toBe(true);
    expect(updated?.status).toBe(LeadStatus.OPTED_OUT);
  });
});
