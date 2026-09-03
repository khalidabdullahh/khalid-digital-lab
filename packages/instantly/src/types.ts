export interface InstantlyLead {
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  personalization?: string;
  phone?: string;
  website?: string;
  custom_variables?: Record<string, string | number | boolean>;
}

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: number | string; // 1 = active, 2 = paused, 3 = completed
  created_at?: string;
}

export interface InstantlyAddLeadResponse {
  status: string;
  message?: string;
  lead_id?: string;
}

export interface InstantlyWebhookEvent {
  event_type: 'reply_received' | 'email_opened' | 'link_clicked' | 'email_bounced' | 'unsubscribed';
  campaign_id: string;
  campaign_name?: string;
  lead_email: string;
  lead_id?: string;
  reply_text?: string;
  reply_subject?: string;
  timestamp: string;
}
