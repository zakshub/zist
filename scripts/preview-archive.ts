import { inspectArchive } from '@zak/importer';
import { loadArchiveInput } from './archive-input.js';

const requestedPath = process.argv.slice(2).find((argument) => argument !== '--');
if (!requestedPath) {
  console.error('Usage: pnpm import:preview -- <archive.txt|json|csv|directory>');
  process.exit(1);
}
const archive = loadArchiveInput(requestedPath);
console.log(JSON.stringify({ input: archive.input, inspection: inspectArchive(archive.content, archive.fileName) }, null, 2));
