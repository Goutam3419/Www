import { NextRequest, NextResponse } from 'next/server';
import { executionManagerService } from '@/services/tool-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reviewerId = body.reviewerId || 'usr_ceo_001';

    const approval = executionManagerService.rejectApproval(id, reviewerId);

    return NextResponse.json({
      success: true,
      message: `Approval request '${id}' rejected.`,
      approval
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
