import { NextResponse } from 'next/server';
import { readShortlist, writeShortlist } from '@/lib/db';
import type { ShortlistRecord } from '@/types';

export async function GET() {
  const record = await readShortlist();
  return NextResponse.json(record);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ShortlistRecord;
  const record = await writeShortlist(payload);
  return NextResponse.json(record);
}
