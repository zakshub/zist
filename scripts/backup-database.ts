import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { backup } from 'node:sqlite';
import { databasePath, openDatabase } from '@zak/db';

const destinationDirectory = resolve(process.argv.slice(2).find((value) => value !== '--') ?? 'backups');
const configuredRetention = Number(process.env.BACKUP_RETENTION ?? 14);
if (!Number.isSafeInteger(configuredRetention) || configuredRetention < 1) {
  throw new Error('BACKUP_RETENTION must be a positive integer.');
}
const retention = configuredRetention;
const sourcePath = databasePath();
const timestamp = new Date().toISOString().replace(/[:.]/gu, '-');
const destinationPath = join(destinationDirectory, `content-engine-${timestamp}.sqlite`);

mkdirSync(destinationDirectory, { recursive: true });
mkdirSync(dirname(sourcePath), { recursive: true });
const database = openDatabase(sourcePath);
try {
  await backup(database, destinationPath);
} finally {
  database.close();
}

const prefix = 'content-engine-';
const backups = readdirSync(destinationDirectory)
  .filter((name) => name.startsWith(prefix) && name.endsWith('.sqlite'))
  .sort()
  .reverse();
for (const expired of backups.slice(retention)) rmSync(join(destinationDirectory, expired));

console.log(JSON.stringify({ backup: basename(destinationPath), directory: destinationDirectory, retained: Math.min(backups.length, retention) }));
