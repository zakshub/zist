import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { migrate, SourcePostRepository } from '@zak/db';
import { importArchive, inspectArchive, parseArchive } from './index.js';

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
it('imports and duplicate-checks 7,000 synthetic Urdu records',()=>{const database=new DatabaseSync(':memory:');migrate(database);const repository=new SourcePostRepository(database);const records=Array.from({length:7000},(_,index)=>({externalId:`scale-${index}`,source:'SCALE_TEST',originalText:`یہ مصنوعی اردو تحریر نمبر ${index} ہے۔`}));const content=JSON.stringify(records);const first=importArchive(content,'scale.json',repository);expect(first).toMatchObject({total:7000,imported:7000,duplicates:0,invalid:0});const replay=importArchive(content,'scale.json',repository);expect(replay).toMatchObject({total:7000,imported:0,duplicates:7000,invalid:0});expect(repository.summary().total).toBe(7000);database.close()},15_000);
it('inspects privacy signals without returning content',()=>{const result=inspectArchive('رابطہ test@example.com\n\napi_key=private-value','archive.txt');expect(result.privacySignals).toEqual({emails:1,phoneNumbers:0,credentialLikeTokens:1});expect(result.safeToImport).toBe(false);expect(JSON.stringify(result)).not.toContain('private-value')});
