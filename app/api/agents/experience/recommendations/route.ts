import { NextRequest, NextResponse } from 'next/server';
import { agentExperienceManager } from '@/services/agent-orchestration/experience-memory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId = 'ws_enterprise_01',
      query = '',
      agentRole,
      errorCategory,
      toolId,
    } = body;

    const recommendations = await agentExperienceManager.generateRecommendations(
      workspaceId,
      query,
      {
        agentRole,
        errorCategory,
        toolId,
      }
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}
