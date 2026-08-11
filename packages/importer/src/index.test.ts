import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { migrate, SourcePostRepository } from '@zak/db';
import { importArchive, parseArchive } from './index.js';

describe('archive importer', () => {
  it('parses TXT paragraphs and JSON records', () => {
    expect(parseArchive('پہلی تحریر\n\nدوسری تحریر', '.txt').posts).toHaveLength(2);
    expect(parseArchive('[{"originalText":"ایک خیال"}]', '.json').posts[0]?.originalText).toBe('ایک خیال');
  });
  it('parses quoted CSV including commas and tags', () => {
    const parsed = parseArchive('externalId,originalText,tags\r\n1,"سوال، جواب",فکر|سوال', '.csv');
    expect(parsed.posts[0]).toMatchObject({ externalId: '1', originalText: 'سوال، جواب', tags: ['فکر', 'سوال'] });
  });
  it('reports duplicates without exposing content', () => {
    const database = new DatabaseSync(':memory:'); migrate(database); const repository = new SourcePostRepository(database);
    const report = importArchive('ایک خیال\n\nایک   خیال', 'archive.txt', repository);
    expect(report).toMatchObject({ total: 2, imported: 1, duplicates: 1, invalid: 0 });
    expect(report.issues[0]?.message).toBe('Duplicate post skipped.'); database.close();
  });
});
