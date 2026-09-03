import { z } from 'zod';
import {
  LeadStatus,
  QualificationStatus,
  PriorityLevel,
  ICPType,
  OutreachStatus,
  ReplyClassification,
  EventType,
} from '../types/index.js';

/**
 * Zod schema for Lead validation
 */
export const LeadSchema = z.object({
  id: z.string().uuid().optional(),
  campaign_id: z.string().uuid().nullable().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required'),
  job_title: z.string().min(1, 'Job title is required'),
  linkedin_url: z.string().url().nullable().optional(),
  company_url: z.string().url().nullable().optional(),
  location: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  company_size: z.string().nullable().optional(),
  source: z.enum(['apollo', 'csv', 'manual', 'web']).default('apollo'),
  source_id: z.string().nullable().optional(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  qualification_status: z.nativeEnum(QualificationStatus).default(QualificationStatus.UNQUALIFIED),
  lead_score: z.number().int().min(0).max(100).default(0),
  priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
  opted_out: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  last_contacted_at: z.string().nullable().optional(),
  last_replied_at: z.string().nullable().optional(),
});

export const NewLeadSchema = LeadSchema.omit({ id: true, created_at: true, updated_at: true });

/**
 * Zod schema for Evidence Source validation
 */
export const EvidenceSourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  evidence_type: z.enum(['verified_fact', 'reasonable_inference', 'unknown']),
  detail: z.string().min(1),
});

/**
 * Zod schema for Research Agent structured Gemini response
 */
export const ResearchOutputSchema = z.object({
  professional_focus: z.string().min(5),
  trading_related: z.boolean(),
  quant_related: z.boolean(),
  pine_script_related: z.boolean(),
  systematic_trading_related: z.boolean(),
  company_description: z.string().optional(),
  professional_evidence: z.array(EvidenceSourceSchema).min(1),
  relevant_projects: z.array(z.string()).default([]),
  relevant_public_activity: z.array(z.string()).default([]),
  potential_pain_points: z.array(z.string()).default([]),
  potential_use_cases: z.array(z.string()).default([]),
  evidence_sources: z.array(z.string()).default([]),
  confidence_score: z.number().min(0).max(1),
});

/**
 * Zod schema for Lead Analyzer structured Gemini response
 */
export const LeadAnalyzerOutputSchema = z.object({
  qualification: z.enum(['UNQUALIFIED', 'REVIEW', 'QUALIFIED', 'HIGH_PRIORITY', 'DISQUALIFIED']),
  composite_score: z.number().int().min(0).max(100),
  role_relevance: z.number().int().min(0).max(100),
  company_fit: z.number().int().min(0).max(100),
  problem_relevance: z.number().int().min(0).max(100),
  evidence_strength: z.number().int().min(0).max(100),
  reasoning: z.string().min(10),
  pain_points: z.array(z.string()),
  use_cases: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

/**
 * Zod schema for Pain Point Detector structured Gemini response
 */
export const PainPointDetectorOutputSchema = z.object({
  identified_pain_points: z.array(
    z.object({
      pain_category: z.enum([
        'regime_instability',
        'overfitting_bias',
        'walk_forward_validation',
        'monte_carlo_drawdown',
        'pine_script_export',
        'manual_backtest_logging',
        'slippage_stress_testing',
        'other',
      ]),
      description: z.string().min(5),
      evidence_basis: z.string().min(5),
      confidence: z.number().min(0).max(1),
    })
  ),
  overall_urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

/**
 * Zod schema for Personalization Engine structured Gemini response
 */
export const PersonalizationOutputSchema = z.object({
  icebreaker_hook: z.string().min(10).max(280),
  relevance_angle: z.string().min(5),
  evidence_cited: z.string().min(5),
  tone_check_passed: z.boolean(),
  confidence: z.number().min(0).max(1),
});

/**
 * Zod schema for Outreach Writer structured Gemini response
 */
export const OutreachWriterOutputSchema = z.object({
  subject: z.string().min(5).max(100),
  body_text: z.string().min(30).max(1000),
  body_html: z.string().min(30).max(1500),
  personalization_snippet: z.string().min(5),
  word_count: z.number().int().max(150),
  call_to_action: z.string().min(5),
});

/**
 * Zod schema for Reply Intelligence structured Gemini response
 */
export const ReplyIntelligenceOutputSchema = z.object({
  classification: z.nativeEnum(ReplyClassification),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(5),
  suggested_action: z.string().min(5),
  draft_reply: z.string().nullable().optional(),
  requires_human_action: z.boolean(),
  opt_out_detected: z.boolean(),
});

/**
 * Zod schema for Instantly Webhook payload
 */
export const InstantlyWebhookPayloadSchema = z.object({
  event_type: z.string(),
  campaign_id: z.string().optional(),
  campaign_name: z.string().optional(),
  lead_email: z.string().email(),
  lead_id: z.string().optional(),
  reply_text: z.string().optional(),
  reply_subject: z.string().optional(),
  timestamp: z.string().optional(),
  email_account: z.string().optional(),
});
