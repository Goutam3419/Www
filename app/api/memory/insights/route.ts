import { NextRequest, NextResponse } from 'next/server';
import { memoryManagerService } from '@/services/memory/memory-manager';
import { knowledgeManagerService } from '@/services/memory/knowledge-manager';
import { memoryClassificationService } from '@/services/memory/memory-classification';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const memoryReport = memoryManagerService.getMemoryReport(workspaceId);
    const knowledgeReport = knowledgeManagerService.getKnowledgeReport(workspaceId);
    const classificationReport = memoryClassificationService.getClassificationReport(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        memoryReport,
        knowledgeReport,
        classificationReport
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch memory engine data' },
      { status: 500 }
    );
  }
}
