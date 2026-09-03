import { Campaign, NewCampaign, ICPType } from '@growth/shared';
import { dbQuery, isMemoryFallbackAllowed } from '../client.js';
import { memoryStore } from '../memory-store.js';

export class CampaignsRepository {
  async findById(id: string): Promise<Campaign | null> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.findCampaignById(id);
    }

    const res = await dbQuery<Campaign>(
      'SELECT * FROM campaigns WHERE id = $1 LIMIT 1;',
      [id]
    );
    return res.rows[0] || null;
  }

  async findByInstantlyId(instantlyCampaignId: string): Promise<Campaign | null> {
    if (isMemoryFallbackAllowed()) {
      for (const c of memoryStore.campaigns.values()) {
        if (c.instantly_campaign_id === instantlyCampaignId) return c;
      }
      return null;
    }

    const res = await dbQuery<Campaign>(
      'SELECT * FROM campaigns WHERE instantly_campaign_id = $1 LIMIT 1;',
      [instantlyCampaignId]
    );
    return res.rows[0] || null;
  }

  async create(campaign: NewCampaign): Promise<Campaign> {
    if (isMemoryFallbackAllowed()) {
      return memoryStore.createCampaign(campaign);
    }

    const res = await dbQuery<Campaign>(
      `INSERT INTO campaigns (name, icp_target, instantly_campaign_id, status, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [
        campaign.name,
        campaign.icp_target,
        campaign.instantly_campaign_id || null,
        campaign.status || 'DRAFT',
        JSON.stringify(campaign.settings || {}),
      ]
    );

    return res.rows[0];
  }

  async list(status?: string): Promise<Campaign[]> {
    if (isMemoryFallbackAllowed()) {
      const list = memoryStore.listCampaigns();
      return status ? list.filter((c) => c.status === status) : list;
    }

    let query = 'SELECT * FROM campaigns';
    const params: any[] = [];
    if (status) {
      params.push(status);
      query += ` WHERE status = $1`;
    }
    query += ' ORDER BY created_at DESC;';

    const res = await dbQuery<Campaign>(query, params);
    return res.rows;
  }
}
