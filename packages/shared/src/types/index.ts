/**
 * Domain types & enums for Trading OS Business Automation Engine
 */

export enum LeadStatus {
  NEW = 'NEW',
  RESEARCHING = 'RESEARCHING',
  RESEARCHED = 'RESEARCHED',
  SCORING = 'SCORING',
  SCORED = 'SCORED',
  QUALIFIED = 'QUALIFIED',
  REVIEW = 'REVIEW',
  REJECTED = 'REJECTED',
  OUTREACH_GENERATED = 'OUTREACH_GENERATED',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  REPLIED = 'REPLIED',
  CONVERTED = 'CONVERTED',
  OPTED_OUT = 'OPTED_OUT',
}

export enum QualificationStatus {
  UNQUALIFIED = 'UNQUALIFIED',
  REVIEW = 'REVIEW',
  QUALIFIED = 'QUALIFIED',
  HIGH_PRIORITY = 'HIGH_PRIORITY',
  DISQUALIFIED = 'DISQUALIFIED',
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ICPType {
  QUANT_TRADER = 'QUANT_TRADER',
  PINE_SCRIPT_DEV = 'PINE_SCRIPT_DEV',
  TRADING_EDUCATOR = 'TRADING_EDUCATOR',
  PROP_FIRM_TEAM = 'PROP_FIRM_TEAM',
  OTHER = 'OTHER',
}

export enum OutreachStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum ReplyClassification {
  INTERESTED = 'INTERESTED',
  VERY_INTERESTED = 'VERY_INTERESTED',
  QUESTION = 'QUESTION',
  NOT_NOW = 'NOT_NOW',
  NOT_INTERESTED = 'NOT_INTERESTED',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
  OUT_OF_OFFICE = 'OUT_OF_OFFICE',
  WRONG_PERSON = 'WRONG_PERSON',
  BOUNCE = 'BOUNCE',
  OTHER = 'OTHER',
}

export enum EventType {
  LEAD_IMPORTED = 'LEAD_IMPORTED',
  LEAD_DEDUPLICATED = 'LEAD_DEDUPLICATED',
  RESEARCH_STARTED = 'RESEARCH_STARTED',
  RESEARCH_COMPLETED = 'RESEARCH_COMPLETED',
  AI_ANALYSIS_COMPLETED = 'AI_ANALYSIS_COMPLETED',
  LEAD_QUALIFIED = 'LEAD_QUALIFIED',
  LEAD_REJECTED = 'LEAD_REJECTED',
  OUTREACH_GENERATED = 'OUTREACH_GENERATED',
  OUTREACH_APPROVED = 'OUTREACH_APPROVED',
  OUTREACH_REJECTED = 'OUTREACH_REJECTED',
  OUTREACH_SENT = 'OUTREACH_SENT',
  EMAIL_DELIVERED = 'EMAIL_DELIVERED',
  EMAIL_BOUNCED = 'EMAIL_BOUNCED',
  EMAIL_REPLIED = 'EMAIL_REPLIED',
  REPLY_ANALYZED = 'REPLY_ANALYZED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export interface Campaign {
  id: string;
  name: string;
  icp_target: ICPType;
  instantly_campaign_id?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export type NewCampaign = Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;

export interface Lead {
  id: string;
  campaign_id?: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  company: string;
  job_title: string;
  linkedin_url?: string | null;
  company_url?: string | null;
  location?: string | null;
  industry?: string | null;
  company_size?: string | null;
  source: 'apollo' | 'csv' | 'manual' | 'web';
  source_id?: string | null;
  status: LeadStatus;
  qualification_status: QualificationStatus;
  lead_score: number;
  priority: PriorityLevel;
  opted_out: boolean;
  created_at: string;
  updated_at: string;
  last_contacted_at?: string | null;
  last_replied_at?: string | null;
}

export type NewLead = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;

export interface EvidenceSource {
  title: string;
  url?: string;
  evidence_type: 'verified_fact' | 'reasonable_inference' | 'unknown';
  detail: string;
}

export interface ResearchRecord {
  id: string;
  lead_id: string;
  professional_focus: string;
  trading_related: boolean;
  quant_related: boolean;
  pine_script_related: boolean;
  systematic_trading_related: boolean;
  company_description?: string;
  professional_evidence: EvidenceSource[];
  relevant_projects: string[];
  relevant_public_activity?: string[];
  potential_pain_points: string[];
  potential_use_cases: string[];
  evidence_sources: string[];
  confidence_score: number;
  prompt_version: string;
  researched_at: string;
}

export type NewResearchRecord = Omit<ResearchRecord, 'id' | 'researched_at'>;

export interface AIAnalysisResult {
  id: string;
  lead_id: string;
  qualification: QualificationStatus;
  composite_score: number;
  role_relevance: number;
  company_fit: number;
  problem_relevance: number;
  evidence_strength: number;
  reasoning: string;
  pain_points: string[];
  use_cases: string[];
  confidence: number;
  model_name: string;
  prompt_version: string;
  analyzed_at: string;
}

export type NewAIAnalysisResult = Omit<AIAnalysisResult, 'id' | 'analyzed_at'>;

export interface OutreachRecord {
  id: string;
  lead_id: string;
  campaign_id?: string | null;
  subject: string;
  body_html: string;
  body_text: string;
  personalization_snippet: string;
  prompt_version: string;
  status: OutreachStatus;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  sent_at?: string | null;
  instantly_lead_id?: string | null;
  created_at: string;
}

export type NewOutreachRecord = Omit<OutreachRecord, 'id' | 'created_at'>;

export interface ReplyRecord {
  id: string;
  lead_id: string;
  outreach_id?: string | null;
  raw_reply_text: string;
  classification: ReplyClassification;
  confidence: number;
  summary: string;
  suggested_action: string;
  draft_reply?: string | null;
  prompt_version: string;
  requires_human_action: boolean;
  received_at: string;
  analyzed_at: string;
}

export type NewReplyRecord = Omit<ReplyRecord, 'id' | 'analyzed_at'>;

export interface AuditEvent {
  id: string;
  lead_id?: string | null;
  event_type: EventType;
  metadata?: Record<string, unknown>;
  actor: string;
  created_at: string;
}

export type NewAuditEvent = Omit<AuditEvent, 'id' | 'created_at'>;

export interface WebhookEvent {
  id: string;
  provider: 'instantly' | 'apollo';
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  error?: string | null;
  created_at: string;
}

export interface FunnelMetrics {
  total_leads_discovered: number;
  total_leads_imported: number;
  duplicates_filtered: number;
  total_qualified: number;
  qualification_rate: number;
  outreach_generated: number;
  outreach_approved: number;
  outreach_sent: number;
  emails_delivered: number;
  emails_bounced: number;
  replies_received: number;
  reply_rate: number;
  positive_replies: number;
  positive_reply_rate: number;
  meetings_booked: number;
  opt_outs: number;
}
