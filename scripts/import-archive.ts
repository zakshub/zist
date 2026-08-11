import { importArchive, inspectArchive } from '@zak/importer';
import { ArchiveImportRunRepository, migrate, openDatabase, SourcePostRepository } from '@zak/db';
import { loadArchiveInput } from './archive-input.js';

const requestedPath = process.argv.slice(2).find((argument) => argument !== '--');
if (!requestedPath) { console.error('Usage: pnpm import:archive -- <archive.txt|json|csv|directory>'); process.exit(1); }
const archive = loadArchiveInput(requestedPath); const { content, fileName } = archive;
const inspection = inspectArchive(content, fileName);
if (!inspection.safeToImport) { console.error(JSON.stringify({ imported: false, reason: 'Credential-like tokens detected. Remove secrets and preview again.', inspection }, null, 2)); process.exit(2); }
const database = openDatabase(); let runId: string | undefined;
try {
  migrate(database); const runs = new ArchiveImportRunRepository(database); const previous = runs.find(inspection.checksum);
  if (previous) { console.log(JSON.stringify({ imported: false, reason: 'Archive checksum already processed.', previous }, null, 2)); process.exit(0); }
  const run = runs.start({ checksum: inspection.checksum, fileName, format: inspection.format, total: inspection.records, privacySignals: inspection.privacySignals }); runId = run.id;
  database.exec('BEGIN');
  try {
    const report = importArchive(content, fileName, new SourcePostRepository(database));
    database.exec('COMMIT'); runs.complete(run.id, report);
    const issueLimit = 20;
    console.log(JSON.stringify({
      imported: true,
      input: archive.input,
      inspection,
      report: { ...report, issues: report.issues.slice(0, issueLimit), issuesTruncated: Math.max(0, report.issues.length - issueLimit) },
    }, null, 2));
  }
  catch (error) { database.exec('ROLLBACK'); throw error; }
} catch (error) {
  if (runId) new ArchiveImportRunRepository(database).fail(runId, error instanceof Error ? error.message : 'Unknown import failure.'); throw error;
} finally { database.close(); }
