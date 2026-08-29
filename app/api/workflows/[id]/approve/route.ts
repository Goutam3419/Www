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

    const access = await verifyWorkspaceAccess(user.userId, workflow.workspaceId, 'ADMIN');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: 'Administrative permission required for approval' }, { status: 403 });
    }

    const body = await req.json();
    const { stepId, approved = true, notes } = body;

    if (!stepId) {
      return NextResponse.json({ success: false, error: 'stepId is required' }, { status: 400 });
    }

    const result = await workflowExecutionEngine.approveWorkflowStep(
      id,
      stepId,
      workflow.workspaceId,
      user.userId,
      Boolean(approved),
      notes
    );

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process approval';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
