import { NextRequest, NextResponse } from 'next/server';
import { memoryLifecycleService } from '@/services/memory/memory-lifecycle';
import { knowledgeGovernanceService } from '@/services/memory/knowledge-governance';
import { memoryExecutiveDashboardService } from '@/services/memory/memory-executive-dashboard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const lifecycleReport = memoryLifecycleService.getLifecycleReport(workspaceId);
    const governanceReport = knowledgeGovernanceService.getGovernanceReport(workspaceId);
    const masterDashboardReport = memoryExecutiveDashboardService.getMasterDashboardReport(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        lifecycleReport,
        governanceReport,
        masterDashboardReport
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch executive memory reports' },
      { status: 500 }
    );
  }
}
