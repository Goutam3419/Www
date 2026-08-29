import {
  KnowledgeGovernanceReport
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class KnowledgeGovernanceService {
  public getGovernanceReport(workspaceId: string = 'ws_enterprise_01'): KnowledgeGovernanceReport {
    const existing = dbStore.getLatestKnowledgeGovernanceReport(workspaceId);
    if (existing) return existing;

    const report: KnowledgeGovernanceReport = {
      id: `kgr_${Date.now()}`,
      workspaceId,
      governanceMetrics: {
        totalValidated: 42,
        pendingApproval: 2,
        duplicateDetectedCount: 1,
        qualityScore: 97,
        healthStatus: 'HEALTHY'
      },
      duplicateEntries: [
        {
          id: 'dup_01',
          primaryKey: 'firebase_integration_spec',
          duplicateKey: 'firebase_auth_config_legacy',
          similarityScore: 0.89,
          recommendation: 'Merge legacy auth config into primary Firebase Integration Spec'
        }
      ],
      governanceAuditLog: [
        {
          id: 'gal_01',
          action: 'VALIDATE_KNOWLEDGE_INDEX',
          target: 'memory_engine_spec_v1',
          status: 'APPROVED',
          auditedAt: new Date().toISOString()
        },
        {
          id: 'gal_02',
          action: 'DUPLICATE_CHECK',
          target: 'nextjs_app_router',
          status: 'APPROVED',
          auditedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 'gal_03',
          action: 'QUALITY_SCORE_EVALUATION',
          target: 'workspace_enterprise_rules',
          status: 'APPROVED',
          auditedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        }
      ],
      generatedAt: new Date().toISOString()
    };

    dbStore.saveKnowledgeGovernanceReport(report);
    return report;
  }
}

export const knowledgeGovernanceService = new KnowledgeGovernanceService();
