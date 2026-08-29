import { DocumentGovernanceReport, DocumentGovernanceItem } from '@/packages/types/src';

export class DocumentGovernanceEngineService {
  public getGovernanceReport(workspaceId: string = 'ws_enterprise_01'): DocumentGovernanceReport {
    const items: DocumentGovernanceItem[] = [
      {
        docId: 'doc_01',
        docTitle: 'AI CEO Architecture Specification v2.4',
        validationStatus: 'PASSED',
        duplicateStatus: 'UNIQUE',
        version: 'v2.4.0',
        retentionPolicy: 'PERPETUAL_ENTERPRISE_ARCHIVE',
        healthScore: 98
      },
      {
        docId: 'doc_02',
        docTitle: 'Memory & Knowledge Engine Specification',
        validationStatus: 'PASSED',
        duplicateStatus: 'UNIQUE',
        version: 'v1.8.2',
        retentionPolicy: 'PERPETUAL_ENTERPRISE_ARCHIVE',
        healthScore: 95
      },
      {
        docId: 'doc_03',
        docTitle: 'RAG & Document Intelligence Requirements',
        validationStatus: 'PASSED',
        duplicateStatus: 'UNIQUE',
        version: 'v1.0.0',
        retentionPolicy: '7_YEAR_COMPLIANCE_RETENTION',
        healthScore: 92
      },
      {
        docId: 'doc_04',
        docTitle: 'Security & Compliance Guidelines',
        validationStatus: 'PASSED',
        duplicateStatus: 'UNIQUE',
        version: 'v3.1.0',
        retentionPolicy: 'ANNUAL_AUDIT_REVIEW',
        healthScore: 90
      }
    ];

    return {
      id: `dgr_${Date.now()}`,
      workspaceId,
      validatedDocsCount: items.filter(i => i.validationStatus === 'PASSED').length,
      duplicatesDetected: items.filter(i => i.duplicateStatus === 'POTENTIAL_DUPLICATE').length,
      activeVersionsCount: items.length,
      retentionComplianceScore: 100,
      documentHealthScore: 93.75,
      items,
      generatedAt: new Date().toISOString()
    };
  }
}

export const documentGovernanceEngineService = new DocumentGovernanceEngineService();
