import { z } from 'zod';

export const automationModeSchema = z.enum(['MANUAL', 'ASSISTED', 'AUTOPILOT']);
export type AutomationMode = z.infer<typeof automationModeSchema>;

export interface HealthSnapshot {
  mode: AutomationMode;
  dryRun: boolean;
  mockAi: boolean;
  mockBlogger: boolean;
  mockFacebook: boolean;
}

export interface ArticleDraft {
  title: string;
  contentMarkdown: string;
  language: 'ur';
}

export interface AiProvider {
  generateArticle(topic: string): Promise<ArticleDraft>;
}

export class MockAiProvider implements AiProvider {
  async generateArticle(topic: string): Promise<ArticleDraft> {
    return {
      title: `نیا مضمون: ${topic}`,
      contentMarkdown: `یہ ${topic} کے بارے میں ایک آزمائشی اردو مضمون ہے۔`,
      language: 'ur',
    };
  }
}

