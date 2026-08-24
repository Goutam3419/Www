import { NextRequest, NextResponse } from 'next/server';
import { toolEngineFacade } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const toolId = searchParams.get('toolId') || undefined;
    const logs = toolEngineFacade.getLogs(toolId);

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
