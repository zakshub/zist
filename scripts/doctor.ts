import { accessSync, constants, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

function command(file: string, args: string[]): string {
  try { return execFileSync(file, args, { encoding: 'utf8' }).trim(); } catch { return 'not available'; }
}
function configured(name: string): string { return process.env[name]?.trim() ? 'configured' : 'not configured'; }

const database = process.env.DATABASE_URL ?? './storage/content-engine.sqlite';
let writable = 'yes';
try { accessSync('.', constants.W_OK); } catch { writable = 'no'; }

console.table({
  Node: process.version,
  pnpm: command(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['--version']),
  Git: command('git', ['--version']),
  'Git repository': existsSync('.git') ? 'yes' : 'no',
  'GitHub remote': command('git', ['remote', 'get-url', 'origin']),
  Database: database,
  OpenAI: configured('OPENAI_API_KEY'),
  Blogger: configured('BLOGGER_BLOG_ID'),
  Meta: configured('META_PAGE_ACCESS_TOKEN'),
  'Workspace writable': writable,
});

