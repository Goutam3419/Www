import { AgentTaskPlannerReport, AgentTaskItem } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class AgentTaskPlannerService {
  public getTaskPlannerReport(workspaceId: string = 'ws_enterprise_01'): AgentTaskPlannerReport {
    const existing = dbStore.getLatestAgentTaskPlannerReport(workspaceId);
    if (existing) return existing;

    const tasks: AgentTaskItem[] = [
      {
        taskId: 'task_arch_01',
        title: 'Architect Enterprise Multi-Agent System Core',
        description: 'Define agent roles, capability contracts, and coordination primitives.',
        priority: 'CRITICAL',
        status: 'COMPLETED',
        dependencies: [],
        subtasks: [
          { id: 'sub_arch_01a', title: 'Registry schema definition', completed: true },
          { id: 'sub_arch_01b', title: 'Workspace assignment matrix', completed: true },
          { id: 'sub_arch_01c', title: 'Tool capability contract validator', completed: true }
        ],
        completionProgress: 100
      },
      {
        taskId: 'task_code_02',
        title: 'Execute Code Refactoring & AST Validation',
        description: 'Perform static code analysis, lint resolution, and type safety checks.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dependencies: ['task_arch_01'],
        subtasks: [
          { id: 'sub_code_02a', title: 'Import optimization check', completed: true },
          { id: 'sub_code_02b', title: 'TypeScript strict mode verification', completed: true },
          { id: 'sub_code_02c', title: 'Unused variable cleanup', completed: false }
        ],
        completionProgress: 67
      },
      {
        taskId: 'task_rag_03',
        title: 'Document Indexing & Context Citation Alignment',
        description: 'Verify chunking strategies, heuristic ranking, and verified citations.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dependencies: ['task_arch_01'],
        subtasks: [
          { id: 'sub_rag_03a', title: 'Parser heuristic validation', completed: true },
          { id: 'sub_rag_03b', title: 'Token density check', completed: false }
        ],
        completionProgress: 50
      },
      {
        taskId: 'task_gov_04',
        title: 'Audit Compliance & Retention Policy Rules',
        description: 'Validate data retention timelines and access control policies across all projects.',
        priority: 'MEDIUM',
        status: 'PLANNED',
        dependencies: ['task_code_02', 'task_rag_03'],
        subtasks: [
          { id: 'sub_gov_04a', title: 'Retention schedule check', completed: false },
          { id: 'sub_gov_04b', title: 'License compliance scan', completed: false }
        ],
        completionProgress: 0
      }
    ];

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

    const report: AgentTaskPlannerReport = {
      id: `atpr_${Date.now()}`,
      workspaceId,
      totalTasks: tasks.length,
      completedTasks,
      tasks,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveAgentTaskPlannerReport(report);
    return report;
  }
}

export const agentTaskPlannerService = new AgentTaskPlannerService();
