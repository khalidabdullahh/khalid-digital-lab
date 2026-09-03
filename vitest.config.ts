import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@growth/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
      '@growth/logging': path.resolve(__dirname, './packages/logging/src/index.ts'),
      '@growth/database': path.resolve(__dirname, './packages/database/src/index.ts'),
      '@growth/gemini': path.resolve(__dirname, './packages/gemini/src/index.ts'),
      '@growth/apollo': path.resolve(__dirname, './packages/apollo/src/index.ts'),
      '@growth/instantly': path.resolve(__dirname, './packages/instantly/src/index.ts'),
      '@growth/scoring': path.resolve(__dirname, './packages/scoring/src/index.ts'),
      '@growth/prompts': path.resolve(__dirname, './prompts/index.ts'),
      '@growth/prompts/researcher/v1.js': path.resolve(__dirname, './prompts/researcher/v1.ts'),
      '@growth/prompts/pain-point-detector/v1.js': path.resolve(__dirname, './prompts/pain-point-detector/v1.ts'),
      '@growth/prompts/lead-analyzer/v1.js': path.resolve(__dirname, './prompts/lead-analyzer/v1.ts'),
      '@growth/prompts/personalization/v1.js': path.resolve(__dirname, './prompts/personalization/v1.ts'),
      '@growth/prompts/outreach/v1.js': path.resolve(__dirname, './prompts/outreach/v1.ts'),
      '@growth/prompts/reply-intelligence/v1.js': path.resolve(__dirname, './prompts/reply-intelligence/v1.ts'),
      '@growth/workers/analytics/index.js': path.resolve(__dirname, './workers/analytics/index.ts'),
      '@growth/workers/reply-analysis/index.js': path.resolve(__dirname, './workers/reply-analysis/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
