import { describe, it, expect } from 'vitest';
import { ApolloNormalizer } from '../../packages/apollo/src/index.js';
import { LeadStatus, QualificationStatus, PriorityLevel } from '../../packages/shared/src/index.js';

describe('Apollo Lead Normalizer', () => {
  it('should correctly normalize a full Apollo Person payload', () => {
    const rawApolloPerson = {
      id: 'apollo_12345',
      first_name: 'Elena',
      last_name: 'Rostova',
      name: 'Elena Rostova',
      email: 'Elena.Rostova@PineQuant.IO',
      title: 'Pine Script v5 Engineer',
      linkedin_url: 'https://linkedin.com/in/elena-pine',
      city: 'London',
      country: 'United Kingdom',
      organization: {
        name: 'PineQuant Analytics',
        website_url: 'https://pinequant.io',
        industry: 'FinTech',
        estimated_num_employees: 5,
        keywords: ['tradingview', 'pine script'],
      },
    };

    const normalized = ApolloNormalizer.normalize(rawApolloPerson, 'campaign_test_1');

    expect(normalized).not.toBeNull();
    expect(normalized?.email).toBe('elena.rostova@pinequant.io');
    expect(normalized?.first_name).toBe('Elena');
    expect(normalized?.last_name).toBe('Rostova');
    expect(normalized?.company).toBe('PineQuant Analytics');
    expect(normalized?.job_title).toBe('Pine Script v5 Engineer');
    expect(normalized?.location).toBe('London, United Kingdom');
    expect(normalized?.company_size).toBe('1-10');
    expect(normalized?.source).toBe('apollo');
    expect(normalized?.source_id).toBe('apollo_12345');
    expect(normalized?.status).toBe(LeadStatus.NEW);
    expect(normalized?.qualification_status).toBe(QualificationStatus.UNQUALIFIED);
    expect(normalized?.opted_out).toBe(false);
  });

  it('should return null for prospects without valid emails', () => {
    const invalidPerson = {
      id: 'apollo_no_email',
      first_name: 'John',
      last_name: 'Doe',
      title: 'Trader',
    };

    const normalized = ApolloNormalizer.normalize(invalidPerson);
    expect(normalized).toBeNull();
  });
});
