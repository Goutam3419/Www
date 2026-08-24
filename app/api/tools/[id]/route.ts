import { NextRequest, NextResponse } from 'next/server';
import { toolEngineFacade } from '@/services/tool-engine';
import { ToolStatus } from '@/packages/types/src';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tool = toolEngineFacade.getTool(id);

    if (!tool) {
      return NextResponse.json({ success: false, error: `Tool ID '${id}' not found.` }, { status: 404 });
    }

    const validation = toolEngineFacade.validateToolRequest(id, {});
    const logs = toolEngineFacade.getLogs(id);
    const events = toolEngineFacade.getEvents(id);

    return NextResponse.json({
      success: true,
      tool,
      permissionInfo: validation.permissionCheck,
      logsCount: logs.length,
      events
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.status) {
      const updated = toolEngineFacade.setToolStatus(id, body.status as ToolStatus);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Tool not found.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Tool status updated to ${body.status}.`,
        tool: updated
      });
    }

    // Generic update
    const tool = toolEngineFacade.getTool(id);
    if (!tool) {
      return NextResponse.json({ success: false, error: 'Tool not found.' }, { status: 404 });
    }

    const updatedTool = toolEngineFacade.registerTool({
      ...tool,
      ...body
    });

    return NextResponse.json({
      success: true,
      message: 'Tool definition updated.',
      tool: updatedTool
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = toolEngineFacade.setToolStatus(id, 'Disabled');
    return NextResponse.json({
      success: true,
      message: `Tool ID '${id}' has been disabled.`,
      tool: deleted
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
