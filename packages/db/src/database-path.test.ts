import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { databasePath } from './index.js';

describe('databasePath', () => {
  it('finds the shared workspace database when called from the Next.js package', () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      expect(databasePath(resolve(process.cwd(), 'apps/web'))).toBe(
        resolve(process.cwd(), 'storage/content-engine.sqlite'),
      );
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });
});
