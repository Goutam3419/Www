import { NextRequest, NextResponse } from 'next/server';
import { executionManagerService } from '@/services/tool-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Cancelled by user';

    const cancelled = executionManagerService.cancelExecution(id, reason);
    if (!cancelled) {
      return NextResponse.json({ success: false, error: `Execution ID '${id}' not found.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Execution '${id}' cancelled successfully.`,
      execution: cancelled
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
