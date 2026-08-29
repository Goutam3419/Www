import { NextRequest, NextResponse } from 'next/server';
import { executionManagerService } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    const executions = executionManagerService.listExecutions(workspaceId, projectId);

    return NextResponse.json({
      success: true,
      count: executions.length,
      executions
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolId, workspaceId, projectId, userId, inputs, conversationId, aiSessionId, currentGoal, userRole } = body;

    if (!toolId) {
      return NextResponse.json({ success: false, error: 'toolId is required parameter.' }, { status: 400 });
    }

    const result = await executionManagerService.startExecution({
      toolId,
      workspaceId: workspaceId || 'ws_default_01',
      projectId: projectId || 'proj_coffee_01',
      userId: userId || 'usr_ceo_001',
      userRole: userRole || 'ADMIN',
      inputs: inputs || {},
      conversationId,
      aiSessionId,
      currentGoal
    });

    return NextResponse.json({
      success: true,
      message: result.approvalRequired
        ? 'Execution created and waiting for administrative approval.'
        : 'Tool execution pipeline started and completed.',
      execution: result.execution,
      approvalRequired: result.approvalRequired,
      approvalRequest: result.approvalRequest
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
