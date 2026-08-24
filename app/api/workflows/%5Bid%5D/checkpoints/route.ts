import { NextRequest, NextResponse } from 'next/server';
import { durableCheckpointManager } from '@/services/agent-orchestration/durable-checkpoint-manager';
import { getRepositorySuite } from '@/lib/db/repositories';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_default_001';
    const executionId = searchParams.get('executionId');

    const repos = getRepositorySuite();
    const workflow = await repos.workflows.get(workflowId);
    if (!workflow) {
      return NextResponse.json({ error: `Workflow '${workflowId}' not found` }, { status: 404 });
    }

    if (workflow.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Forbidden: Workspace mismatch' }, { status: 403 });
    }

    if (executionId) {
      const checkpoints = await durableCheckpointManager.listCheckpoints(executionId, workspaceId);
      return NextResponse.json({
        workflowId,
        executionId,
        checkpoints,
      });
    }

    const latest = await durableCheckpointManager.getLatestCheckpoint(`exec_${workflowId}`, workspaceId);
    return NextResponse.json({
      workflowId,
      latestCheckpoint: latest,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
