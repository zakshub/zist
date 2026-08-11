import { openDatabase } from '@zak/db';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  const checkedAt = new Date().toISOString();
  try {
    const database = openDatabase();
    try {
      database.prepare('SELECT 1').get();
    } finally {
      database.close();
    }
    return Response.json({ status: 'ok', database: 'ok', checkedAt });
  } catch {
    return Response.json({ status: 'degraded', database: 'unavailable', checkedAt }, { status: 503 });
  }
}
