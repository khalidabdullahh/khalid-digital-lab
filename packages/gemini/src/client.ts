import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@growth/shared';
import { logger } from '@growth/logging';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;
  private isDummyKey: boolean;

  constructor(apiKey?: string, modelName?: string) {
    const env = getEnv();
    const key = apiKey || env.GEMINI_API_KEY;
    this.isDummyKey = !key || key === 'dummy_key_for_test' || key === 'your_gemini_api_key_here';
    this.genAI = new GoogleGenerativeAI(key || 'dummy_key');
    this.defaultModel = modelName || env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Generates structured JSON output from Gemini and parses it safely.
   */
  async generateStructuredJSON<T>(params: {
    systemInstruction?: string;
    prompt: string;
    model?: string;
    temperature?: number;
    maxRetries?: number;
  }): Promise<{ data: T; usage?: { promptTokens?: number; candidatesTokens?: number } }> {
    if (this.isDummyKey) {
      logger.info('Gemini API key is in development mock mode, generating realistic structured response');
      return {
        data: this.generateMockResponse<T>(params.prompt, params.systemInstruction),
        usage: { promptTokens: 120, candidatesTokens: 85 },
      };
    }

    const modelToUse = params.model || this.defaultModel;
    const temperature = params.temperature ?? 0.2;
    const maxRetries = params.maxRetries ?? 2;

    const model = this.genAI.getGenerativeModel({
      model: modelToUse,
      systemInstruction: params.systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature,
      },
    });

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(params.prompt);
        let text = result.response.text().trim();

        // Resiliently strip markdown code fences if returned by model
        if (text.startsWith('```json')) {
          text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        } else if (text.startsWith('```')) {
          text = text.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        }

        const parsed = JSON.parse(text) as T;

        return {
          data: parsed,
          usage: {
            promptTokens: result.response.usageMetadata?.promptTokenCount,
            candidatesTokens: result.response.usageMetadata?.candidatesTokenCount,
          },
        };
      } catch (err: unknown) {
        lastError = err;
        logger.warn(
          { attempt, maxRetries, error: (err as Error)?.message },
          'Gemini JSON generation failed, retrying...'
        );

        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    logger.error({ error: lastError }, 'Gemini structured JSON generation failed after max retries');
    throw lastError;
  }

  private generateMockResponse<T>(prompt: string, systemInstruction?: string): T {
    const sys = systemInstruction || '';

    // 1. Researcher Prompt
    if (sys.includes('quantitative research analyst') || prompt.includes('professional_focus')) {
      return {
        professional_focus: 'Systematic futures modeling and Gaussian HMM regime switching strategies',
        trading_related: true,
        quant_related: true,
        pine_script_related: prompt.toLowerCase().includes('pine'),
        systematic_trading_related: true,
        company_description: 'Quantitative investment and strategy development desk',
        professional_evidence: [
          {
            title: 'Verified Technical Role',
            evidence_type: 'verified_fact',
            detail: 'Actively builds automated systematic backtests and regime filters.',
          },
        ],
        relevant_projects: ['PyRegime HMM Models', 'Algorithmic Execution Harness'],
        relevant_public_activity: ['Quantitative trading discussions'],
        potential_pain_points: ['Regime lag', 'Overfitting on bull market bias'],
        potential_use_cases: ['Trading OS HMM regime validation and Monte Carlo stress testing'],
        evidence_sources: ['Public Profile'],
        confidence_score: 0.95,
      } as T;
    }

    // 2. Pain Point Detector
    if (sys.includes('pain-point') || prompt.includes('identified_pain_points')) {
      return {
        identified_pain_points: [
          {
            pain_category: 'regime_instability',
            description: 'Strategy suffers performance decay during unseen market regime transitions.',
            evidence_basis: 'Systematic trading workflow requiring Gaussian HMM classification.',
            confidence: 0.92,
          },
          {
            pain_category: 'monte_carlo_drawdown',
            description: 'Needs multi-path drawdown and ruin probability stress testing.',
            evidence_basis: 'Futures portfolio risk management requirements.',
            confidence: 0.88,
          },
        ],
        overall_urgency: 'HIGH',
      } as T;
    }

    // 3. Lead Analyzer
    if (sys.includes('Lead Qualification Architect') || prompt.includes('composite_score')) {
      return {
        qualification: 'HIGH_PRIORITY',
        composite_score: 92,
        role_relevance: 95,
        company_fit: 90,
        problem_relevance: 92,
        evidence_strength: 90,
        reasoning: 'Strong alignment with Trading OS HMM regime detection and Monte Carlo validation.',
        pain_points: ['Regime instability', 'Overfitting bias'],
        use_cases: ['Strategy validation across market regimes'],
        confidence: 0.94,
      } as T;
    }

    // 4. Personalization Engine
    if (sys.includes('personalization strategist') || prompt.includes('icebreaker_hook')) {
      return {
        icebreaker_hook: 'Noticed your work developing systematic quantitative models and regime-dependent strategies.',
        relevance_angle: 'Gaussian HMM regime validation',
        evidence_cited: 'Quantitative Researcher background in systematic trading',
        tone_check_passed: true,
        confidence: 0.92,
      } as T;
    }

    // 5. Outreach Writer
    if (sys.includes('outreach writer') || prompt.includes('Draft a cold outreach')) {
      return {
        subject: 'HMM regime stress-testing for systematic strategies',
        body_text: `Hi,\n\nNoticed your work developing systematic quantitative models and regime-dependent strategies.\n\nI'm building Trading OS (trading-os-blue.vercel.app), a research platform designed to stress-test systematic strategies against Gaussian HMM market regimes and Monte Carlo drawdown simulations.\n\nWe're onboarding a small cohort of serious quant researchers to test our regime validation engine and share feedback. Would you be open to taking a quick look?\n\nBest,\nKhalid Abdullah`,
        body_html: `<p>Hi,<br/><br/>Noticed your work developing systematic quantitative models and regime-dependent strategies.<br/><br/>I'm building Trading OS (trading-os-blue.vercel.app), a research platform designed to stress-test systematic strategies against Gaussian HMM market regimes and Monte Carlo drawdown simulations.<br/><br/>We're onboarding a small cohort of serious quant researchers to test our regime validation engine and share feedback. Would you be open to taking a quick look?<br/><br/>Best,<br/>Khalid Abdullah</p>`,
        personalization_snippet: 'Noticed your work developing systematic quantitative models.',
        word_count: 58,
        call_to_action: 'Would you be open to taking a quick look?',
      } as T;
    }

    // 6. Reply Intelligence
    if (sys.includes('Reply Intelligence') || prompt.includes('Incoming Reply Text')) {
      return {
        classification: 'INTERESTED',
        confidence: 0.95,
        summary: 'Prospect expressed positive interest in testing Trading OS HMM regime features.',
        suggested_action: 'Send platform link with beta access guide.',
        draft_reply: 'Hi, thanks for reaching out. You can access Trading OS directly at https://trading-os-blue.vercel.app...',
        requires_human_action: true,
        opt_out_detected: false,
      } as T;
    }

    return {} as T;
  }
}

export const defaultGeminiClient = new GeminiClient();
