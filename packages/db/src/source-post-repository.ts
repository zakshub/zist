import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { ContentAnalysis } from '@zak/core';

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

  pendingAnalysis(limit = 25): SourcePost[] {
    const safeLimit = Math.max(1, Math.min(limit, 200));
    return this.database.prepare(`SELECT p.* FROM source_posts p
      LEFT JOIN source_post_analyses a ON a.source_post_id = p.id
      WHERE p.active = 1 AND a.source_post_id IS NULL ORDER BY p.created_at LIMIT ?`)
      .all(safeLimit).map(mapRow);
  }

  saveAnalysis(id: string, analysis: ContentAnalysis): void {
    this.database.prepare(`INSERT INTO source_post_analyses
      (source_post_id, summary, central_idea, category, themes_json, tone, quality_score,
       evergreen_score, personal_voice_score, analyzer_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_post_id) DO UPDATE SET summary=excluded.summary,
       central_idea=excluded.central_idea, category=excluded.category, themes_json=excluded.themes_json,
       tone=excluded.tone, quality_score=excluded.quality_score, evergreen_score=excluded.evergreen_score,
       personal_voice_score=excluded.personal_voice_score, analyzer_version=excluded.analyzer_version,
       analyzed_at=CURRENT_TIMESTAMP`)
      .run(id, analysis.summary, analysis.centralIdea, analysis.category, JSON.stringify(analysis.themes),
        analysis.tone, analysis.qualityScore, analysis.evergreenScore, analysis.personalVoiceScore,
        analysis.analyzerVersion);
  }

  analysisProgress(): { analyzed: number; pending: number } {
    const row = this.database.prepare(`SELECT COUNT(a.source_post_id) analyzed,
      COUNT(*) - COUNT(a.source_post_id) pending FROM source_posts p
      LEFT JOIN source_post_analyses a ON a.source_post_id = p.id WHERE p.active = 1`).get() as Record<string, unknown>;
    return { analyzed: Number(row.analyzed), pending: Number(row.pending) };
  }
}
