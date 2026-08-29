import { NextResponse } from 'next/server';
import { runUniversalToolRegistryTestSuite } from '@/lib/tools/tool-registry-tests';

export async function GET() {
  try {
    const report = await runUniversalToolRegistryTestSuite();
    return NextResponse.json({
      success: report.failedCount === 0,
      report,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
