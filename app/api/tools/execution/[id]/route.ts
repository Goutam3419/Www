import { NextRequest, NextResponse } from 'next/server';
import { executionManagerService } from '@/services/tool-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const execution = executionManagerService.getExecution(id);

    if (!execution) {
      return NextResponse.json({ success: false, error: `Execution ID '${id}' not found.` }, { status: 404 });
    }

    const progressReports = executionManagerService.getProgressReports(id);
    const metrics = executionManagerService.getMetrics(id);
    const result = executionManagerService.getResult(id);

    return NextResponse.json({
      success: true,
      execution,
      progressReports,
      metrics,
      result
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
