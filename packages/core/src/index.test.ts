import { describe, expect, it } from 'vitest';
import { MockAiProvider } from './index.js';

describe('MockAiProvider', () => {
  it('returns a deterministic Urdu draft without an external call', async () => {
    const draft = await new MockAiProvider().generateArticle('تنقیدی سوچ');
    expect(draft.language).toBe('ur');
    expect(draft.title).toContain('تنقیدی سوچ');
  });
});

