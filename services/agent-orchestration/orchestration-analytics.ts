import { OrchestrationAnalyticsReport, AgentPerformanceMetric } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class OrchestrationAnalyticsService {
  public getAnalyticsReport(workspaceId: string = 'ws_enterprise_01'): OrchestrationAnalyticsReport {
    const existing = dbStore.getLatestOrchestrationAnalyticsReport(workspaceId);
    if (existing) return existing;

    const agentPerformance: AgentPerformanceMetric[] = [
      {
        agentId: 'agent_ceo_01',
        agentName: 'Executive AI CEO Agent',
        tasksCompleted: 12,
        successRatePercentage: 100,
        avgExecutionTimeMinutes: 2.1,
        delegationAccuracyPercentage: 98,
        approvalPassRatePercentage: 100
      },
      {
        agentId: 'agent_eng_01',
        agentName: 'Autonomous Software Engineering Agent',
        tasksCompleted: 28,
        successRatePercentage: 96,
        avgExecutionTimeMinutes: 4.5,
        delegationAccuracyPercentage: 95,
        approvalPassRatePercentage: 98
      },
      {
        agentId: 'agent_rag_01',
        agentName: 'Document Intelligence Agent',
        tasksCompleted: 19,
        successRatePercentage: 98,
        avgExecutionTimeMinutes: 1.8,
        delegationAccuracyPercentage: 97,
        approvalPassRatePercentage: 100
      },
      {
        agentId: 'agent_gov_01',
        agentName: 'Security Governance Agent',
        tasksCompleted: 8,
        successRatePercentage: 100,
        avgExecutionTimeMinutes: 3.2,
        delegationAccuracyPercentage: 99,
        approvalPassRatePercentage: 100
      }
    ];

    const report: OrchestrationAnalyticsReport = {
      id: `oar_${Date.now()}`,
      workspaceId,
      agentPerformance,
      taskCompletionStats: {
        total: 67,
        completed: 63,
        inProgress: 4,
        failed: 0
      },
      delegationStats: {
        totalDelegated: 67,
        autoMatched: 62,
        manuallyAssigned: 5
      },
      approvalStats: {
        totalRequested: 24,
        autoApproved: 18,
        humanApproved: 6,
        rejected: 0
      },
      handoffStats: {
        totalHandoffs: 31,
        validatedHandoffs: 31,
        failedHandoffs: 0
      },
      failureStats: {
        totalFailures: 0,
        errorCategories: [
          { category: 'TYPE_CHECK_WARNING', count: 2 },
          { category: 'LINT_STYLING', count: 1 }
        ]
      },
      executionTrends: [
        { date: '2026-08-01', completedTasks: 8, activeAgents: 4, errorCount: 0 },
        { date: '2026-08-02', completedTasks: 12, activeAgents: 4, errorCount: 0 },
        { date: '2026-08-03', completedTasks: 15, activeAgents: 4, errorCount: 0 },
        { date: '2026-08-04', completedTasks: 18, activeAgents: 4, errorCount: 0 },
        { date: '2026-08-05', completedTasks: 22, activeAgents: 4, errorCount: 0 },
        { date: '2026-08-06', completedTasks: 25, activeAgents: 4, errorCount: 0 },
        { date: '2026-08-07', completedTasks: 28, activeAgents: 4, errorCount: 0 }
      ],
      generatedAt: new Date().toISOString()
    };

    dbStore.saveOrchestrationAnalyticsReport(report);
    return report;
  }
}

export const orchestrationAnalyticsService = new OrchestrationAnalyticsService();
