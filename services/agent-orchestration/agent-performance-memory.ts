import { AgentPerformanceMetrics, AgentRole } from '@/packages/types/src';
import { getRepositories } from '@/lib/db/repositories';

export class AgentPerformanceMemory {
  /**
   * Records the outcome of a task execution for an agent.
   */
  public async recordTaskOutcome(
    workspaceId: string,
    agentId: string,
    role: AgentRole,
    success: boolean,
    durationMs: number,
    tokensUsed = 0
  ): Promise<AgentPerformanceMetrics> {
    const repos = getRepositories();
    const metrics = await repos.agentPerformance.recordTaskOutcome(
      workspaceId,
      agentId,
      success,
      durationMs,
      tokensUsed
    );

    // Update role if changed
    if (metrics.role !== role) {
      metrics.role = role;
      await repos.agentPerformance.upsert(metrics);
    }

    return metrics;
  }

  /**
   * Records a review outcome (approval vs revision/rejection) for an agent.
   */
  public async recordReviewOutcome(
    workspaceId: string,
    agentId: string,
    approved: boolean
  ): Promise<AgentPerformanceMetrics> {
    const repos = getRepositories();
    const existing = (await repos.agentPerformance.get(agentId, workspaceId)) || {
      agentId,
      workspaceId,
      role: 'FULLSTACK_DEVELOPER_AGENT',
      tasksCompleted: 0,
      tasksFailed: 0,
      successRate: 1.0,
      avgExecutionTimeMs: 0,
      reviewApprovalRate: 1.0,
      handoffSuccessRate: 1.0,
      selfHealingSuccessRate: 1.0,
      totalTokensUsed: 0,
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentTotal = existing.tasksCompleted + existing.tasksFailed || 1;
    const approvalBonus = approved ? 1 : 0;
    const updatedApprovalRate = (existing.reviewApprovalRate * currentTotal + approvalBonus) / (currentTotal + 1);

    const updated: AgentPerformanceMetrics = {
      ...existing,
      reviewApprovalRate: Math.round(updatedApprovalRate * 100) / 100,
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return repos.agentPerformance.upsert(updated);
  }

  /**
   * Records a handoff outcome between agents.
   */
  public async recordHandoffOutcome(
    workspaceId: string,
    fromAgentId: string,
    success: boolean
  ): Promise<AgentPerformanceMetrics> {
    const repos = getRepositories();
    const existing = (await repos.agentPerformance.get(fromAgentId, workspaceId)) || {
      agentId: fromAgentId,
      workspaceId,
      role: 'FULLSTACK_DEVELOPER_AGENT',
      tasksCompleted: 0,
      tasksFailed: 0,
      successRate: 1.0,
      avgExecutionTimeMs: 0,
      reviewApprovalRate: 1.0,
      handoffSuccessRate: 1.0,
      selfHealingSuccessRate: 1.0,
      totalTokensUsed: 0,
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentTotal = existing.tasksCompleted + existing.tasksFailed || 1;
    const handoffBonus = success ? 1 : 0;
    const updatedHandoffRate = (existing.handoffSuccessRate * currentTotal + handoffBonus) / (currentTotal + 1);

    const updated: AgentPerformanceMetrics = {
      ...existing,
      handoffSuccessRate: Math.round(updatedHandoffRate * 100) / 100,
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return repos.agentPerformance.upsert(updated);
  }

  /**
   * Retrieves performance metrics for an agent in a workspace.
   */
  public async getAgentPerformance(agentId: string, workspaceId: string): Promise<AgentPerformanceMetrics | null> {
    const repos = getRepositories();
    return repos.agentPerformance.get(agentId, workspaceId);
  }

  public async getMetrics(agentId: string, workspaceId: string): Promise<AgentPerformanceMetrics | null> {
    return this.getAgentPerformance(agentId, workspaceId);
  }

  /**
   * Calculates a holistic capability and reliability score (0.0 - 1.0) for an agent.
   */
  public async getAgentScore(agentId: string, workspaceId: string): Promise<number> {
    const metrics = await this.getAgentPerformance(agentId, workspaceId);
    if (!metrics) return 0.95; // High baseline for new agents

    const total = metrics.tasksCompleted + metrics.tasksFailed;
    if (total === 0) return 0.95;

    const weightedScore =
      metrics.successRate * 0.45 +
      metrics.reviewApprovalRate * 0.25 +
      metrics.handoffSuccessRate * 0.15 +
      metrics.selfHealingSuccessRate * 0.15;

    return Math.max(0.2, Math.min(1.0, Math.round(weightedScore * 100) / 100));
  }

  /**
   * Lists performance metrics for all active agents in a workspace.
   */
  public async listWorkspacePerformance(workspaceId: string): Promise<AgentPerformanceMetrics[]> {
    const repos = getRepositories();
    return repos.agentPerformance.listByWorkspace(workspaceId);
  }
}

export const agentPerformanceMemory = new AgentPerformanceMemory();
