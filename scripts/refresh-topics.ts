import { migrate, openDatabase, TopicRepository } from '@zak/db';

const database = openDatabase();
try {
  migrate(database); const repository = new TopicRepository(database); const report = repository.refreshFromAnalysis();
  console.log(JSON.stringify({ ...report, topCandidates: repository.list(3).map((topic) => ({ name: topic.name, finalScore: topic.finalScore, sourcePostCount: topic.sourcePostCount })) }, null, 2));
} finally { database.close(); }
