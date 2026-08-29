import { NextRequest, NextResponse } from 'next/server';
import { documentWorkspaceService } from '@/services/rag/document-workspace';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const report = documentWorkspaceService.getDocumentWorkspaceReport(workspaceId);

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch document workspace report' },
      { status: 500 }
    );
  }
}
