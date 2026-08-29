import { DocumentRecord } from '@/packages/types/src';

export class DocumentManagerService {
  public getRegisteredDocuments(workspaceId: string = 'ws_enterprise_01'): DocumentRecord[] {
    return [
      {
        id: 'doc_01',
        title: 'AI CEO Architecture Specification v2.4',
        category: 'ARCHITECTURE',
        fileType: 'PDF',
        sizeKb: 1420,
        workspaceId,
        projectId: 'proj_enterprise_01',
        tags: ['architecture', 'ai-ceo', 'spec'],
        collectionId: 'coll_core_architecture',
        folderPath: '/docs/architecture',
        registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        status: 'PROCESSED',
        metadata: {
          author: 'Chief Architect Agent',
          version: '2.4.0',
          language: 'EN',
          checksum: 'sha256_e8f192a00b1'
        }
      },
      {
        id: 'doc_02',
        title: 'Memory & Knowledge Engine Specification',
        category: 'SPECIFICATION',
        fileType: 'MD',
        sizeKb: 380,
        workspaceId,
        projectId: 'proj_enterprise_01',
        tags: ['memory', 'knowledge-engine', 'rag'],
        collectionId: 'coll_core_architecture',
        folderPath: '/docs/specs',
        registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: 'PROCESSED',
        metadata: {
          author: 'Memory Engine Architect',
          version: '1.0.0',
          language: 'EN',
          checksum: 'sha256_a94b8191c02'
        }
      },
      {
        id: 'doc_03',
        title: 'RAG & Document Intelligence Requirements',
        category: 'SPECIFICATION',
        fileType: 'MD',
        sizeKb: 210,
        workspaceId,
        projectId: 'proj_enterprise_01',
        tags: ['rag', 'documents', 'prompt-9.1'],
        collectionId: 'coll_rag_docs',
        folderPath: '/docs/rag',
        registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        status: 'PARSED',
        metadata: {
          author: 'Enterprise AI Lead',
          version: '9.1.0',
          language: 'EN',
          checksum: 'sha256_f02c91823a4'
        }
      },
      {
        id: 'doc_04',
        title: 'Security & Compliance Guidelines',
        category: 'COMPLIANCE',
        fileType: 'PDF',
        sizeKb: 890,
        workspaceId,
        projectId: 'proj_enterprise_01',
        tags: ['security', 'compliance', 'privacy'],
        collectionId: 'coll_governance',
        folderPath: '/docs/security',
        registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        status: 'PROCESSED',
        metadata: {
          author: 'Compliance Officer',
          version: '3.1.2',
          language: 'EN',
          checksum: 'sha256_b10c92100e5'
        }
      }
    ];
  }
}

export const documentManagerService = new DocumentManagerService();
