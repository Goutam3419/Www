import { RetrievalWorkspaceReport } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { retrievalEngineService } from './retrieval-engine';
import { contextRankingEngineService } from './context-ranking-engine';
import { citationIntelligenceEngineService } from './citation-intelligence-engine';

export class RetrievalWorkspaceService {
  public getRetrievalWorkspaceReport(workspaceId: string = 'ws_enterprise_01'): RetrievalWorkspaceReport {
    const existing = dbStore.getLatestRetrievalWorkspaceReport(workspaceId);
    if (existing) return existing;

    const retrievalReport = retrievalEngineService.getRetrievalReport(workspaceId);
    const rankingReport = contextRankingEngineService.getRankingReport(workspaceId);
    const citationReport = citationIntelligenceEngineService.getCitationReport(workspaceId);

    const report: RetrievalWorkspaceReport = {
      id: `rwr_${Date.now()}`,
      workspaceId,
      retrievalReport,
      rankingReport,
      citationReport,
      analytics: {
        totalRetrievalEvents: retrievalReport.stats.totalQueriesProcessed,
        avgRankingLatencyMs: 3.2,
        citationAccuracyScore: 100
      },
      generatedAt: new Date().toISOString()
    };

    dbStore.saveRetrievalWorkspaceReport(report);
    return report;
  }
}

export const retrievalWorkspaceService = new RetrievalWorkspaceService();
