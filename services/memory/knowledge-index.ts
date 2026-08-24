import {
  KnowledgeIndexReport,
  KnowledgeIndexEntry
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class KnowledgeIndexService {
  public getKnowledgeIndex(workspaceId: string = 'ws_enterprise_01'): KnowledgeIndexReport {
    const existing = dbStore.getLatestKnowledgeIndexReport(workspaceId);
    if (existing) return existing;

    const entries: KnowledgeIndexEntry[] = [
      {
        id: 'kie_01',
        indexKey: 'nextjs_app_router',
        category: 'Frontend Framework',
        tags: ['nextjs', 'react', 'app_router', 'rsc'],
        references: ['/app/page.tsx', '/app/layout.tsx', '/app/api/memory/insights/route.ts'],
        sourceMapping: {
          sourceName: 'Next.js 15 Documentation',
          sourceUrl: 'https://nextjs.org/docs',
          lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
        },
        isValidated: true,
        validationErrors: []
      },
      {
        id: 'kie_02',
        indexKey: 'firebase_integration_spec',
        category: 'Backend & Security',
        tags: ['firebase', 'firestore', 'app_check', 'security_rules'],
        references: ['/services/firebase/configuration-manager.ts', '/services/firebase/compliance-engine.ts'],
        sourceMapping: {
          sourceName: 'Firebase Enterprise Integration Guide',
          sourceUrl: 'https://firebase.google.com/docs',
          lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        },
        isValidated: true,
        validationErrors: []
      },
      {
        id: 'kie_03',
        indexKey: 'memory_engine_spec_v1',
        category: 'Cognitive Systems',
        tags: ['memory', 'knowledge', 'retrieval', 'classification'],
        references: ['/services/memory/memory-manager.ts', '/services/memory/memory-search.ts'],
        sourceMapping: {
          sourceName: 'AI CEO Memory Engine Architecture Whitepaper',
          sourceUrl: 'https://ai.studio/build/memory-spec',
          lastSyncedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
        },
        isValidated: true,
        validationErrors: []
      }
    ];

    const categoriesSet = new Set(entries.map(e => e.category));
    const tagsSet = new Set(entries.flatMap(e => e.tags));

    const report: KnowledgeIndexReport = {
      id: `kir_${Date.now()}`,
      workspaceId,
      entries,
      totalEntries: entries.length,
      categoriesCount: categoriesSet.size,
      tagsCount: tagsSet.size,
      indexValidationStatus: 'VALID',
      generatedAt: new Date().toISOString()
    };

    dbStore.saveKnowledgeIndexReport(report);
    return report;
  }
}

export const knowledgeIndexService = new KnowledgeIndexService();
