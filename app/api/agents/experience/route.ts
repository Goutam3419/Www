import { NextRequest, NextResponse } from 'next/server';
import { agentExperienceManager } from '@/services/agent-orchestration/experience-memory';
import { ExperienceEventType, AgentRole } from '@/packages/types/src';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const query = searchParams.get('query') || undefined;
    const eventType = searchParams.get('eventType') as ExperienceEventType | undefined;
    const agentRole = searchParams.get('agentRole') as AgentRole | undefined;
    const successOnly = searchParams.get('successOnly') === 'true' ? true : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

    const results = await agentExperienceManager.searchExperiences({
      workspaceId,
      query,
      eventType,
      agentRole,
      successOnly,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        count: results.length,
        results,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search experience memory',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId = 'ws_enterprise_01',
      workflowId,
      projectId,
      agentId,
      agentRole,
      stepId,
      eventType,
      inputSummary,
      actionSummary,
      resultSummary,
      success,
      errorCategory,
      resolution,
      confidence,
      tags,
      metadata,
    } = body;

    if (!eventType || !inputSummary || !actionSummary || !resultSummary || success === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required experience fields (eventType, inputSummary, actionSummary, resultSummary, success)',
        },
        { status: 400 }
      );
    }

    const recorded = await agentExperienceManager.recordExperience({
      workspaceId,
      workflowId,
      projectId,
      agentId,
      agentRole,
      stepId,
      eventType,
      inputSummary,
      actionSummary,
      resultSummary,
      success: Boolean(success),
      errorCategory,
      resolution,
      confidence,
      tags,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: recorded,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record experience',
      },
      { status: 500 }
    );
  }
}
