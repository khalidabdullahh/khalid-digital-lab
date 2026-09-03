import {
  Lead,
  NewLead,
  ResearchRecord,
  NewResearchRecord,
  AIAnalysisResult,
  NewAIAnalysisResult,
  OutreachRecord,
  NewOutreachRecord,
  ReplyRecord,
  NewReplyRecord,
  AuditEvent,
  NewAuditEvent,
  Campaign,
  NewCampaign,
  LeadStatus,
  QualificationStatus,
  PriorityLevel,
  OutreachStatus,
} from '@growth/shared';
import crypto from 'crypto';

/**
 * In-Memory database store for seamless local simulation and tests
 * when live Supabase credentials are not connected.
 */
class MemoryStore {
  leads: Map<string, Lead> = new Map();
  research: Map<string, ResearchRecord> = new Map();
  aiAnalysis: Map<string, AIAnalysisResult> = new Map();
  outreach: Map<string, OutreachRecord> = new Map();
  replies: Map<string, ReplyRecord> = new Map();
  events: AuditEvent[] = [];
  campaigns: Map<string, Campaign> = new Map();

  constructor() {
    this.initDefaultCampaign();
  }

  private initDefaultCampaign() {
    const id = 'instantly_camp_quant_v1';
    this.campaigns.set(id, {
      id,
      name: 'Trading OS — Alpha Cohort (Quant & Pine Script Devs)',
      icp_target: 'QUANT_TRADER' as any,
      instantly_campaign_id: id,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    });
  }

  // Leads
  findLeadById(id: string): Lead | null {
    return this.leads.get(id) || null;
  }

  findLeadByEmail(email: string): Lead | null {
    const clean = email.toLowerCase().trim();
    for (const lead of this.leads.values()) {
      if (lead.email.toLowerCase().trim() === clean) return lead;
    }
    return null;
  }

  findLeadBySourceId(source: string, sourceId: string): Lead | null {
    for (const lead of this.leads.values()) {
      if (lead.source === source && lead.source_id === sourceId) return lead;
    }
    return null;
  }

  createLead(newLead: NewLead): Lead {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const lead: Lead = {
      ...newLead,
      id,
      email: newLead.email.toLowerCase().trim(),
      created_at: now,
      updated_at: now,
    };
    this.leads.set(id, lead);
    return lead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead {
    const existing = this.leads.get(id);
    if (!existing) throw new Error(`Lead with id ${id} not found in memory store`);
    const updated: Lead = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.leads.set(id, updated);
    return updated;
  }

  listLeads(filters?: {
    status?: LeadStatus;
    qualification_status?: QualificationStatus;
    campaign_id?: string;
    limit?: number;
    offset?: number;
  }): { leads: Lead[]; total: number } {
    let list = Array.from(this.leads.values());

    if (filters?.status) list = list.filter((l) => l.status === filters.status);
    if (filters?.qualification_status) list = list.filter((l) => l.qualification_status === filters.qualification_status);
    if (filters?.campaign_id) list = list.filter((l) => l.campaign_id === filters.campaign_id);

    list.sort((a, b) => b.lead_score - a.lead_score);

    const total = list.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;

    return {
      leads: list.slice(offset, offset + limit),
      total,
    };
  }

  // Research
  findResearchByLeadId(leadId: string): ResearchRecord | null {
    for (const r of this.research.values()) {
      if (r.lead_id === leadId) return r;
    }
    return null;
  }

  createResearch(record: NewResearchRecord): ResearchRecord {
    const id = crypto.randomUUID();
    const research: ResearchRecord = {
      ...record,
      id,
      researched_at: new Date().toISOString(),
    };
    this.research.set(id, research);
    return research;
  }

  // AI Analysis
  findAIAnalysisByLeadId(leadId: string): AIAnalysisResult | null {
    for (const a of this.aiAnalysis.values()) {
      if (a.lead_id === leadId) return a;
    }
    return null;
  }

  createAIAnalysis(record: NewAIAnalysisResult): AIAnalysisResult {
    const id = crypto.randomUUID();
    const analysis: AIAnalysisResult = {
      ...record,
      id,
      analyzed_at: new Date().toISOString(),
    };
    this.aiAnalysis.set(id, analysis);
    return analysis;
  }

  // Outreach
  findOutreachById(id: string): OutreachRecord | null {
    return this.outreach.get(id) || null;
  }

  findOutreachByLeadId(leadId: string): OutreachRecord[] {
    const list: OutreachRecord[] = [];
    for (const o of this.outreach.values()) {
      if (o.lead_id === leadId) list.push(o);
    }
    return list;
  }

  createOutreach(record: NewOutreachRecord): OutreachRecord {
    const id = crypto.randomUUID();
    const outreach: OutreachRecord = {
      ...record,
      id,
      created_at: new Date().toISOString(),
    };
    this.outreach.set(id, outreach);
    return outreach;
  }

  updateOutreach(id: string, updates: Partial<OutreachRecord>): OutreachRecord {
    const existing = this.outreach.get(id);
    if (!existing) throw new Error(`Outreach with id ${id} not found in memory store`);
    const updated: OutreachRecord = {
      ...existing,
      ...updates,
    };
    this.outreach.set(id, updated);
    return updated;
  }

  listPendingOutreach(): OutreachRecord[] {
    const list: OutreachRecord[] = [];
    for (const o of this.outreach.values()) {
      if (o.status === OutreachStatus.PENDING_APPROVAL) list.push(o);
    }
    return list;
  }

  // Replies
  findReplyById(id: string): ReplyRecord | null {
    return this.replies.get(id) || null;
  }

  findRepliesByLeadId(leadId: string): ReplyRecord[] {
    const list: ReplyRecord[] = [];
    for (const r of this.replies.values()) {
      if (r.lead_id === leadId) list.push(r);
    }
    return list;
  }

  createReply(record: NewReplyRecord): ReplyRecord {
    const id = crypto.randomUUID();
    const reply: ReplyRecord = {
      ...record,
      id,
      analyzed_at: new Date().toISOString(),
    };
    this.replies.set(id, reply);
    return reply;
  }

  listActionableReplies(): ReplyRecord[] {
    const list: ReplyRecord[] = [];
    for (const r of this.replies.values()) {
      if (r.requires_human_action) list.push(r);
    }
    return list;
  }

  // Events
  logEvent(event: NewAuditEvent): AuditEvent {
    const audit: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.events.push(audit);
    return audit;
  }

  listEventsByLeadId(leadId: string): AuditEvent[] {
    return this.events.filter((e) => e.lead_id === leadId);
  }

  // Campaigns
  findCampaignById(id: string): Campaign | null {
    return this.campaigns.get(id) || null;
  }

  createCampaign(newCamp: NewCampaign): Campaign {
    const id = crypto.randomUUID();
    const camp: Campaign = {
      ...newCamp,
      id,
      created_at: new Date().toISOString(),
    };
    this.campaigns.set(id, camp);
    return camp;
  }

  listCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }
}

export const memoryStore = new MemoryStore();
