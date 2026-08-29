import { NextRequest, NextResponse } from 'next/server';
import { executionManagerService } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const toolId = searchParams.get('toolId') || undefined;
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const history = executionManagerService.getHistory(toolId, workspaceId);

    return NextResponse.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
