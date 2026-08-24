import { NextRequest, NextResponse } from 'next/server';
import { toolEngineFacade } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;
    const queue = toolEngineFacade.getQueue(workspaceId);

    return NextResponse.json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { toolId, inputs, workspaceId, projectId, userId } = body;

    if (!toolId) {
      return NextResponse.json({ success: false, error: 'toolId is required' }, { status: 400 });
    }

    // Validate request
    const valResult = toolEngineFacade.validateToolRequest(toolId, inputs || {}, body.userRole || 'ADMIN');

    if (!valResult.valid) {
      return NextResponse.json({
        success: false,
        error: 'Tool request validation failed.',
        validation: valResult
      }, { status: 422 });
    }

    // Enqueue
    const item = toolEngineFacade.stageToolExecution({
      toolId,
      workspaceId: workspaceId || 'ws_default_01',
      projectId: projectId || 'proj_coffee_01',
      userId: userId || 'usr_ceo_001',
      inputs: valResult.inputValidation.sanitizedInputs,
      executionType: body.executionType || valResult.tool?.executionType || 'AI Controlled'
    });

    return NextResponse.json({
      success: true,
      message: 'Tool execution staged & queued successfully.',
      queueItem: item,
      validation: valResult
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
