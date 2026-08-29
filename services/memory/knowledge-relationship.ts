import {
  KnowledgeRelationshipReport,
  KnowledgeLink
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class KnowledgeRelationshipService {
  public getKnowledgeRelationships(workspaceId: string = 'ws_enterprise_01'): KnowledgeRelationshipReport {
    const existing = dbStore.getLatestKnowledgeRelationshipReport(workspaceId);
    if (existing) return existing;

    const links: KnowledgeLink[] = [
      {
        id: 'klink_01',
        sourceKey: 'nextjs_app_router',
        targetKey: 'memory_engine_spec_v1',
        relationshipType: 'PARENT_CHILD',
        weight: 0.95,
        description: 'App Router routes host Memory Engine API endpoints and UI components.'
      },
      {
        id: 'klink_02',
        sourceKey: 'firebase_integration_spec',
        targetKey: 'memory_engine_spec_v1',
        relationshipType: 'CROSS_REFERENCE',
        weight: 0.88,
        description: 'Memory Engine syncs persistent state with Firestore security rules.'
      },
      {
        id: 'klink_03',
        sourceKey: 'memory_engine_spec_v1',
        targetKey: 'ai_ceo_master_architecture',
        relationshipType: 'CATEGORY_DEPENDENCY',
        weight: 0.99,
        description: 'Memory & Knowledge Engine is Core System 8 of the AI CEO Master Architecture.'
      },
      {
        id: 'klink_04',
        sourceKey: 'tool_engine_execution',
        targetKey: 'code_generator_engine',
        relationshipType: 'RELATED',
        weight: 0.85,
        description: 'Tool Engine worker triggers Code Generator for automated refactoring.'
      }
    ];

    const report: KnowledgeRelationshipReport = {
      id: `krr_${Date.now()}`,
      workspaceId,
      links,
      parentChildCount: links.filter(l => l.relationshipType === 'PARENT_CHILD').length,
      crossReferencesCount: links.filter(l => l.relationshipType === 'CROSS_REFERENCE').length,
      categoryDependenciesCount: links.filter(l => l.relationshipType === 'CATEGORY_DEPENDENCY').length,
      totalGraphNodes: 8,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveKnowledgeRelationshipReport(report);
    return report;
  }
}

export const knowledgeRelationshipService = new KnowledgeRelationshipService();
