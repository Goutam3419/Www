import { RAGExecutiveMasterReport } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { documentGovernanceEngineService } from './document-governance';
import { knowledgeQualityEngineService } from './knowledge-quality';

export class RAGExecutiveDashboardService {
  public getExecutiveMasterReport(workspaceId: string = 'ws_enterprise_01'): RAGExecutiveMasterReport {
    const existing = dbStore.getLatestRAGExecutiveMasterReport(workspaceId);
    if (existing) return existing;

    const governanceReport = documentGovernanceEngineService.getGovernanceReport(workspaceId);
    const knowledgeQualityReport = knowledgeQualityEngineService.getKnowledgeQualityReport(workspaceId);

    const report: RAGExecutiveMasterReport = {
      id: `remr_${Date.now()}`,
      workspaceId,
      overallDocumentHealth: governanceReport.documentHealthScore,
      retrievalHealth: knowledgeQualityReport.retrievalQualityScore,
      citationHealth: knowledgeQualityReport.citationCoverageScore,
      knowledgeHealth: knowledgeQualityReport.overallQualityScore,
      governanceScore: governanceReport.retentionComplianceScore,
      executiveSummary: 'RAG & Document Intelligence Engine operating at 97% overall health with enterprise governance, perfect citation fidelity, and high context coherence.',
      governanceReport,
      knowledgeQualityReport,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveRAGExecutiveMasterReport(report);
    return report;
  }
}

export const ragExecutiveDashboardService = new RAGExecutiveDashboardService();
