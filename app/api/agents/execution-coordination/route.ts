import { NextRequest, NextResponse } from 'next/server';
import { agentExecutionCoordinatorService } from '@/services/agent-orchestration/agent-execution-coordinator';
import { agentApprovalManagerService } from '@/services/agent-orchestration/agent-approval-manager';
import { agentHandoffManagerService } from '@/services/agent-orchestration/agent-handoff-manager';
import { orchestrationMonitoringService } from '@/services/agent-orchestration/orchestration-monitoring-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const execution = agentExecutionCoordinatorService.getExecutionReport(workspaceId);
    const approval = agentApprovalManagerService.getApprovalReport(workspaceId);
    const handoff = agentHandoffManagerService.getHandoffReport(workspaceId);
    const monitoring = orchestrationMonitoringService.getMonitoringStatus(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        execution,
        approval,
        handoff,
        monitoring
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Execution Coordination data' },
      { status: 500 }
    );
  }
}
