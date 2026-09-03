export interface ApolloPerson {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  title?: string;
  linkedin_url?: string;
  city?: string;
  state?: string;
  country?: string;
  organization?: {
    name?: string;
    website_url?: string;
    industry?: string;
    estimated_num_employees?: number;
    keywords?: string[];
  };
  headline?: string;
}

export interface ApolloSearchParams {
  q_keywords?: string;
  person_titles?: string[];
  person_locations?: string[];
  organization_industry_tag_ids?: string[];
  page?: number;
  per_page?: number;
}

export interface ApolloSearchResponse {
  people: ApolloPerson[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}
