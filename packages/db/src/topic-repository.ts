import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

export interface TopicCandidate {
  id: string; name: string; description: string; category: string; keywords: string[]; status: string;
  sourcePostCount: number; noveltyScore: number; relevanceScore: number; qualityScore: number;
  diversityScore: number; finalScore: number; scoringVersion: string;
}
export interface TopicRefreshReport { analyzedPosts: number; candidates: number; scoringVersion: string }

type AggregateRow = { category: string; post_count: number; avg_quality: number; avg_evergreen: number; themes: string };

function round(value: number): number { return Math.round(value * 1000) / 1000; }

export class TopicRepository {
  static readonly scoringVersion = 'memory-v1';
  constructor(private readonly database: DatabaseSync) {}

  refreshFromAnalysis(): TopicRefreshReport {
    const rows = this.database.prepare(`SELECT a.category, COUNT(*) post_count,
      AVG(a.quality_score) avg_quality, AVG(a.evergreen_score) avg_evergreen,
      GROUP_CONCAT(a.themes_json, '||') themes FROM source_post_analyses a GROUP BY a.category`).all() as AggregateRow[];
    const total = rows.reduce((sum, row) => sum + Number(row.post_count), 0);
    const upsert = this.database.prepare(`INSERT INTO topics
      (id,name,description,category,keywords_json,status,novelty_score,relevance_score,
       quality_score,diversity_score,final_score,scoring_version)
      VALUES (?,?,?,?,?,'CANDIDATE',?,?,?,?,?,?) ON CONFLICT(name) DO UPDATE SET
      description=excluded.description, keywords_json=excluded.keywords_json,
      novelty_score=excluded.novelty_score, relevance_score=excluded.relevance_score,
      quality_score=excluded.quality_score, diversity_score=excluded.diversity_score,
      final_score=excluded.final_score, scoring_version=excluded.scoring_version, updated_at=CURRENT_TIMESTAMP`);
    const link = this.database.prepare(`INSERT OR IGNORE INTO topic_source_posts(topic_id,source_post_id)
      SELECT ?, source_post_id FROM source_post_analyses WHERE category = ?`);
    this.database.exec('BEGIN');
    try {
      for (const row of rows) {
        const existing = this.database.prepare('SELECT id,generation_count FROM topics WHERE name=?').get(row.category) as { id: string; generation_count: number } | undefined;
        const id = existing?.id ?? randomUUID(); const count = Number(row.post_count);
        const novelty = existing?.generation_count ? 1 / (1 + existing.generation_count) : 1;
        const relevance = Number(row.avg_evergreen); const quality = Number(row.avg_quality);
        const diversity = total ? 1 - count / total : 0;
        const finalScore = round(novelty * 0.3 + relevance * 0.25 + quality * 0.3 + diversity * 0.15);
        const themes = [...new Set(row.themes.split('||').flatMap((json) => JSON.parse(json) as string[]))].slice(0, 8);
        upsert.run(id, row.category, `${count} analyzed source posts support this topic.`, row.category,
          JSON.stringify(themes), round(novelty), round(relevance), round(quality), round(diversity), finalScore, TopicRepository.scoringVersion);
        link.run(id, row.category);
      }
      this.database.exec('COMMIT');
    } catch (error) { this.database.exec('ROLLBACK'); throw error; }
    return { analyzedPosts: total, candidates: rows.length, scoringVersion: TopicRepository.scoringVersion };
  }

  list(limit = 20): TopicCandidate[] {
    return (this.database.prepare(`SELECT t.*, COUNT(l.source_post_id) source_post_count FROM topics t
      LEFT JOIN topic_source_posts l ON l.topic_id=t.id GROUP BY t.id ORDER BY final_score DESC, name LIMIT ?`).all(Math.max(1, Math.min(limit, 100))) as Record<string, unknown>[]).map((row) => ({
      id: String(row.id), name: String(row.name), description: String(row.description), category: String(row.category),
      keywords: JSON.parse(String(row.keywords_json)) as string[], status: String(row.status), sourcePostCount: Number(row.source_post_count),
      noveltyScore: Number(row.novelty_score), relevanceScore: Number(row.relevance_score), qualityScore: Number(row.quality_score),
      diversityScore: Number(row.diversity_score), finalScore: Number(row.final_score), scoringVersion: String(row.scoring_version),
    }));
  }
}
