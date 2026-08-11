import { DatabaseSync } from 'node:sqlite';
import { expect, it } from 'vitest';
import { MockContentAnalyzer } from '@zak/core';
import { migrate } from './index.js';
import { SourcePostRepository } from './source-post-repository.js';
import { TopicRepository } from './topic-repository.js';

it('ranks persisted topic candidates deterministically', async () => {
  const database = new DatabaseSync(':memory:'); migrate(database); const posts = new SourcePostRepository(database);
  const analyzer = new MockContentAnalyzer();
  for (const text of ['ہم کتاب سے علم لیتے ہیں۔', 'معاشرہ اختلاف سے سیکھتا ہے۔']) {
    const post = posts.create({ source: 'TEST', originalText: text }); posts.saveAnalysis(post.id, await analyzer.analyze(text));
  }
  const topics = new TopicRepository(database); expect(topics.refreshFromAnalysis()).toMatchObject({ analyzedPosts: 2, candidates: 2 });
  const ranked = topics.list(); expect(ranked).toHaveLength(2); expect(ranked[0]?.finalScore).toBeGreaterThan(0);
  expect(topics.refreshFromAnalysis()).toMatchObject({ analyzedPosts: 2, candidates: 2 }); expect(topics.list()).toHaveLength(2); database.close();
});
