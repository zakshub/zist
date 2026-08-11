import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

interface DirectoryRecord {
  externalId: string;
  source: string;
  originalText: string;
  originalDate?: string;
}

export interface ArchiveInput {
  content: string;
  fileName: string;
  input: {
    kind: 'file' | 'directory';
    sourceFiles: number;
    importedCandidates: number;
    emptyFiles: number;
    ignoredFiles: number;
  };
}

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    })
    .sort((left, right) => left.localeCompare(right, 'en'));
}

function metadataFromFilename(path: string): Pick<DirectoryRecord, 'externalId' | 'originalDate'> {
  const name = basename(path, extname(path));
  const date = name.match(/(\d{4}-\d{2}-\d{2})$/u)?.[1];
  return date ? { externalId: name, originalDate: date } : { externalId: name };
}

export function loadArchiveInput(requestedPath: string): ArchiveInput {
  const path = resolve(requestedPath);
  if (!statSync(path).isDirectory()) {
    return {
      content: readFileSync(path, 'utf8'),
      fileName: basename(path),
      input: { kind: 'file', sourceFiles: 1, importedCandidates: 1, emptyFiles: 0, ignoredFiles: 0 },
    };
  }

  const files = listFiles(path);
  const textFiles = files.filter((file) => extname(file).toLowerCase() === '.txt');
  let emptyFiles = 0;
  const records = textFiles.flatMap((file): DirectoryRecord[] => {
    const originalText = readFileSync(file, 'utf8').trim();
    if (!originalText) {
      emptyFiles += 1;
      return [];
    }
    return [{ ...metadataFromFilename(file), source: 'BLOGGER_TXT_EXPORT', originalText }];
  });

  return {
    content: JSON.stringify(records),
    fileName: `${basename(path)}.directory.json`,
    input: {
      kind: 'directory',
      sourceFiles: files.length,
      importedCandidates: records.length,
      emptyFiles,
      ignoredFiles: files.length - textFiles.length,
    },
  };
}
