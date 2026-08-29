import {
  MemoryManagerReport,
  MemoryItem
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class MemoryManagerService {
  public getMemoryReport(workspaceId: string = 'ws_enterprise_01'): MemoryManagerReport {
    const existing = dbStore.getLatestMemoryManagerReport(workspaceId);
    if (existing) return existing;

    const shortTermMemory: MemoryItem[] = [
      {
        id: 'mem_st_01',
        type: 'SHORT_TERM',
        content: 'User requested Prompt 8.1 implementation for Memory & Knowledge Engine.',
        tags: ['prompt8.1', 'user_intent', 'active_turn'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'mem_st_02',
        type: 'SHORT_TERM',
        content: 'Dev server running cleanly on port 3000 behind reverse proxy.',
        tags: ['runtime', 'dev_server', 'port_3000'],
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
      }
    ];

    const longTermMemory: MemoryItem[] = [
      {
        id: 'mem_lt_01',
        type: 'LONG_TERM',
        content: 'Enterprise Architecture rule: Prefer modular services, read-only UI components, and TypeScript type safety.',
        tags: ['architecture', 'enterprise', 'guidelines'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'mem_lt_02',
        type: 'LONG_TERM',
        content: 'AI CEO Agent System Persona: Senior Lead Architect with strict scope boundary adherence.',
        tags: ['persona', 'system_prompt', 'ai_ceo'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
      }
    ];

    const sessionMemory: MemoryItem[] = [
      {
        id: 'mem_se_01',
        type: 'SESSION',
        content: 'Completed Firebase Integration Engine Prompts 7.1 through 7.4 with 15 workspace sub-panels.',
        tags: ['session', 'firebase', 'prompt7.4'],
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 'mem_se_02',
        type: 'SESSION',
        content: 'Initiated Memory Engine initialization session for active workspace context.',
        tags: ['session', 'memory_engine'],
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ];

    const workspaceMemory: MemoryItem[] = [
      {
        id: 'mem_ws_01',
        type: 'WORKSPACE',
        content: 'Workspace configured with multi-engine architecture (AI Core, Code Engine, Tool Engine, Deployment, GitHub, Firebase, Memory).',
        tags: ['workspace', 'configuration', 'multi_engine'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      }
    ];

    const projectMemory: MemoryItem[] = [
      {
        id: 'mem_pr_01',
        type: 'PROJECT',
        content: 'Primary Project Target: Enterprise Cloud Studio Applet (Next.js 15, Tailwind v4, TypeScript).',
        tags: ['project', 'nextjs', 'tailwind'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];

    const report: MemoryManagerReport = {
      id: `mmr_${Date.now()}`,
      workspaceId,
      shortTermMemory,
      longTermMemory,
      sessionMemory,
      workspaceMemory,
      projectMemory,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveMemoryManagerReport(report);
    return report;
  }
}

export const memoryManagerService = new MemoryManagerService();
