import { describe, expect, it } from 'vitest';
import { MockAiProvider, MockContentAnalyzer } from './index.js';

describe('MockAiProvider', () => {
  it('returns a deterministic Urdu draft without an external call', async () => {
    const draft = await new MockAiProvider().generateArticle('تنقیدی سوچ');
    expect(draft.language).toBe('ur');
    expect(draft.title).toContain('تنقیدی سوچ');
  });
});

describe('MockContentAnalyzer', () => {
  it('returns bounded deterministic signals', async () => {
    const result = await new MockContentAnalyzer().analyze('ہم کتاب اور علم سے کیا سیکھتے ہیں؟');
    expect(result.category).toBe('کتب و مطالعہ');
    expect(result.tone).toBe('تنقیدی');
    expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    expect(result.qualityScore).toBeLessThanOrEqual(1);
  });
});
