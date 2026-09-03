import { GeminiClient, defaultGeminiClient } from '../client.js';
import { OUTREACH_V1 } from '@growth/prompts/outreach/v1.js';
import { OutreachWriterOutputSchema } from '@growth/shared';
import { z } from 'zod';
import { logger } from '@growth/logging';

export type OutreachWriterOutput = z.infer<typeof OutreachWriterOutputSchema>;

export class OutreachWriterService {
  private client: GeminiClient;

  constructor(client: GeminiClient = defaultGeminiClient) {
    this.client = client;
  }

  async generateEmailDraft(params: {
    firstName: string;
    fullName: string;
    jobTitle: string;
    company: string;
    icebreakerHook: string;
    painCategory: string;
    relevanceAngle: string;
  }): Promise<{ data: OutreachWriterOutput; promptVersion: string }> {
    logger.info({ leadName: params.fullName }, 'Executing Gemini Outreach Writer');

    const promptText = OUTREACH_V1.buildPrompt(params);

    const response = await this.client.generateStructuredJSON<unknown>({
      systemInstruction: OUTREACH_V1.systemInstruction,
      prompt: promptText,
      temperature: 0.35,
    });

    const parsed = OutreachWriterOutputSchema.safeParse(response.data);

    if (!parsed.success) {
      logger.error(
        { errors: parsed.error.format(), rawData: response.data },
        'OutreachWriter output failed Zod schema validation'
      );
      throw new Error(`OutreachWriter schema validation failed: ${parsed.error.message}`);
    }

    return {
      data: parsed.data,
      promptVersion: OUTREACH_V1.version,
    };
  }
}
