import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { migrate } from './index.js';
import { SourcePostRepository } from './source-post-repository.js';

describe('SourcePostRepository', () => {
  it('normalizes, stores, lists, and summarizes Urdu posts', () => {
    const database = new DatabaseSync(':memory:');
    migrate(database);
    const repository = new SourcePostRepository(database);
    const post = repository.create({ source: 'TEST', originalText: '  سوال   کرنا ضروری ہے۔  ', category: 'فکر' });
    expect(post.normalizedText).toBe('سوال کرنا ضروری ہے۔');
    expect(repository.list()).toHaveLength(1);
    expect(repository.summary()).toEqual({ total: 1, categories: 1, words: 4 });
    database.close();
  });

  it('rejects duplicate normalized content', () => {
    const database = new DatabaseSync(':memory:');
    migrate(database);
    const repository = new SourcePostRepository(database);
    repository.create({ source: 'TEST', originalText: 'ایک ہی خیال' });
    expect(() => repository.create({ source: 'TEST', originalText: 'ایک  ہی خیال' })).toThrow(/UNIQUE/);
    database.close();
  });
});
