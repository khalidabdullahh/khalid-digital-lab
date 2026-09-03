import { GeminiClient, defaultGeminiClient } from '../client.js';
import { LEAD_ANALYZER_V1 } from '@growth/prompts/lead-analyzer/v1.js';
import { LeadAnalyzerOutputSchema } from '@growth/shared';
import { z } from 'zod';
import { logger } from '@growth/logging';

export type LeadAnalyzerOutput = z.infer<typeof LeadAnalyzerOutputSchema>;

export class LeadAnalyzerService {
  private client: GeminiClient;

  constructor(client: GeminiClient = defaultGeminiClient) {
    this.client = client;
  }

  async analyzeLead(params: {
    fullName: string;
    jobTitle: string;
    company: string;
    professionalFocus: string;
    evidenceList: string[];
    painPoints: string[];
  }): Promise<{ data: LeadAnalyzerOutput; promptVersion: string }> {
    logger.info({ leadName: params.fullName, jobTitle: params.jobTitle }, 'Executing Gemini Lead Analyzer');

    const promptText = LEAD_ANALYZER_V1.buildPrompt(params);

    const response = await this.client.generateStructuredJSON<unknown>({
      systemInstruction: LEAD_ANALYZER_V1.systemInstruction,
      prompt: promptText,
      temperature: 0.15,
    });

    const parsed = LeadAnalyzerOutputSchema.safeParse(response.data);

    if (!parsed.success) {
      logger.error(
        { errors: parsed.error.format(), rawData: response.data },
        'LeadAnalyzer output failed Zod schema validation'
      );
      throw new Error(`LeadAnalyzer schema validation failed: ${parsed.error.message}`);
    }

    return {
      data: parsed.data,
      promptVersion: LEAD_ANALYZER_V1.version,
    };
  }
}
