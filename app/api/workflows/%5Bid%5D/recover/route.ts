import { NextRequest, NextResponse } from 'next/server';
import { workflowRecoveryEngine } from '@/services/agent-orchestration/workflow-recovery-engine';
import { getRepositorySuite } from '@/lib/db/repositories';
import { UserRole } from '@/packages/types/src';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    const body = await req.json();
    const {
      workspaceId = 'ws_default_001',
      userId = 'usr_ceo_001',
      userRole = 'ADMIN' as UserRole,
      executionId,
      checkpointId,
    } = body;

    if (!executionId) {
      return NextResponse.json({ error: 'executionId is required for recovery' }, { status: 400 });
    }

    const repos = getRepositorySuite();
    const workflow = await repos.workflows.get(workflowId);
    if (!workflow) {
      return NextResponse.json({ error: `Workflow '${workflowId}' not found` }, { status: 404 });
    }

    if (workflow.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Forbidden: Workspace mismatch' }, { status: 403 });
    }

    const recoveryResult = await workflowRecoveryEngine.recoverExecution({
      executionId,
      workspaceId,
      userId,
      userRole,
      customCheckpointId: checkpointId,
    });

    const isSuccess = recoveryResult.status !== 'FAILED' && !recoveryResult.error;

    return NextResponse.json(recoveryResult, {
      status: isSuccess ? 200 : 500,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
