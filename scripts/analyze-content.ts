import { MockContentAnalyzer } from '@zak/core';
import { migrate, openDatabase, SourcePostRepository } from '@zak/db';

const argument = process.argv.slice(2).find((value) => value !== '--') ?? '25';
const analyzeAll = argument.toLowerCase() === 'all';
const requested = Number(argument);
const limit = analyzeAll ? 200 : Number.isFinite(requested) ? Math.max(1, Math.min(requested, 200)) : 25;
const database = openDatabase();
try {
  migrate(database); const repository = new SourcePostRepository(database); const analyzer = new MockContentAnalyzer();
  let found = 0; let analyzed = 0; let failed = 0; let continueAnalysis = true;
  while (continueAnalysis) {
    const pending = repository.pendingAnalysis(limit);
    found += pending.length;
    for (const post of pending) {
      try { repository.saveAnalysis(post.id, await analyzer.analyze(post.originalText)); analyzed += 1; }
      catch { failed += 1; }
    }
    continueAnalysis = analyzeAll && pending.length > 0 && failed === 0;
  }
  console.log(JSON.stringify({ requested: analyzeAll ? 'all' : limit, found, analyzed, failed, progress: repository.analysisProgress() }, null, 2));
  if (failed) process.exitCode = 2;
} finally { database.close(); }
