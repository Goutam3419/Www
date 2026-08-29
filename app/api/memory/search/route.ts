import { NextRequest, NextResponse } from 'next/server';
import { memorySearchEngineService } from '@/services/memory/memory-search';
import { contextRetrievalService } from '@/services/memory/context-retrieval';
import { knowledgeIndexService } from '@/services/memory/knowledge-index';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const query = searchParams.get('query') || 'Prompt 8.1 Firebase architecture';

    const searchReport = memorySearchEngineService.searchMemory(workspaceId, query);
    const contextReport = contextRetrievalService.getContextRetrieval(workspaceId);
    const indexReport = knowledgeIndexService.getKnowledgeIndex(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        searchReport,
        contextReport,
        indexReport
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to execute memory search & retrieval' },
      { status: 500 }
    );
  }
}
