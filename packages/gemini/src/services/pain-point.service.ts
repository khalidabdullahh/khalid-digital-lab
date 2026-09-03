import { GeminiClient, defaultGeminiClient } from '../client.js';
import { PAIN_POINT_DETECTOR_V1 } from '@growth/prompts/pain-point-detector/v1.js';
import { PainPointDetectorOutputSchema } from '@growth/shared';
import { z } from 'zod';
import { logger } from '@growth/logging';

export type PainPointOutput = z.infer<typeof PainPointDetectorOutputSchema>;

export class PainPointDetectorService {
  private client: GeminiClient;

  constructor(client: GeminiClient = defaultGeminiClient) {
    this.client = client;
  }

  async detectPainPoints(researchData: {
    professionalFocus: string;
    relevantProjects: string[];
    tradingRelated: boolean;
    pineScriptRelated: boolean;
    systematicTradingRelated: boolean;
  }): Promise<{ data: PainPointOutput; promptVersion: string }> {
    logger.info('Executing Gemini Pain Point Detector');

    const promptText = PAIN_POINT_DETECTOR_V1.buildPrompt(researchData);

    const response = await this.client.generateStructuredJSON<unknown>({
      systemInstruction: PAIN_POINT_DETECTOR_V1.systemInstruction,
      prompt: promptText,
      temperature: 0.2,
    });

    const parsed = PainPointDetectorOutputSchema.safeParse(response.data);

    if (!parsed.success) {
      logger.error(
        { errors: parsed.error.format(), rawData: response.data },
        'PainPointDetector output failed Zod schema validation'
      );
      throw new Error(`PainPointDetector schema validation failed: ${parsed.error.message}`);
    }

    return {
      data: parsed.data,
      promptVersion: PAIN_POINT_DETECTOR_V1.version,
    };
  }
}
