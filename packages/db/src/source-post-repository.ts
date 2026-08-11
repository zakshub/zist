import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

export interface NewSourcePost {
  externalId?: string;
  source: string;
  originalText: string;
  originalDate?: string;
  category?: string;
  tags?: string[];
}

export interface SourcePost extends NewSourcePost {
  id: string;
  normalizedText: string;
  language: string;
  wordCount: number;
  characterCount: number;
  active: boolean;
  createdAt: string;
}

export interface SourcePostSummary {
  total: number;
  categories: number;
  words: number;
}

function normalize(text: string): string {
  return text.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function mapRow(row: Record<string, unknown>): SourcePost {
  return {
    id: String(row.id),
    ...(row.external_id ? { externalId: String(row.external_id) } : {}),
    source: String(row.source), originalText: String(row.original_text),
    ...(row.original_date ? { originalDate: String(row.original_date) } : {}),
    ...(row.category ? { category: String(row.category) } : {}),
    tags: JSON.parse(String(row.tags_json)) as string[], normalizedText: String(row.normalized_text),
    language: String(row.language), wordCount: Number(row.word_count),
    characterCount: Number(row.character_count), active: Boolean(row.active), createdAt: String(row.created_at),
  };
}

export class SourcePostRepository {
  constructor(private readonly database: DatabaseSync) {}

  create(input: NewSourcePost): SourcePost {
    const normalizedText = normalize(input.originalText);
    if (!normalizedText) throw new Error('Source post text cannot be empty.');
    const id = randomUUID();
    const hash = createHash('sha256').update(normalizedText, 'utf8').digest('hex');
    this.database.prepare(`INSERT INTO source_posts
      (id, external_id, source, original_text, normalized_text, original_date, word_count,
       character_count, category, tags_json, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, input.externalId ?? null, input.source, input.originalText, normalizedText,
        input.originalDate ?? null, normalizedText.split(/\s+/u).length, [...normalizedText].length,
        input.category ?? null, JSON.stringify(input.tags ?? []), hash);
    const created = this.findById(id);
    if (!created) throw new Error('Created source post could not be read back.');
    return created;
  }

  findById(id: string): SourcePost | null {
    const row = this.database.prepare('SELECT * FROM source_posts WHERE id = ?').get(id);
    return row ? mapRow(row) : null;
  }

  list(limit = 50): SourcePost[] {
    const safeLimit = Math.max(1, Math.min(limit, 200));
    return this.database.prepare('SELECT * FROM source_posts WHERE active = 1 ORDER BY original_date DESC, created_at DESC LIMIT ?')
      .all(safeLimit).map(mapRow);
  }

  summary(): SourcePostSummary {
    const row = this.database.prepare(`SELECT COUNT(*) total, COUNT(DISTINCT category) categories,
      COALESCE(SUM(word_count), 0) words FROM source_posts WHERE active = 1`).get() as Record<string, unknown>;
    return { total: Number(row.total), categories: Number(row.categories), words: Number(row.words) };
  }
}
