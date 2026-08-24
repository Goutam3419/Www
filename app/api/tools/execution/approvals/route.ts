import { NextRequest, NextResponse } from 'next/server';
import { executionApprovalService } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const approvals = executionApprovalService.listApprovals(workspaceId);

    return NextResponse.json({
      success: true,
      count: approvals.length,
      approvals
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
