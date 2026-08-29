import { DocumentCollection } from '@/packages/types/src';

export class DocumentLibraryService {
  public getCollections(_workspaceId: string = 'ws_enterprise_01'): DocumentCollection[] {
    return [
      {
        id: 'coll_core_architecture',
        name: 'Core Architecture',
        description: 'System specifications, architectural designs, and platform blueprints.',
        documentCount: 12,
        folderPath: '/docs/architecture',
        tags: ['architecture', 'core', 'specifications']
      },
      {
        id: 'coll_rag_docs',
        name: 'RAG & Knowledge Base',
        description: 'Document intelligence assets, domain knowledge, and reference manuals.',
        documentCount: 8,
        folderPath: '/docs/rag',
        tags: ['rag', 'knowledge', 'intelligence']
      },
      {
        id: 'coll_governance',
        name: 'Security & Governance',
        description: 'Compliance standards, privacy rules, and governance audit reports.',
        documentCount: 5,
        folderPath: '/docs/security',
        tags: ['security', 'compliance', 'audit']
      }
    ];
  }
}

export const documentLibraryService = new DocumentLibraryService();
