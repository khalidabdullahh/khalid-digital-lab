import { ApolloPerson, ApolloSearchParams, ApolloSearchResponse } from './types.js';
import { ApolloNormalizer } from './normalizer.js';
import { NewLead, getEnv } from '@growth/shared';
import { logger } from '@growth/logging';

export class ApolloClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    const env = getEnv();
    this.apiKey = apiKey || env.APOLLO_API_KEY || '';
    this.baseUrl = baseUrl || env.APOLLO_BASE_URL || 'https://api.apollo.io/v1';
  }

  /**
   * Searches Apollo people directory with pagination and rate limit resilience.
   */
  async searchPeople(params: ApolloSearchParams): Promise<ApolloSearchResponse> {
    if (!this.apiKey || this.apiKey === 'your_apollo_api_key_here') {
      logger.warn('Apollo API key not configured, returning mock search results for development');
      return this.getMockResults(params);
    }

    const url = `${this.baseUrl}/mixed_people/search`;
    const body = {
      api_key: this.apiKey,
      q_keywords: params.q_keywords,
      person_titles: params.person_titles,
      person_locations: params.person_locations,
      page: params.page || 1,
      per_page: params.per_page || 10,
    };

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000;
          logger.warn({ attempt, waitTime }, 'Apollo rate limited (HTTP 429), backing off');
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }

        if (!res.ok) {
          throw new Error(`Apollo search failed with status HTTP ${res.status}: ${await res.text()}`);
        }

        const data = (await res.json()) as ApolloSearchResponse;
        return data;
      } catch (err) {
        if (attempt === maxRetries) {
          logger.error({ error: err, params }, 'Apollo search failed after max retries');
          throw err;
        }
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    throw new Error('Apollo search failed unexpectedly');
  }

  /**
   * Convenience method to search and normalize leads directly
   */
  async searchAndNormalize(params: ApolloSearchParams, campaignId?: string | null): Promise<NewLead[]> {
    const response = await this.searchPeople(params);
    const leads: NewLead[] = [];

    for (const person of response.people || []) {
      const normalized = ApolloNormalizer.normalize(person, campaignId);
      if (normalized) {
        leads.push(normalized);
      }
    }

    return leads;
  }

  /**
   * Mock data generator for local development and testing
   */
  private getMockResults(params: ApolloSearchParams): ApolloSearchResponse {
    const mockPeople: ApolloPerson[] = [
      {
        id: 'apollo_mock_1',
        first_name: 'Marcus',
        last_name: 'Vance',
        name: 'Marcus Vance',
        email: 'marcus.vance@vancetrading.com',
        title: 'Lead Quantitative Researcher & Algorithmic Trader',
        linkedin_url: 'https://linkedin.com/in/marcus-vance-quant',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        organization: {
          name: 'Vance Trading Labs',
          website_url: 'https://vancetrading.com',
          industry: 'Quantitative Hedge Fund',
          estimated_num_employees: 12,
          keywords: ['python', 'backtesting', 'hmm', 'regime switching', 'systematic futures'],
        },
        headline: 'Developing systematic statistical arbitrage models across index futures.',
      },
      {
        id: 'apollo_mock_2',
        first_name: 'Elena',
        last_name: 'Rostova',
        name: 'Elena Rostova',
        email: 'elena@pinequant.io',
        title: 'Pine Script v5 Engineer & Strategy Developer',
        linkedin_url: 'https://linkedin.com/in/elena-rostova-pine',
        city: 'London',
        country: 'United Kingdom',
        organization: {
          name: 'PineQuant Analytics',
          website_url: 'https://pinequant.io',
          industry: 'Financial Technology',
          estimated_num_employees: 4,
          keywords: ['tradingview', 'pine script', 'monte carlo', 'algorithmic indicators'],
        },
        headline: 'Author of top-rated TradingView indicators and multi-timeframe strategy scripts.',
      },
      {
        id: 'apollo_mock_3',
        first_name: 'Julian',
        last_name: 'Thorne',
        name: 'Julian Thorne',
        email: 'j.thorne@alphaprop.ch',
        title: 'Head of Quantitative Strategy',
        linkedin_url: 'https://linkedin.com/in/julian-thorne-quant',
        city: 'Zurich',
        country: 'Switzerland',
        organization: {
          name: 'AlphaProp AG',
          website_url: 'https://alphaprop.ch',
          industry: 'Proprietary Trading Desk',
          estimated_num_employees: 25,
          keywords: ['monte carlo', 'walk forward optimization', 'market regimes', 'crypto perp'],
        },
        headline: 'Managing multi-asset quant portfolios with dynamic risk allocation.',
      },
      {
        id: 'apollo_mock_4',
        first_name: 'Derek',
        last_name: 'Shaw',
        name: 'Derek Shaw',
        email: 'derek@retailscalper.xyz',
        title: 'Manual Day Trader / Scalper',
        linkedin_url: 'https://linkedin.com/in/derek-shaw-scalp',
        city: 'Miami',
        state: 'FL',
        country: 'United States',
        organization: {
          name: 'Personal Account',
          industry: 'Retail Trading',
          estimated_num_employees: 1,
          keywords: ['manual trading', '1m charts', 'scalping'],
        },
        headline: 'Day trading 0DTE options on feel and momentum.',
      },
    ];

    return {
      people: mockPeople,
      pagination: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        total_entries: mockPeople.length,
        total_pages: 1,
      },
    };
  }
}

export const defaultApolloClient = new ApolloClient();
