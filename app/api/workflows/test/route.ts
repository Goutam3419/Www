import { NextResponse } from 'next/server';
import { runWorkflowEngineTestSuite } from '@/lib/workflows/workflow-engine-tests';

export async function GET() {
  try {
    const report = await runWorkflowEngineTestSuite();
    return NextResponse.json({
      success: report.failedCount === 0,
      report,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
