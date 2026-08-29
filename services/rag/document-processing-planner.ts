import { DocumentProcessingJob } from '@/packages/types/src';

export class DocumentProcessingPlannerService {
  public getProcessingQueue(_workspaceId: string = 'ws_enterprise_01'): DocumentProcessingJob[] {
    return [
      {
        id: 'dpj_01',
        documentId: 'doc_03',
        documentTitle: 'RAG & Document Intelligence Requirements',
        uploadQueueRank: 1,
        parsingStatus: 'IN_PROGRESS',
        processingStatus: 'EXTRACTING',
        validationStatus: 'VALIDATED',
        summary: 'Parsing markdown structure and extracting document section metadata.'
      },
      {
        id: 'dpj_02',
        documentId: 'doc_05',
        documentTitle: 'Enterprise API Gateway Reference Guide',
        uploadQueueRank: 2,
        parsingStatus: 'PENDING',
        processingStatus: 'QUEUED',
        validationStatus: 'REQUIRES_REVIEW',
        summary: 'Queued for structural analysis and index classification.'
      },
      {
        id: 'dpj_03',
        documentId: 'doc_01',
        documentTitle: 'AI CEO Architecture Specification v2.4',
        uploadQueueRank: 0,
        parsingStatus: 'COMPLETED',
        processingStatus: 'READY',
        validationStatus: 'VALIDATED',
        summary: 'Document fully indexed and verified without external vector engine dependency.'
      }
    ];
  }
}

export const documentProcessingPlannerService = new DocumentProcessingPlannerService();
