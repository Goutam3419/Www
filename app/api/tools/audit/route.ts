import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId') || 'ws_default_01';

  const events = auditService.getEvents(workspaceId);
  return NextResponse.json({ success: true, count: events.length, events });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, details, workspaceId, userId, projectId } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'action is required.' }, { status: 400 });
    }

    const evt = auditService.log(action, details || {}, workspaceId || 'ws_default_01', userId || 'user_ceo_01', projectId);
    return NextResponse.json({ success: true, event: evt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
