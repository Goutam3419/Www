import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId') || 'ws_default_01';

  const notifications = db.getWorkspaceNotifications(workspaceId);
  const unreadCount = notifications.filter(n => !n.read).length;

  return NextResponse.json({ success: true, count: notifications.length, unreadCount, notifications });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, title, message, actionUrl, workspaceId } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ success: false, error: 'type, title, and message are required.' }, { status: 400 });
    }

    const notif = db.createWorkspaceNotification({
      workspaceId: workspaceId || 'ws_default_01',
      type,
      title,
      message,
      actionUrl
    });

    return NextResponse.json({ success: true, notification: notif });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'notification id is required.' }, { status: 400 });
    }

    const updated = db.markWorkspaceNotificationRead(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Notification not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
