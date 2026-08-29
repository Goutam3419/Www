import { NextRequest, NextResponse } from 'next/server';
import { workspaceManager } from '@/services/workspace/workspace-manager';
import { workspaceContextEngine } from '@/services/workspace/workspace-context-engine';
import { tenantIsolationEngine } from '@/services/workspace/tenant-isolation-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const userId = searchParams.get('userId') || 'usr_ceo_001';

    const overview = tenantIsolationEngine.getWorkspaceOverviewReport(workspaceId, userId);
    const allWorkspaces = workspaceManager.getAllWorkspaces();

    return NextResponse.json({
      success: true,
      data: {
        overview,
        allWorkspaces
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Workspace overview' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, workspaceId, userId = 'usr_ceo_001', name, description, settings } = body;

    if (action === 'SWITCH') {
      const updatedCtx = workspaceContextEngine.switchWorkspace(userId, workspaceId);
      const overview = tenantIsolationEngine.getWorkspaceOverviewReport(workspaceId, userId);
      return NextResponse.json({ success: true, data: { context: updatedCtx, overview } });
    }

    if (action === 'CREATE') {
      const newWs = workspaceManager.createWorkspace(name, description, userId, 'ceo@aistudio.io', settings);
      const updatedCtx = workspaceContextEngine.switchWorkspace(userId, newWs.id);
      const overview = tenantIsolationEngine.getWorkspaceOverviewReport(newWs.id, userId);
      return NextResponse.json({ success: true, data: { workspace: newWs, context: updatedCtx, overview } });
    }

    if (action === 'UPDATE_SETTINGS') {
      const updated = workspaceManager.updateWorkspaceSettings(workspaceId, settings);
      const overview = tenantIsolationEngine.getWorkspaceOverviewReport(workspaceId, userId);
      return NextResponse.json({ success: true, data: { workspace: updated, overview } });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Workspace API operation failed' },
      { status: 500 }
    );
  }
}
