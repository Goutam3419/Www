import {
  MemoryClassificationReport,
  MemoryClassification
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class MemoryClassificationService {
  public getClassificationReport(workspaceId: string = 'ws_enterprise_01'): MemoryClassificationReport {
    const existing = dbStore.getLatestMemoryClassificationReport(workspaceId);
    if (existing) return existing;

    const classifications: MemoryClassification[] = [
      {
        id: 'cls_01',
        memoryId: 'mem_st_01',
        classificationType: 'CONVERSATION',
        confidence: 0.98,
        rationale: 'Direct user turn instruction regarding Prompt 8.1 implementation scope.'
      },
      {
        id: 'cls_02',
        memoryId: 'mem_st_02',
        classificationType: 'TASK',
        confidence: 0.95,
        rationale: 'Server status monitoring task output.'
      },
      {
        id: 'cls_03',
        memoryId: 'mem_lt_01',
        classificationType: 'CODE',
        confidence: 0.99,
        rationale: 'Core software design pattern rule regarding TypeScript and modular services.'
      },
      {
        id: 'cls_04',
        memoryId: 'mem_ws_01',
        classificationType: 'PROJECT',
        confidence: 0.96,
        rationale: 'Workspace multi-engine architecture definition.'
      },
      {
        id: 'cls_05',
        memoryId: 'kn_01',
        classificationType: 'KNOWLEDGE',
        confidence: 1.0,
        rationale: 'Framework standard reference from official documentation source.'
      }
    ];

    const report: MemoryClassificationReport = {
      id: `mcr_${Date.now()}`,
      workspaceId,
      classifications,
      summary: {
        conversationCount: 1,
        codeCount: 1,
        projectCount: 1,
        taskCount: 1,
        knowledgeCount: 1
      },
      generatedAt: new Date().toISOString()
    };

    dbStore.saveMemoryClassificationReport(report);
    return report;
  }
}

export const memoryClassificationService = new MemoryClassificationService();
