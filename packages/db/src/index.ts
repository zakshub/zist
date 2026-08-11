import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

export function databasePath(): string {
  const configured = process.env.DATABASE_URL;
  if (configured) return resolve(process.cwd(), configured.replace(/^file:/, ''));
  return fileURLToPath(new URL('../../../storage/content-engine.sqlite', import.meta.url));
}

export function openDatabase(path = databasePath()): DatabaseSync {
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  return database;
}

export function migrate(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (1);

    CREATE TABLE IF NOT EXISTS source_posts (
      id TEXT PRIMARY KEY,
      external_id TEXT,
      source TEXT NOT NULL,
      original_text TEXT NOT NULL,
      normalized_text TEXT NOT NULL,
      original_date TEXT,
      imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      language TEXT NOT NULL DEFAULT 'ur',
      word_count INTEGER NOT NULL,
      character_count INTEGER NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'POST',
      category TEXT,
      tags_json TEXT NOT NULL DEFAULT '[]',
      summary TEXT,
      central_idea TEXT,
      tone TEXT,
      quality_score REAL,
      evergreen_score REAL,
      personal_voice_score REAL,
      embedding_status TEXT NOT NULL DEFAULT 'NOT_QUEUED',
      used_count INTEGER NOT NULL DEFAULT 0,
      last_used_at TEXT,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      metadata_json TEXT NOT NULL DEFAULT '{}',
      content_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(source, external_id)
    );
    CREATE INDEX IF NOT EXISTS source_posts_original_date_idx ON source_posts(original_date DESC);
    CREATE INDEX IF NOT EXISTS source_posts_category_idx ON source_posts(category);
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (2);

    CREATE TABLE IF NOT EXISTS source_post_analyses (
      source_post_id TEXT PRIMARY KEY REFERENCES source_posts(id) ON DELETE CASCADE,
      summary TEXT NOT NULL, central_idea TEXT NOT NULL, category TEXT NOT NULL,
      themes_json TEXT NOT NULL, tone TEXT NOT NULL, quality_score REAL NOT NULL,
      evergreen_score REAL NOT NULL, personal_voice_score REAL NOT NULL,
      analyzer_version TEXT NOT NULL, analyzed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (3);

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, description TEXT NOT NULL,
      category TEXT NOT NULL, keywords_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'CANDIDATE',
      novelty_score REAL NOT NULL, relevance_score REAL NOT NULL, quality_score REAL NOT NULL,
      diversity_score REAL NOT NULL, final_score REAL NOT NULL, generation_count INTEGER NOT NULL DEFAULT 0,
      last_generated_at TEXT, scoring_version TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS topic_source_posts (
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      source_post_id TEXT NOT NULL REFERENCES source_posts(id) ON DELETE CASCADE,
      PRIMARY KEY(topic_id, source_post_id)
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (4);

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY, topic_id TEXT NOT NULL REFERENCES topics(id), title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL, content_markdown TEXT NOT NULL,
      seo_title TEXT NOT NULL, seo_description TEXT NOT NULL, labels_json TEXT NOT NULL,
      angle TEXT NOT NULL, generation_model TEXT NOT NULL, prompt_version TEXT NOT NULL,
      quality_score REAL NOT NULL, similarity_score REAL NOT NULL, editorial_notes_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED', current_version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_at TEXT, published_at TEXT
    );
    CREATE TABLE IF NOT EXISTS article_versions (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE, version INTEGER NOT NULL,
      title TEXT NOT NULL, content_markdown TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT NOT NULL, PRIMARY KEY(article_id, version)
    );
    CREATE TABLE IF NOT EXISTS article_sources (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      source_post_id TEXT NOT NULL REFERENCES source_posts(id), PRIMARY KEY(article_id, source_post_id)
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (5);

    CREATE TABLE IF NOT EXISTS generated_images (
      id TEXT PRIMARY KEY, article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      brief_json TEXT NOT NULL, prompt TEXT NOT NULL, negative_instructions_json TEXT NOT NULL,
      style TEXT NOT NULL, aspect_ratio TEXT NOT NULL, model TEXT NOT NULL, local_path TEXT,
      remote_url TEXT, status TEXT NOT NULL DEFAULT 'GENERATED', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_at TEXT, UNIQUE(article_id)
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (6);

    CREATE TABLE IF NOT EXISTS blogger_publications (
      id TEXT PRIMARY KEY, article_id TEXT NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
      blog_id TEXT NOT NULL, blogger_post_id TEXT NOT NULL UNIQUE, blogger_url TEXT,
      request_hash TEXT NOT NULL UNIQUE, is_draft INTEGER NOT NULL CHECK(is_draft=1),
      status TEXT NOT NULL DEFAULT 'BLOGGER_DRAFT', provider TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, published_at TEXT
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (7);

    CREATE TABLE IF NOT EXISTS facebook_page_posts (
      id TEXT PRIMARY KEY, article_id TEXT NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
      blogger_publication_id TEXT NOT NULL REFERENCES blogger_publications(id), variants_json TEXT NOT NULL,
      selected_variant TEXT, status TEXT NOT NULL DEFAULT 'WAITING_FOR_BLOG', generation_version TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, approved_at TEXT, scheduled_at TEXT, published_at TEXT,
      CHECK(status IN ('WAITING_FOR_BLOG','READY_FOR_REVIEW','APPROVED','SCHEDULED','PUBLISHING','PUBLISHED','REJECTED','FAILED'))
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (8);

    CREATE TABLE IF NOT EXISTS facebook_delivery_attempts (
      id TEXT PRIMARY KEY, facebook_page_post_id TEXT NOT NULL REFERENCES facebook_page_posts(id),
      request_hash TEXT NOT NULL UNIQUE, provider TEXT NOT NULL, dry_run INTEGER NOT NULL CHECK(dry_run=1),
      external_post_id TEXT, outcome TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (9);

    CREATE TABLE IF NOT EXISTS schedule_recommendations (
      id TEXT PRIMARY KEY, facebook_page_post_id TEXT NOT NULL UNIQUE REFERENCES facebook_page_posts(id),
      scheduled_at TEXT NOT NULL, timezone TEXT NOT NULL, local_label TEXT NOT NULL, reason TEXT NOT NULL,
      opportunity_score REAL NOT NULL, policy_version TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'RECOMMENDED',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO schema_migrations(version) VALUES (10);
  `);
}

export { SourcePostRepository } from './source-post-repository.js';
export type { NewSourcePost, SourcePost, SourcePostSummary } from './source-post-repository.js';
export { TopicRepository } from './topic-repository.js';
export type { TopicCandidate, TopicRefreshReport, TopicGenerationContext } from './topic-repository.js';
export { ArticleRepository } from './article-repository.js';
export type { ArticleDraftRecord, NewArticleDraft } from './article-repository.js';
export { ImageRepository } from './image-repository.js';
export type { GeneratedImageRecord, NewGeneratedImage } from './image-repository.js';
export { BloggerPublicationRepository } from './blogger-publication-repository.js';
export type { BloggerPublicationRecord, NewBloggerPublication, BloggerDraftCandidate } from './blogger-publication-repository.js';
export { FacebookPagePostRepository } from './facebook-page-post-repository.js';
export type { FacebookContentCandidate, FacebookPagePostRecord, NewFacebookPagePost } from './facebook-page-post-repository.js';
export { FacebookDeliveryRepository } from './facebook-delivery-repository.js';
export { ScheduleRepository } from './schedule-repository.js';
