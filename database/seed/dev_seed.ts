import { LeadsRepository, CampaignsRepository, EventsRepository } from '@growth/database';
import { ICPType, LeadStatus, QualificationStatus, PriorityLevel, EventType, NewLead } from '@growth/shared';
import { logger } from '@growth/logging';

export async function seedDatabase() {
  logger.info('Starting Development Database Seed');
  const campaignsRepo = new CampaignsRepository();
  const leadsRepo = new LeadsRepository();
  const eventsRepo = new EventsRepository();

  try {
    // 1. Create Primary Campaign
    const campaign = await campaignsRepo.create({
      name: 'Trading OS — Alpha Cohort 1 (Quant & Pine Developers)',
      icp_target: ICPType.QUANT_TRADER,
      status: 'ACTIVE',
      instantly_campaign_id: 'instantly_camp_quant_v1',
      settings: {
        daily_limit: 15,
        target_relevance_threshold: 75,
      },
    });

    logger.info({ campaignId: campaign.id }, 'Created sample campaign');

    // 2. Sample Leads across all 4 ICP segments
    const sampleLeads: NewLead[] = [
      {
        campaign_id: campaign.id,
        first_name: 'Marcus',
        last_name: 'Vance',
        full_name: 'Marcus Vance',
        email: 'marcus.vance@vancetrading.com',
        company: 'Vance Trading Labs',
        job_title: 'Lead Quantitative Researcher',
        linkedin_url: 'https://linkedin.com/in/marcus-vance-quant',
        company_url: 'https://vancetrading.com',
        location: 'Chicago, IL',
        industry: 'Quantitative Hedge Fund',
        company_size: '11-50',
        source: 'apollo',
        source_id: 'seed_lead_1',
        status: LeadStatus.NEW,
        qualification_status: QualificationStatus.UNQUALIFIED,
        lead_score: 0,
        priority: PriorityLevel.HIGH,
        opted_out: false,
        last_contacted_at: null,
        last_replied_at: null,
      },
      {
        campaign_id: campaign.id,
        first_name: 'Elena',
        last_name: 'Rostova',
        full_name: 'Elena Rostova',
        email: 'elena@pinequant.io',
        company: 'PineQuant Analytics',
        job_title: 'Pine Script v5 & TradingView Developer',
        linkedin_url: 'https://linkedin.com/in/elena-rostova-pine',
        company_url: 'https://pinequant.io',
        location: 'London, UK',
        industry: 'Financial Technology',
        company_size: '1-10',
        source: 'apollo',
        source_id: 'seed_lead_2',
        status: LeadStatus.NEW,
        qualification_status: QualificationStatus.UNQUALIFIED,
        lead_score: 0,
        priority: PriorityLevel.HIGH,
        opted_out: false,
        last_contacted_at: null,
        last_replied_at: null,
      },
      {
        campaign_id: campaign.id,
        first_name: 'Julian',
        last_name: 'Thorne',
        full_name: 'Julian Thorne',
        email: 'j.thorne@alphaprop.ch',
        company: 'AlphaProp AG',
        job_title: 'Head of Quantitative Strategy',
        linkedin_url: 'https://linkedin.com/in/julian-thorne-quant',
        company_url: 'https://alphaprop.ch',
        location: 'Zurich, Switzerland',
        industry: 'Proprietary Trading Desk',
        company_size: '11-50',
        source: 'apollo',
        source_id: 'seed_lead_3',
        status: LeadStatus.NEW,
        qualification_status: QualificationStatus.UNQUALIFIED,
        lead_score: 0,
        priority: PriorityLevel.HIGH,
        opted_out: false,
        last_contacted_at: null,
        last_replied_at: null,
      },
      {
        campaign_id: campaign.id,
        first_name: 'Sarah',
        last_name: 'Lin',
        full_name: 'Sarah Lin',
        email: 'sarah@quantcourse.dev',
        company: 'Systematic Quant Academy',
        job_title: 'Founder & Systematic Trading Educator',
        linkedin_url: 'https://linkedin.com/in/sarah-lin-quant-edu',
        company_url: 'https://quantcourse.dev',
        location: 'San Francisco, CA',
        industry: 'Financial Education',
        company_size: '1-10',
        source: 'web',
        source_id: 'seed_lead_4',
        status: LeadStatus.NEW,
        qualification_status: QualificationStatus.UNQUALIFIED,
        lead_score: 0,
        priority: PriorityLevel.MEDIUM,
        opted_out: false,
        last_contacted_at: null,
        last_replied_at: null,
      },
      {
        campaign_id: campaign.id,
        first_name: 'Derek',
        last_name: 'Shaw',
        full_name: 'Derek Shaw',
        email: 'derek@retailscalper.xyz',
        company: 'Personal Account',
        job_title: 'Manual Day Trader / Scalper',
        linkedin_url: 'https://linkedin.com/in/derek-shaw-scalp',
        location: 'Miami, FL',
        industry: 'Retail Trading',
        company_size: '1',
        source: 'apollo',
        source_id: 'seed_lead_5',
        status: LeadStatus.NEW,
        qualification_status: QualificationStatus.UNQUALIFIED,
        lead_score: 0,
        priority: PriorityLevel.LOW,
        opted_out: false,
        last_contacted_at: null,
        last_replied_at: null,
      },
    ];

    for (const lead of sampleLeads) {
      const created = await leadsRepo.create(lead);
      await eventsRepo.log({
        lead_id: created.id,
        event_type: EventType.LEAD_IMPORTED,
        metadata: { seed: true, jobTitle: lead.job_title },
        actor: 'seed:dev_seed',
      });
      logger.info({ email: created.email, id: created.id }, 'Seeded sample lead');
    }

    logger.info('Database seed finished successfully');
  } catch (err) {
    logger.error({ error: err }, 'Seed execution failed');
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
