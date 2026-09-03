import { ApolloPerson } from './types.js';
import { NewLead, LeadStatus, QualificationStatus, PriorityLevel } from '@growth/shared';

export class ApolloNormalizer {
  /**
   * Transforms raw Apollo Person record into normalized internal NewLead model.
   */
  static normalize(person: ApolloPerson, campaignId?: string | null): NewLead | null {
    if (!person.email || !person.email.includes('@')) {
      // Leads without emails are ineligible for direct outreach
      return null;
    }

    const firstName = person.first_name || person.name?.split(' ')[0] || 'Unknown';
    const lastName = person.last_name || person.name?.split(' ').slice(1).join(' ') || '';
    const fullName = person.name || `${firstName} ${lastName}`.trim();
    const company = person.organization?.name || 'Independent / Self-Employed';
    const jobTitle = person.title || person.headline || 'Quantitative Trader';

    const locationParts = [person.city, person.state, person.country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : null;

    let companySize: string | null = null;
    if (person.organization?.estimated_num_employees) {
      const emp = person.organization.estimated_num_employees;
      if (emp <= 10) companySize = '1-10';
      else if (emp <= 50) companySize = '11-50';
      else if (emp <= 200) companySize = '51-200';
      else if (emp <= 500) companySize = '201-500';
      else companySize = '500+';
    }

    return {
      campaign_id: campaignId || null,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      email: person.email.toLowerCase().trim(),
      company,
      job_title: jobTitle,
      linkedin_url: person.linkedin_url || null,
      company_url: person.organization?.website_url || null,
      location,
      industry: person.organization?.industry || 'Financial Services',
      company_size: companySize,
      source: 'apollo',
      source_id: person.id,
      status: LeadStatus.NEW,
      qualification_status: QualificationStatus.UNQUALIFIED,
      lead_score: 0,
      priority: PriorityLevel.MEDIUM,
      opted_out: false,
      last_contacted_at: null,
      last_replied_at: null,
    };
  }
}
