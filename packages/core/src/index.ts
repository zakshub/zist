import { z } from 'zod';

export const automationModeSchema = z.enum(['MANUAL', 'ASSISTED', 'AUTOPILOT']);
export type AutomationMode = z.infer<typeof automationModeSchema>;

export interface HealthSnapshot { mode: AutomationMode; dryRun: boolean; mockAi: boolean; mockBlogger: boolean; mockFacebook: boolean }
export interface ArticleDraft { title: string; contentMarkdown: string; language: 'ur' }
export interface AiProvider { generateArticle(topic: string): Promise<ArticleDraft> }

export class MockAiProvider implements AiProvider {
  async generateArticle(topic: string): Promise<ArticleDraft> {
    return { title: `نیا مضمون: ${topic}`, contentMarkdown: `یہ ${topic} کے بارے میں ایک آزمائشی اردو مضمون ہے۔`, language: 'ur' };
  }
}

export interface ContentAnalysis {
  summary: string; centralIdea: string; category: string; themes: string[];
  tone: 'فکری' | 'تنقیدی' | 'معلوماتی'; qualityScore: number; evergreenScore: number;
  personalVoiceScore: number; analyzerVersion: string;
}
export interface ContentAnalyzer { analyze(text: string): Promise<ContentAnalysis> }

const categoryRules = [
  { category: 'ٹیکنالوجی', themes: ['ٹیکنالوجی', 'مصنوعی ذہانت'], words: ['ٹیکنالوجی', 'مصنوعی', 'سیکھنا'] },
  { category: 'نفسیات', themes: ['نفسیات', 'یادداشت'], words: ['یادداشت', 'انسان', 'ذہن'] },
  { category: 'کتب و مطالعہ', themes: ['کتاب', 'علم'], words: ['کتاب', 'مطالعہ', 'علم'] },
  { category: 'معاشرہ', themes: ['معاشرہ', 'مکالمہ'], words: ['معاشرہ', 'اختلاف', 'طاقت'] },
] as const;

export class MockContentAnalyzer implements ContentAnalyzer {
  async analyze(text: string): Promise<ContentAnalysis> {
    const normalized = text.normalize('NFKC').replace(/\s+/g, ' ').trim();
    if (!normalized) throw new Error('Cannot analyze empty content.');
    const match = categoryRules.find((rule) => rule.words.some((word) => normalized.includes(word)));
    const wordCount = normalized.split(/\s+/u).length;
    return {
      summary: normalized.length > 120 ? `${[...normalized].slice(0, 117).join('')}…` : normalized,
      centralIdea: normalized.split(/[۔؟!]/u)[0]?.trim() || normalized,
      category: match?.category ?? 'فکر و خیال', themes: match ? [...match.themes] : ['فکر', 'اردو'],
      tone: normalized.includes('؟') || normalized.includes('سوال') ? 'تنقیدی' : wordCount > 25 ? 'معلوماتی' : 'فکری',
      qualityScore: Math.min(1, 0.45 + wordCount / 100), evergreenScore: /آج|کل|تازہ/u.test(normalized) ? 0.45 : 0.8,
      personalVoiceScore: /ہم|میں|اپنی|اپنے/u.test(normalized) ? 0.85 : 0.65, analyzerVersion: 'mock-v1',
    };
  }
}
