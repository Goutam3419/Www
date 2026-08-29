import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/db/repositories';
import { getAuthenticatedUser, verifyWorkspaceAccess } from '@/lib/auth/server-auth';
import { agentHandoffEngine } from '@/services/agent-orchestration/agent-handoff-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; handoffId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const { id, handoffId } = await params;
    const repos = getRepositories();
    const workflow = await repos.workflows.get(id);

    if (!workflow) {
      return NextResponse.json({ success: false, error: `Workflow '${id}' not found` }, { status: 404 });
    }

    const access = await verifyWorkspaceAccess(user.userId, workflow.workspaceId);
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const approved = await agentHandoffEngine.approveHandoff(
      handoffId,
      workflow.workspaceId,
      user.userId,
      access.role || 'ADMIN'
    );

    return NextResponse.json({
      success: true,
      data: approved,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to approve handoff';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
