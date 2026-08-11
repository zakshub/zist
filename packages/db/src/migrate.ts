import { databasePath, migrate, openDatabase } from './index.js';

const database = openDatabase();
migrate(database);
database.close();
console.log(`Database migrated: ${databasePath()}`);

