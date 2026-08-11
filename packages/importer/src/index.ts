import { extname } from 'node:path';
import type { NewSourcePost, SourcePostRepository } from '@zak/db';

export interface ImportIssue { row: number; code: 'INVALID' | 'DUPLICATE'; message: string }
export interface ImportReport { format: 'txt' | 'json' | 'csv'; total: number; imported: number; duplicates: number; invalid: number; issues: ImportIssue[] }

function asPost(value: unknown, row: number): NewSourcePost {
  if (!value || typeof value !== 'object') throw new Error(`Row ${row} must be an object.`);
  const item = value as Record<string, unknown>;
  if (typeof item.originalText !== 'string' || !item.originalText.trim()) throw new Error(`Row ${row} requires originalText.`);
  const post: NewSourcePost = { source: typeof item.source === 'string' ? item.source : 'ARCHIVE', originalText: item.originalText };
  if (typeof item.externalId === 'string') post.externalId = item.externalId;
  if (typeof item.originalDate === 'string') post.originalDate = item.originalDate;
  if (typeof item.category === 'string') post.category = item.category;
  if (Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === 'string')) post.tags = item.tags as string[];
  return post;
}

function parseCsvRows(content: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (quoted && char === '"' && content[index + 1] === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (!quoted && char === ',') { row.push(field); field = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && content[index + 1] === '\n') index += 1;
      row.push(field); if (row.some((cell) => cell.trim())) rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  row.push(field); if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

export function parseArchive(content: string, extension: string): { format: ImportReport['format']; posts: NewSourcePost[] } {
  const format = extension.replace(/^\./, '').toLowerCase();
  if (format === 'txt') return { format, posts: content.split(/\r?\n\s*\r?\n/u).filter((text) => text.trim()).map((originalText) => ({ source: 'ARCHIVE', originalText })) };
  if (format === 'json') {
    const parsed: unknown = JSON.parse(content); if (!Array.isArray(parsed)) throw new Error('JSON archive must be an array.');
    return { format, posts: parsed.map((item, index) => asPost(item, index + 1)) };
  }
  if (format === 'csv') {
    const [header, ...rows] = parseCsvRows(content); if (!header) throw new Error('CSV archive is empty.');
    const keys = header.map((key) => key.trim());
    return { format, posts: rows.map((cells, index) => {
      const item: Record<string, unknown> = Object.fromEntries(keys.map((key, cellIndex) => [key, cells[cellIndex]?.trim() ?? '']));
      if (typeof item.tags === 'string' && item.tags) item.tags = item.tags.split('|').map((tag) => tag.trim()).filter(Boolean);
      return asPost(item, index + 2);
    }) };
  }
  throw new Error(`Unsupported archive extension: ${extension}`);
}

export function importArchive(content: string, filename: string, repository: SourcePostRepository): ImportReport {
  const parsed = parseArchive(content, extname(filename));
  const report: ImportReport = { format: parsed.format, total: parsed.posts.length, imported: 0, duplicates: 0, invalid: 0, issues: [] };
  parsed.posts.forEach((post, index) => {
    try { repository.create(post); report.imported += 1; }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown import failure.';
      const duplicate = message.includes('UNIQUE constraint failed');
      if (duplicate) report.duplicates += 1; else report.invalid += 1;
      report.issues.push({ row: index + 1, code: duplicate ? 'DUPLICATE' : 'INVALID', message: duplicate ? 'Duplicate post skipped.' : message });
    }
  });
  return report;
}
