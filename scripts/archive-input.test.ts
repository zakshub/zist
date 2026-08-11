import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadArchiveInput } from './archive-input.js';

describe('directory archive input', () => {
  it('turns each non-empty TXT file into one dated post and reports everything else', () => {
    const directory = mkdtempSync(join(tmpdir(), 'zak-archive-'));
    mkdirSync(join(directory, 'nested'));
    writeFileSync(join(directory, '12_پوسٹ_–_2020-03-04.txt'), 'پہلا\n\nدوسرا', 'utf8');
    writeFileSync(join(directory, 'empty.txt'), '  ', 'utf8');
    writeFileSync(join(directory, 'nested', 'utility.py'), 'secret code', 'utf8');

    const result = loadArchiveInput(directory);
    expect(result.input).toEqual({ kind: 'directory', sourceFiles: 3, importedCandidates: 1, emptyFiles: 1, ignoredFiles: 1 });
    expect(JSON.parse(result.content)).toEqual([{
      externalId: '12_پوسٹ_–_2020-03-04',
      source: 'BLOGGER_TXT_EXPORT',
      originalText: 'پہلا\n\nدوسرا',
      originalDate: '2020-03-04',
    }]);
  });
});
