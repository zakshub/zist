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
  `);
}

export { SourcePostRepository } from './source-post-repository.js';
export type { NewSourcePost, SourcePost, SourcePostSummary } from './source-post-repository.js';
