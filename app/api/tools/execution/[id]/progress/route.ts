import { NextRequest, NextResponse } from 'next/server';
import { executionManagerService } from '@/services/tool-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progressReports = executionManagerService.getProgressReports(id);

    return NextResponse.json({
      success: true,
      count: progressReports.length,
      progressReports
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
