import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId') || 'ws_default_01';
  const projectId = searchParams.get('projectId') || undefined;

  const activities = db.getWorkspaceActivities(workspaceId, projectId);
  return NextResponse.json({ success: true, count: activities.length, activities });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, title, description, details, workspaceId, projectId } = body;

    if (!eventType || !title) {
      return NextResponse.json({ success: false, error: 'eventType and title are required.' }, { status: 400 });
    }

    const activity = db.logWorkspaceActivity({
      workspaceId: workspaceId || 'ws_default_01',
      projectId,
      eventType,
      title,
      description: description || '',
      details
    });

    return NextResponse.json({ success: true, activity });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
