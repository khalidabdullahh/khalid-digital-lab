import { GeminiClient, defaultGeminiClient } from '../client.js';
import { REPLY_INTELLIGENCE_V1 } from '@growth/prompts/reply-intelligence/v1.js';
import { ReplyIntelligenceOutputSchema } from '@growth/shared';
import { z } from 'zod';
import { logger } from '@growth/logging';

export type ReplyIntelligenceOutput = z.infer<typeof ReplyIntelligenceOutputSchema>;

export class ReplyIntelligenceService {
  private client: GeminiClient;

  constructor(client: GeminiClient = defaultGeminiClient) {
    this.client = client;
  }

  async analyzeReply(params: {
    originalSubject: string;
    originalBody: string;
    replyText: string;
    prospectName: string;
  }): Promise<{ data: ReplyIntelligenceOutput; promptVersion: string }> {
    logger.info({ prospectName: params.prospectName }, 'Executing Gemini Reply Intelligence');

    const promptText = REPLY_INTELLIGENCE_V1.buildPrompt(params);

    const response = await this.client.generateStructuredJSON<unknown>({
      systemInstruction: REPLY_INTELLIGENCE_V1.systemInstruction,
      prompt: promptText,
      temperature: 0.1,
    });

    const parsed = ReplyIntelligenceOutputSchema.safeParse(response.data);

    if (!parsed.success) {
      logger.error(
        { errors: parsed.error.format(), rawData: response.data },
        'ReplyIntelligence output failed Zod schema validation'
      );
      throw new Error(`ReplyIntelligence schema validation failed: ${parsed.error.message}`);
    }

    return {
      data: parsed.data,
      promptVersion: REPLY_INTELLIGENCE_V1.version,
    };
  }
}
