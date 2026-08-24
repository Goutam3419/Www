import { NextRequest, NextResponse } from 'next/server';
import { agentTaskPlannerService } from '@/services/agent-orchestration/agent-task-planner';
import { agentDelegationEngineService } from '@/services/agent-orchestration/agent-delegation-engine';
import { agentCoordinationEngineService } from '@/services/agent-orchestration/agent-coordination-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const taskPlanner = agentTaskPlannerService.getTaskPlannerReport(workspaceId);
    const delegation = agentDelegationEngineService.getDelegationReport(workspaceId);
    const coordination = agentCoordinationEngineService.getCoordinationPlan(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        taskPlanner,
        delegation,
        coordination
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Agent Task Coordination data' },
      { status: 500 }
    );
  }
}
