import { migrate, openDatabase } from './index.js';

const database = openDatabase();
migrate(database);
database.prepare('INSERT OR REPLACE INTO system_settings(key, value) VALUES (?, ?)').run(
  'automation_mode',
  'MANUAL',
);
database.close();
console.log('Local settings seeded.');

