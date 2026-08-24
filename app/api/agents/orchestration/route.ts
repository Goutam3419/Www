import { NextRequest, NextResponse } from 'next/server';
import { multiAgentOrchestrationService } from '@/services/agent-orchestration/multi-agent-orchestration-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const report = multiAgentOrchestrationService.getMasterReport(workspaceId);

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Multi-Agent Orchestration Master report' },
      { status: 500 }
    );
  }
}
