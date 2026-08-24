import { NextRequest, NextResponse } from 'next/server';
import { ragExecutiveDashboardService } from '@/services/rag/rag-executive-dashboard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const report = ragExecutiveDashboardService.getExecutiveMasterReport(workspaceId);

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch RAG executive master report' },
      { status: 500 }
    );
  }
}
