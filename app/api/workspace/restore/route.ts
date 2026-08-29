import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId') || 'ws_default_01';

  const state = db.getWorkspaceState(workspaceId);
  return NextResponse.json({ success: true, state: state || null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, openProjectId, openTabs, chatPosition, panelSizes, filters, selectedToolId } = body;

    const saved = db.saveWorkspaceState({
      workspaceId: workspaceId || 'ws_default_01',
      openProjectId: openProjectId || 'proj_coffeeshop_01',
      openTabs: openTabs || [],
      chatPosition: chatPosition || { x: 0, y: 0, width: 400, height: 600 },
      panelSizes: panelSizes || { leftSidebarWidth: 260, rightSidebarWidth: 320, bottomPanelHeight: 280 },
      filters: filters || {},
      selectedToolId
    });

    return NextResponse.json({ success: true, state: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
