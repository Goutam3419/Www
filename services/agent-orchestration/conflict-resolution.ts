import { AgentConflictResolutionReport, AgentConflictRecord } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class ConflictResolutionService {
  public getConflictReport(workspaceId: string = 'ws_enterprise_01'): AgentConflictResolutionReport {
    const existing = dbStore.getLatestAgentConflictResolutionReport(workspaceId);
    if (existing) return existing;

    const conflicts: AgentConflictRecord[] = [
      {
        conflictId: 'cnf_01',
        conflictType: 'RESOURCE',
        conflictingEntities: ['agent_eng_01', 'agent_rag_01'],
        description: 'Concurrent AST index write lock contention during workspace rebuild.',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        resolutionStrategy: 'PRIORITY_QUEUE_LOCK_ACQUISITION',
        resolvedAt: '2026-08-07T10:25:00.000Z'
      },
      {
        conflictId: 'cnf_02',
        conflictType: 'TASK',
        conflictingEntities: ['task_code_02', 'task_gov_04'],
        description: 'Dependency ordering deadlock between code generation AST and security audit policy check.',
        priority: 'HIGH',
        status: 'RESOLVED',
        resolutionStrategy: 'TOPOLOGICAL_SORT_REORDERING',
        resolvedAt: '2026-08-07T10:32:00.000Z'
      }
    ];

    const resolutionHistory = [
      {
        timestamp: '2026-08-07T10:25:00.000Z',
        conflictId: 'cnf_01',
        resolution: 'Sequentialized resource access for agent_eng_01 followed by agent_rag_01.',
        actor: 'AUTOMATED_CONFLICT_RESOLVER'
      },
      {
        timestamp: '2026-08-07T10:32:00.000Z',
        conflictId: 'cnf_02',
        resolution: 'Enforced prerequisite dependency: task_code_02 must complete before task_gov_04.',
        actor: 'EXECUTIVE_ORCHESTRATOR'
      }
    ];

    const openConflictsCount = conflicts.filter(c => c.status === 'OPEN').length;
    const resolvedConflictsCount = conflicts.filter(c => c.status === 'RESOLVED').length;

    const report: AgentConflictResolutionReport = {
      id: `acrr_${Date.now()}`,
      workspaceId,
      totalConflicts: conflicts.length,
      openConflictsCount,
      resolvedConflictsCount,
      conflicts,
      resolutionHistory,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveAgentConflictResolutionReport(report);
    return report;
  }
}

export const conflictResolutionService = new ConflictResolutionService();
