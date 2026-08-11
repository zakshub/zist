import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { migrate, openDatabase, SourcePostRepository, type NewSourcePost } from './index.js';

const database = openDatabase();
migrate(database);
database.prepare('INSERT OR REPLACE INTO system_settings(key, value) VALUES (?, ?)').run(
  'automation_mode',
  'MANUAL',
);
const fixturePath = fileURLToPath(new URL('../../../data/sample/urdu-posts.json', import.meta.url));
const fixtures = JSON.parse(readFileSync(fixturePath, 'utf8')) as NewSourcePost[];
const posts = new SourcePostRepository(database);
let imported = 0;
for (const fixture of fixtures) {
  try { posts.create(fixture); imported += 1; }
  catch (error) {
    if (!(error instanceof Error) || !error.message.includes('UNIQUE constraint failed')) throw error;
  }
}
database.close();
console.log(`Local settings seeded; ${imported} sample posts imported.`);
