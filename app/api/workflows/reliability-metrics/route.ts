import { NextRequest, NextResponse } from 'next/server';
import { orchestrationMonitoringService } from '@/services/agent-orchestration/orchestration-monitoring-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_default_001';

    const metrics = await orchestrationMonitoringService.getWorkspaceReliabilityMetrics(workspaceId);

    return NextResponse.json(metrics);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
