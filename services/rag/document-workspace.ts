import { DocumentWorkspaceReport } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { documentManagerService } from './document-manager';
import { documentLibraryService } from './document-library';
import { documentProcessingPlannerService } from './document-processing-planner';

export class DocumentWorkspaceService {
  public getDocumentWorkspaceReport(workspaceId: string = 'ws_enterprise_01'): DocumentWorkspaceReport {
    const existing = dbStore.getLatestDocumentWorkspaceReport(workspaceId);
    if (existing) return existing;

    const documents = documentManagerService.getRegisteredDocuments(workspaceId);
    const collections = documentLibraryService.getCollections(workspaceId);
    const processingJobs = documentProcessingPlannerService.getProcessingQueue(workspaceId);

    const report: DocumentWorkspaceReport = {
      id: `dwr_${Date.now()}`,
      workspaceId,
      documents,
      collections,
      processingJobs,
      totalDocuments: documents.length,
      totalCollections: collections.length,
      pendingJobsCount: processingJobs.filter(j => j.processingStatus !== 'READY').length,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveDocumentWorkspaceReport(report);
    return report;
  }
}

export const documentWorkspaceService = new DocumentWorkspaceService();
