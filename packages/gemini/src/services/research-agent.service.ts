import { GeminiClient, defaultGeminiClient } from '../client.js';
import { RESEARCHER_V1 } from '@growth/prompts/researcher/v1.js';
import { ResearchOutputSchema } from '@growth/shared';
import { z } from 'zod';
import { logger } from '@growth/logging';

export type ResearchAgentOutput = z.infer<typeof ResearchOutputSchema>;

export class ResearchAgentService {
  private client: GeminiClient;

  constructor(client: GeminiClient = defaultGeminiClient) {
    this.client = client;
  }

  async executeResearch(lead: {
    fullName: string;
    jobTitle: string;
    company: string;
    location?: string | null;
    industry?: string | null;
    linkedinUrl?: string | null;
    companyUrl?: string | null;
    rawSnippet?: string;
  }): Promise<{ data: ResearchAgentOutput; promptVersion: string }> {
    logger.info({ leadName: lead.fullName, company: lead.company }, 'Executing Gemini Research Agent');

    const promptText = RESEARCHER_V1.buildPrompt(lead);

    const response = await this.client.generateStructuredJSON<unknown>({
      systemInstruction: RESEARCHER_V1.systemInstruction,
      prompt: promptText,
      temperature: 0.1, // low temperature for factual extraction
    });

    const parsed = ResearchOutputSchema.safeParse(response.data);

    if (!parsed.success) {
      logger.error(
        { errors: parsed.error.format(), rawData: response.data },
        'ResearchAgent output failed Zod schema validation'
      );
      throw new Error(`ResearchAgent schema validation failed: ${parsed.error.message}`);
    }

    return {
      data: parsed.data,
      promptVersion: RESEARCHER_V1.version,
    };
  }
}
