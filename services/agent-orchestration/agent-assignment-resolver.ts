import {
  AgentAssignment,
  AgentRole,
  AgentCandidateRanking,
  AgentRankingResult,
} from '@/packages/types/src';
import { getAgentRoleDefinition } from './agent-roles';
import { agentCapabilityManagerService } from './agent-capability-manager';
import { agentRegistryManagerService } from './agent-registry';
import { usageControlEngine } from '@/services/workspace/usage-control-engine';
import { agentPerformanceMemory } from './agent-performance-memory';
import { toolReliabilityEngine } from './tool-reliability-engine';
import { agentExperienceManager } from './experience-memory';

export interface AgentAssignmentOptions {
  role: AgentRole;
  requiredCapabilities?: string[];
  requiredTools?: string[];
  workspaceId: string;
  userId?: string;
  taskSimilarityQuery?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class AgentAssignmentResolver {
  /**
   * Deterministically evaluates and ranks all candidate agents across multiple intelligence factors.
   */
  public async rankAgentCandidates(options: AgentAssignmentOptions): Promise<AgentRankingResult> {
    const {
      role,
      requiredCapabilities = [],
      requiredTools = [],
      workspaceId,
      taskSimilarityQuery,
      riskLevel = 'LOW',
    } = options;

    const roleDef = getAgentRoleDefinition(role);
    const combinedCapabilities = Array.from(
      new Set([...roleDef.requiredCapabilities, ...requiredCapabilities])
    );

    // Retrieve registry & capabilities
    const registryReport = agentRegistryManagerService.getRegistryReport(workspaceId);
    const capabilityReport = agentCapabilityManagerService.getCapabilityReport(workspaceId);

    // Potential candidate roles (primary target role + related adaptable roles)
    const candidateRoles: AgentRole[] = [
      role,
      role === 'CODING_AGENT' ? 'DEBUG_AGENT' : role === 'DEBUG_AGENT' ? 'CODING_AGENT' : 'PLANNER_AGENT',
      role === 'DATABASE_AGENT' ? 'CODING_AGENT' : 'INTEGRATION_AGENT',
      'CEO_AGENT',
    ];

    const candidateList: AgentCandidateRanking[] = [];

    for (const candRole of candidateRoles) {
      const candAgentId = `agent_${candRole.toLowerCase().replace('_agent', '')}_01`;
      const candRoleDef = getAgentRoleDefinition(candRole);

      // 1. Capability Match Score (0.0 to 1.0)
      const matchedCapCount = combinedCapabilities.filter((c) =>
        candRoleDef.requiredCapabilities.includes(c) ||
        capabilityReport.capabilities.some(
          (cp) =>
            cp.agentId === candAgentId &&
            (cp.supportedTasks.includes(c) || cp.supportedTools.includes(c) || cp.supportedIntegrations.includes(c))
        )
      ).length;
      const capabilityScore = combinedCapabilities.length > 0
        ? Math.min(1.0, (matchedCapCount / combinedCapabilities.length) * 0.9 + 0.1)
        : 1.0;

      // 2. Role Match Score (0.0 to 1.0)
      const roleMatchScore = candRole === role ? 1.0 : 0.65;

      // 3. Historical Success Rate & Performance
      const perfMetrics = await agentPerformanceMemory.getMetrics(candAgentId, workspaceId);
      const historicalSuccessRate = perfMetrics ? perfMetrics.successRate : 0.92;
      const performanceScore = perfMetrics ? perfMetrics.reviewApprovalRate * 0.5 + perfMetrics.handoffSuccessRate * 0.5 : 0.90;

      // 4. Latency Score (lower execution time = higher score)
      const avgLatency = perfMetrics ? perfMetrics.avgExecutionTimeMs : 1200;
      const latencyScore = Math.max(0.5, Math.min(1.0, 1.0 - (avgLatency / 10000)));

      // 5. Workload Score (Check registry active agents)
      const registered = registryReport.agents.find((a) => a.agentId === candAgentId);
      const isAvailable = registered ? registered.status === 'ACTIVE' || registered.status === 'STANDBY' : true;
      const workloadScore = isAvailable ? 0.95 : 0.40;

      // 6. Tool Reliability Score
      let reliabilityScore = 0.95;
      if (requiredTools.length > 0) {
        try {
          let toolScore = 0;
          for (const t of requiredTools) {
            toolScore += await toolReliabilityEngine.getToolHealthScore(workspaceId, t);
          }
          reliabilityScore = toolScore / requiredTools.length;
        } catch {
          reliabilityScore = 0.85;
        }
      }

      // 7. Experience Relevance Score
      let experienceRelevanceScore = 0.80;
      if (taskSimilarityQuery) {
        try {
          const expMatches = await agentExperienceManager.searchExperiences({
            workspaceId,
            query: `${taskSimilarityQuery} ${candRole}`,
            agentRole: candRole,
            limit: 3,
          });
          if (expMatches.length > 0) {
            const topSim = expMatches[0].similarity;
            experienceRelevanceScore = Math.min(1.0, topSim + 0.2);
          }
        } catch {
          // Fallback
        }
      }

      // 8. Risk Adjustment
      let riskAdjustment = 1.0;
      if (riskLevel === 'CRITICAL' && candRole !== role) {
        riskAdjustment = 0.70;
      } else if (riskLevel === 'HIGH' && candRole !== role) {
        riskAdjustment = 0.85;
      }

      // 9. Quota Availability Score
      const quotaValid = usageControlEngine.validateQuota(workspaceId, 'AGENTS', 1);
      const quotaScore = quotaValid.allowed ? 1.0 : 0.0;

      const breakdown = {
        capabilityScore: Math.round(capabilityScore * 100) / 100,
        roleMatchScore: Math.round(roleMatchScore * 100) / 100,
        historicalSuccessRate: Math.round(historicalSuccessRate * 100) / 100,
        performanceScore: Math.round(performanceScore * 100) / 100,
        workloadScore: Math.round(workloadScore * 100) / 100,
        latencyScore: Math.round(latencyScore * 100) / 100,
        reliabilityScore: Math.round(reliabilityScore * 100) / 100,
        experienceRelevanceScore: Math.round(experienceRelevanceScore * 100) / 100,
        riskAdjustment: Math.round(riskAdjustment * 100) / 100,
        quotaScore: Math.round(quotaScore * 100) / 100,
      };

      // Weighted Multi-Factor Score Calculation
      const weights = {
        capability: 0.25,
        role: 0.20,
        success: 0.15,
        performance: 0.10,
        experience: 0.10,
        workload: 0.05,
        latency: 0.05,
        reliability: 0.10,
      };

      const baseScore =
        breakdown.capabilityScore * weights.capability +
        breakdown.roleMatchScore * weights.role +
        breakdown.historicalSuccessRate * weights.success +
        breakdown.performanceScore * weights.performance +
        breakdown.experienceRelevanceScore * weights.experience +
        breakdown.workloadScore * weights.workload +
        breakdown.latencyScore * weights.latency +
        breakdown.reliabilityScore * weights.reliability;

      const finalScore = Math.round(baseScore * breakdown.riskAdjustment * breakdown.quotaScore * 100) / 100;
      const isEligible = quotaScore > 0 && capabilityScore >= 0.3;

      const reasons: string[] = [
        `Role compatibility score: ${Math.round(roleMatchScore * 100)}%`,
        `Capability alignment score: ${Math.round(capabilityScore * 100)}%`,
        `Historical success rate: ${Math.round(historicalSuccessRate * 100)}%`,
      ];
      if (candRole === role) {
        reasons.push('Primary specialized role match');
      }

      candidateList.push({
        agentId: candAgentId,
        role: candRole,
        score: finalScore,
        breakdown,
        confidence: Math.min(0.99, Math.max(0.60, finalScore)),
        reasons,
        isEligible,
        rejectionReason: !isEligible ? (quotaScore === 0 ? 'Quota exceeded' : 'Insufficient capability match') : undefined,
      });
    }

    // Sort descending by score
    candidateList.sort((a, b) => b.score - a.score);

    const eligibleCandidates = candidateList.filter((c) => c.isEligible);
    const selectedAgent = eligibleCandidates[0] || candidateList[0];

    return {
      workspaceId,
      role,
      requiredCapabilities: combinedCapabilities,
      candidates: candidateList,
      selectedAgent,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Resolves and assigns a specialized agent for a workflow step, validating capability, governance & workspace.
   */
  public async resolveAgent(options: AgentAssignmentOptions): Promise<AgentAssignment> {
    const { role, requiredCapabilities = [], workspaceId } = options;

    // 1. Governance & Quota Check
    const quotaValid = usageControlEngine.validateQuota(workspaceId, 'AGENTS', 1);
    if (!quotaValid.allowed) {
      throw new Error(`Governance violation: Quota limit reached for workspace '${workspaceId}' when assigning agent for role '${role}'`);
    }

    // 2. Perform intelligent multi-factor ranking
    const rankingResult = await this.rankAgentCandidates(options);
    const winner = rankingResult.selectedAgent;

    if (!winner || !winner.isEligible) {
      throw new Error(`No eligible agent found for role '${role}' in workspace '${workspaceId}'`);
    }

    const roleDef = getAgentRoleDefinition(winner.role || role);
    const combinedCapabilities = Array.from(
      new Set([...roleDef.requiredCapabilities, ...requiredCapabilities])
    );

    return {
      agentId: winner.agentId,
      role: winner.role || role,
      matchedCapabilities: combinedCapabilities,
      assignedAt: new Date().toISOString(),
      confidenceScore: winner.confidence,
      workspaceId,
    };
  }
}

export const agentAssignmentResolver = new AgentAssignmentResolver();

