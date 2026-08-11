import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { importArchive } from '@zak/importer';
import { migrate, openDatabase, SourcePostRepository } from '@zak/db';

const requestedPath = process.argv.slice(2).find((argument) => argument !== '--');
if (!requestedPath) {
  console.error('Usage: pnpm import:archive -- <path-to-archive.txt|json|csv>');
  process.exit(1);
}

const archivePath = resolve(requestedPath);
const database = openDatabase();
try {
  migrate(database);
  const report = importArchive(readFileSync(archivePath, 'utf8'), basename(archivePath), new SourcePostRepository(database));
  console.log(JSON.stringify(report, null, 2));
  if (report.invalid > 0) process.exitCode = 2;
} finally {
  database.close();
}
