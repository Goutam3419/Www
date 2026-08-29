import { NextRequest, NextResponse } from 'next/server';
import { orchestrationGovernanceService } from '@/services/agent-orchestration/orchestration-governance';
import { conflictResolutionService } from '@/services/agent-orchestration/conflict-resolution';
import { orchestrationAnalyticsService } from '@/services/agent-orchestration/orchestration-analytics';
import { executiveDashboardService } from '@/services/agent-orchestration/executive-dashboard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const governance = orchestrationGovernanceService.getGovernanceReport(workspaceId);
    const conflicts = conflictResolutionService.getConflictReport(workspaceId);
    const analytics = orchestrationAnalyticsService.getAnalyticsReport(workspaceId);
    const executiveDashboard = executiveDashboardService.getExecutiveDashboardReport(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        governance,
        conflicts,
        analytics,
        executiveDashboard
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Governance and Analytics data' },
      { status: 500 }
    );
  }
}
