import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/db/repositories';
import { getAuthenticatedUser, verifyWorkspaceAccess } from '@/lib/auth/server-auth';
import { workflowExecutionEngine } from '@/services/agent-orchestration/workflow-execution-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const { id } = await params;
    const repos = getRepositories();
    const workflow = await repos.workflows.get(id);

    if (!workflow) {
      return NextResponse.json({ success: false, error: `Workflow '${id}' not found` }, { status: 404 });
    }

    const access = await verifyWorkspaceAccess(user.userId, workflow.workspaceId, 'MEMBER');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    await workflowExecutionEngine.cancelWorkflow(id, workflow.workspaceId, user.userId);

    return NextResponse.json({
      success: true,
      message: `Workflow '${id}' cancelled successfully`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel workflow';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
