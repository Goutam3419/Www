import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const workspaceId = searchParams.get('workspaceId') || 'ws_default_01';

  const results = db.globalSearch(q, workspaceId);
  return NextResponse.json({ success: true, query: q, count: results.length, results });
}
