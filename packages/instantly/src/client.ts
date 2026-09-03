import { InstantlyLead, InstantlyCampaign, InstantlyAddLeadResponse } from './types.js';
import { getEnv } from '@growth/shared';
import { logger } from '@growth/logging';

export class InstantlyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    const env = getEnv();
    this.apiKey = apiKey || env.INSTANTLY_API_KEY || '';
    this.baseUrl = baseUrl || env.INSTANTLY_BASE_URL || 'https://api.instantly.ai/api/v2';
  }

  /**
   * Adds an approved lead to an Instantly campaign
   */
  async addLeadToCampaign(
    campaignId: string,
    lead: InstantlyLead
  ): Promise<InstantlyAddLeadResponse> {
    if (!this.apiKey || this.apiKey === 'your_instantly_api_key_here') {
      logger.warn(
        { email: lead.email, campaignId },
        'Instantly API key not configured, simulating successful lead sync'
      );
      return {
        status: 'success',
        lead_id: `instantly_sim_${Date.now()}`,
        message: 'Lead simulated in development mode',
      };
    }

    const url = `${this.baseUrl}/campaigns/${campaignId}/leads`;
    const payload = {
      email: lead.email,
      first_name: lead.first_name,
      last_name: lead.last_name,
      company_name: lead.company_name,
      personalization: lead.personalization,
      custom_variables: lead.custom_variables,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Instantly add lead failed (HTTP ${res.status}): ${errText}`);
      }

      const data = (await res.json()) as InstantlyAddLeadResponse;
      return data;
    } catch (err) {
      logger.error({ error: err, email: lead.email, campaignId }, 'Failed to add lead to Instantly');
      throw err;
    }
  }

  /**
   * Fetches active Instantly campaigns
   */
  async listCampaigns(): Promise<InstantlyCampaign[]> {
    if (!this.apiKey || this.apiKey === 'your_instantly_api_key_here') {
      return [
        {
          id: 'instantly_camp_quant_v1',
          name: 'Trading OS — Beta Cohort A (Quant Traders)',
          status: 1,
        },
        {
          id: 'instantly_camp_pine_v1',
          name: 'Trading OS — Pine Script Developers Cohort',
          status: 1,
        },
      ];
    }

    const url = `${this.baseUrl}/campaigns?limit=50`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Instantly list campaigns failed: ${await res.text()}`);
      }

      const data = (await res.json()) as any;
      return (Array.isArray(data) ? data : data.items || []) as InstantlyCampaign[];
    } catch (err) {
      logger.error({ error: err }, 'Failed to list Instantly campaigns');
      throw err;
    }
  }
}

export const defaultInstantlyClient = new InstantlyClient();
