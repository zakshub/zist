import { MockContentAnalyzer } from '@zak/core';
import { migrate, openDatabase, SourcePostRepository } from '@zak/db';

const requested = Number(process.argv.slice(2).find((value) => value !== '--') ?? 25);
const limit = Number.isFinite(requested) ? Math.max(1, Math.min(requested, 200)) : 25;
const database = openDatabase();
try {
  migrate(database); const repository = new SourcePostRepository(database); const analyzer = new MockContentAnalyzer();
  const pending = repository.pendingAnalysis(limit); let analyzed = 0; let failed = 0;
  for (const post of pending) {
    try { repository.saveAnalysis(post.id, await analyzer.analyze(post.originalText)); analyzed += 1; }
    catch { failed += 1; }
  }
  console.log(JSON.stringify({ requested: limit, found: pending.length, analyzed, failed, progress: repository.analysisProgress() }, null, 2));
  if (failed) process.exitCode = 2;
} finally { database.close(); }
