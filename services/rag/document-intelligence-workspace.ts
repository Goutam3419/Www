import { DocumentIntelligenceReport } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { documentParserManagerService } from './document-parser-manager';
import { documentChunkManagerService } from './document-chunk-manager';
import { knowledgeIndexPlannerService } from './knowledge-index-planner';

export class DocumentIntelligenceService {
  public getDocumentIntelligenceReport(workspaceId: string = 'ws_enterprise_01'): DocumentIntelligenceReport {
    const existing = dbStore.getLatestDocumentIntelligenceReport(workspaceId);
    if (existing) return existing;

    const parserReport = documentParserManagerService.getParserReport(workspaceId);
    const chunkReport = documentChunkManagerService.getChunkReport(workspaceId);
    const indexPlanReport = knowledgeIndexPlannerService.getIndexPlanReport(workspaceId);

    const report: DocumentIntelligenceReport = {
      id: `dir_${Date.now()}`,
      workspaceId,
      parserReport,
      chunkReport,
      indexPlanReport,
      processingOverview: {
        totalDocumentsPlanned: 4,
        totalChunksEstimated: chunkReport.totalChunksCount,
        indexPlanningHealthScore: 98,
        status: 'OPTIMAL'
      },
      generatedAt: new Date().toISOString()
    };

    dbStore.saveDocumentIntelligenceReport(report);
    return report;
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();
