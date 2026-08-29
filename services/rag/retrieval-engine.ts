import { RetrievalEngineReport, RetrievalQueryResult } from '@/packages/types/src';

export class RetrievalEngineService {
  public getRetrievalReport(workspaceId: string = 'ws_enterprise_01'): RetrievalEngineReport {
    const recentQueries: RetrievalQueryResult[] = [
      {
        queryId: 'rq_01',
        workspaceId,
        projectId: 'proj_enterprise_01',
        retrievedDocsCount: 3,
        retrievedChunksCount: 8,
        retrievalTimeMs: 14,
        sources: ['doc_01', 'doc_02', 'doc_03'],
        metadataMatches: {
          category: 'SPECIFICATION',
          domain: 'AI_CEO_CORE',
          language: 'EN'
        }
      },
      {
        queryId: 'rq_02',
        workspaceId,
        projectId: 'proj_enterprise_01',
        retrievedDocsCount: 2,
        retrievedChunksCount: 5,
        retrievalTimeMs: 9,
        sources: ['doc_02', 'doc_04'],
        metadataMatches: {
          category: 'COMPLIANCE',
          domain: 'GOVERNANCE'
        }
      }
    ];

    return {
      id: `rer_${Date.now()}`,
      workspaceId,
      workspaceScope: 'ws_enterprise_01',
      projectScope: 'proj_enterprise_01',
      knowledgeScope: 'ALL_ENTERPRISE_DOCS',
      stats: {
        totalQueriesProcessed: 128,
        avgRetrievalLatencyMs: 11.5,
        cacheHitRatio: 0.94
      },
      recentQueries,
      generatedAt: new Date().toISOString()
    };
  }
}

export const retrievalEngineService = new RetrievalEngineService();
