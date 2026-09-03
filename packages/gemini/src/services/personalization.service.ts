import { GeminiClient, defaultGeminiClient } from '../client.js';
import { PERSONALIZATION_V1 } from '@growth/prompts/personalization/v1.js';
import { PersonalizationOutputSchema } from '@growth/shared';
import { z } from 'zod';
import { logger } from '@growth/logging';

export type PersonalizationOutput = z.infer<typeof PersonalizationOutputSchema>;

export class PersonalizationService {
  private client: GeminiClient;

  constructor(client: GeminiClient = defaultGeminiClient) {
    this.client = client;
  }

  async generatePersonalization(params: {
    fullName: string;
    jobTitle: string;
    company: string;
    professionalFocus: string;
    evidenceSnippet: string;
    painPoint: string;
  }): Promise<{ data: PersonalizationOutput; promptVersion: string }> {
    logger.info({ leadName: params.fullName }, 'Executing Gemini Personalization Engine');

    const promptText = PERSONALIZATION_V1.buildPrompt(params);

    const response = await this.client.generateStructuredJSON<unknown>({
      systemInstruction: PERSONALIZATION_V1.systemInstruction,
      prompt: promptText,
      temperature: 0.3,
    });

    const parsed = PersonalizationOutputSchema.safeParse(response.data);

    if (!parsed.success) {
      logger.error(
        { errors: parsed.error.format(), rawData: response.data },
        'Personalization output failed Zod schema validation'
      );
      throw new Error(`Personalization schema validation failed: ${parsed.error.message}`);
    }

    return {
      data: parsed.data,
      promptVersion: PERSONALIZATION_V1.version,
    };
  }
}
