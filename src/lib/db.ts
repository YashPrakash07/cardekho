import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';
import { ShortlistRecord } from '@/types';

const dbPath = join(process.cwd(), 'db.json');

const defaultRecord: ShortlistRecord = { shortlist: [] };

async function ensureDb(): Promise<void> {
  try {
    await access(dbPath);
  } catch {
    await writeFile(dbPath, JSON.stringify(defaultRecord, null, 2), 'utf8');
  }
}

export async function readShortlist(): Promise<ShortlistRecord> {
  await ensureDb();
  const content = await readFile(dbPath, 'utf8');
  return JSON.parse(content) as ShortlistRecord;
}

export async function writeShortlist(record: ShortlistRecord): Promise<ShortlistRecord> {
  await writeFile(dbPath, JSON.stringify(record, null, 2), 'utf8');
  return record;
}
