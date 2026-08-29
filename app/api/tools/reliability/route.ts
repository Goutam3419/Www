import { NextRequest, NextResponse } from 'next/server';
import { toolReliabilityEngine } from '@/services/agent-orchestration/tool-reliability-engine';
import { ToolProviderType } from '@/packages/types/src';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const toolId = searchParams.get('toolId') || undefined;

    if (toolId) {
      const tool = await toolReliabilityEngine.getToolReliability(workspaceId, toolId);
      const isHealthy = await toolReliabilityEngine.isToolHealthy(workspaceId, toolId);
      return NextResponse.json({
        success: true,
        data: {
          workspaceId,
          toolId,
          isHealthy,
          tool,
        },
      });
    }

    const report = await toolReliabilityEngine.getReliabilityReport(workspaceId);
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tool reliability report',
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
      toolId,
      toolName = toolId,
      success,
      latencyMs = 50,
      errorCategory,
      provider,
    } = body;

    if (!toolId || success === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters (toolId, success)' },
        { status: 400 }
      );
    }

    const record = await toolReliabilityEngine.recordToolExecution(
      workspaceId,
      toolId,
      toolName,
      Boolean(success),
      latencyMs,
      errorCategory,
      provider as ToolProviderType
    );

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record tool execution',
      },
      { status: 500 }
    );
  }
}
