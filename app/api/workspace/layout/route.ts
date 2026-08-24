import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'usr_ceo_001';
  const workspaceId = searchParams.get('workspaceId') || 'ws_default_01';

  const layout = db.getWorkspaceLayout(userId, workspaceId);
  return NextResponse.json({ success: true, layout });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'usr_ceo_001';
    const workspaceId = body.workspaceId || 'ws_default_01';

    const updated = db.updateWorkspaceLayout(userId, workspaceId, body);
    return NextResponse.json({ success: true, layout: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
