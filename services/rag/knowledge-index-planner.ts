import { KnowledgeIndexPlanReport, KnowledgeIndexPlanEntry } from '@/packages/types/src';

export class KnowledgeIndexPlannerService {
  public getIndexPlanReport(workspaceId: string = 'ws_enterprise_01'): KnowledgeIndexPlanReport {
    const plans: KnowledgeIndexPlanEntry[] = [
      {
        id: 'kip_01',
        documentId: 'doc_01',
        indexTargetKey: 'idx_core_architecture_v24',
        metadataMapping: {
          docTitle: 'AI CEO Architecture Specification v2.4',
          author: 'Chief Architect Agent',
          systemDomain: 'AI_CEO_CORE'
        },
        sourceMapping: {
          sourceType: 'LOCAL_WORKSPACE_FILE',
          uriOrPath: '/docs/architecture/ai_ceo_arch_v24.pdf'
        },
        tagMapping: ['architecture', 'ai-ceo', 'core-spec'],
        referenceMapping: ['memory_engine_spec_v1', 'tool_engine_execution'],
        isValidated: true
      },
      {
        id: 'kip_02',
        documentId: 'doc_02',
        indexTargetKey: 'idx_memory_knowledge_spec',
        metadataMapping: {
          docTitle: 'Memory & Knowledge Engine Specification',
          author: 'Memory Engine Architect',
          systemDomain: 'MEMORY_KNOWLEDGE'
        },
        sourceMapping: {
          sourceType: 'LOCAL_WORKSPACE_FILE',
          uriOrPath: '/docs/specs/memory_knowledge_engine.md'
        },
        tagMapping: ['memory', 'knowledge', 'rag'],
        referenceMapping: ['ai_ceo_master_architecture'],
        isValidated: true
      },
      {
        id: 'kip_03',
        documentId: 'doc_03',
        indexTargetKey: 'idx_rag_document_intelligence_spec',
        metadataMapping: {
          docTitle: 'RAG & Document Intelligence Requirements',
          author: 'Enterprise AI Lead',
          systemDomain: 'RAG_DOCUMENT'
        },
        sourceMapping: {
          sourceType: 'LOCAL_WORKSPACE_FILE',
          uriOrPath: '/docs/rag/rag_requirements_p92.md'
        },
        tagMapping: ['rag', 'parsing', 'chunking'],
        referenceMapping: ['memory_engine_spec_v1'],
        isValidated: true
      }
    ];

    return {
      id: `kip_${Date.now()}`,
      workspaceId,
      plans,
      totalIndexPlans: plans.length,
      validatedPlansCount: plans.filter(p => p.isValidated).length,
      generatedAt: new Date().toISOString()
    };
  }
}

export const knowledgeIndexPlannerService = new KnowledgeIndexPlannerService();
