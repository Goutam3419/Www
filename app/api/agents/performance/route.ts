import { NextRequest, NextResponse } from 'next/server';
import { agentPerformanceMemory } from '@/services/agent-orchestration/agent-performance-memory';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const agentId = searchParams.get('agentId') || undefined;

    if (agentId) {
      const metrics = await agentPerformanceMemory.getAgentPerformance(agentId, workspaceId);
      const score = await agentPerformanceMemory.getAgentScore(agentId, workspaceId);

      return NextResponse.json({
        success: true,
        data: {
          agentId,
          workspaceId,
          score,
          metrics,
        },
      });
    }

    const list = await agentPerformanceMemory.listWorkspacePerformance(workspaceId);
    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        count: list.length,
        agents: list,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agent performance metrics',
      },
      { status: 500 }
    );
  }
}
