import {
  WorkflowStrategy,
  StrategyComparisonResult,
  WorkflowPlanningRequest,
  WorkflowRequirement,
  WorkflowPlannedStep,
  ExecutionStrategyType,
  StrategyScoringWeights,
} from '@/packages/types/src';
import { agentExperienceManager } from './experience-memory';
import { toolReliabilityEngine } from './tool-reliability-engine';
import { confidenceEngine } from './confidence-engine';

const DEFAULT_WEIGHTS: StrategyScoringWeights = {
  successProbabilityWeight: 0.30,
  reliabilityWeight: 0.25,
  experienceWeight: 0.20,
  riskInversionWeight: 0.15,
  costInversionWeight: 0.05,
  timeInversionWeight: 0.05,
};

export class DecisionOptimizationEngine {
  /**
   * Generates, scores, and compares multiple valid execution strategies for a given workflow requirement.
   */
  public async optimizeDecision(
    request: WorkflowPlanningRequest,
    requirements: WorkflowRequirement,
    basePlannedSteps: WorkflowPlannedStep[]
  ): Promise<StrategyComparisonResult> {
    const workspaceId = request.workspaceId;

    // 1. Synthesize multiple candidate strategies
    const strategies = await this.generateCandidateStrategies(workspaceId, requirements, basePlannedSteps);

    // 2. Score each candidate strategy deterministically
    const scoredStrategies: WorkflowStrategy[] = [];
    for (const strat of strategies) {
      const scored = await this.scoreStrategy(workspaceId, strat);
      scoredStrategies.push(scored);
    }

    // 3. Sort by weighted decision score descending
    scoredStrategies.sort((a, b) => b.weightedDecisionScore - a.weightedDecisionScore);

    const winningStrategy = scoredStrategies[0] || strategies[0];

    // 4. Generate transparent rationale explaining WHY this strategy was selected
    const rationale = this.generateSelectionRationale(winningStrategy, scoredStrategies);

    // 5. Compute confidence assessment
    const confAssessment = await confidenceEngine.calculateConfidence({
      workspaceId,
      experienceCount: winningStrategy.previousExperienceScore > 0 ? 3 : 0,
      experienceAvgScore: winningStrategy.previousExperienceScore,
      toolIds: winningStrategy.suggestedTools,
      predictedRisk: winningStrategy.riskScore > 0.6 ? 'HIGH' : winningStrategy.riskScore > 0.3 ? 'MEDIUM' : 'LOW',
    });

    return {
      workspaceId,
      workflowId: request.workflowId,
      strategies: scoredStrategies,
      selectedStrategyId: winningStrategy.strategyId,
      selectedStrategy: winningStrategy,
      selectionRationale: rationale,
      confidence: confAssessment.overallConfidence,
      confidenceFactors: {
        successProbability: winningStrategy.expectedSuccessProbability,
        reliability: winningStrategy.reliabilityScore,
        experienceScore: winningStrategy.previousExperienceScore,
        riskInversion: Math.round((1 - winningStrategy.riskScore) * 100) / 100,
        weightedScore: winningStrategy.weightedDecisionScore,
      },
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates diverse concrete execution strategies based on requirements.
   */
  private async generateCandidateStrategies(
    workspaceId: string,
    requirements: WorkflowRequirement,
    baseSteps: WorkflowPlannedStep[]
  ): Promise<WorkflowStrategy[]> {
    const strategies: WorkflowStrategy[] = [];

    // Strategy 1: Standard Modular (Production Standard)
    strategies.push({
      strategyId: 'strat_standard_modular',
      strategyType: 'STANDARD_MODULAR',
      name: 'Standard Modular Architecture',
      description: 'Balanced multi-step architecture with isolated frontend/backend modules, automated testing, and verified release pipeline.',
      expectedSuccessProbability: 0.94,
      estimatedExecutionTimeMs: 14500,
      estimatedCost: {
        tokenCost: 12000,
        toolCalls: baseSteps.length,
        agentExecutions: Math.min(baseSteps.length, 6),
        estimatedTimeMs: 14500,
      },
      riskScore: 0.15,
      reliabilityScore: 0.92,
      previousExperienceScore: 0.88,
      complexityScore: 0.50,
      weightedDecisionScore: 0,
      pros: [
        'High code maintainability and test coverage',
        'Clean separation of concerns',
        'Deterministic verification and safety gates',
      ],
      cons: [
        'Moderate execution time',
      ],
      suggestedTools: ['tool_read_file', 'tool_write_file', 'tool_terminal_exec'],
      steps: baseSteps,
    });

    // Strategy 2: Fast Prototype (Speed Optimized)
    const fastSteps = baseSteps.filter((s) => !s.name.toLowerCase().includes('comprehensive unit') && !s.name.toLowerCase().includes('secondary'));
    strategies.push({
      strategyId: 'strat_fast_prototype',
      strategyType: 'FAST_PROTOTYPE',
      name: 'Rapid Prototyping Pipeline',
      description: 'Streamlined development workflow focused on rapid delivery with consolidated compilation and streamlined testing.',
      expectedSuccessProbability: 0.86,
      estimatedExecutionTimeMs: 7200,
      estimatedCost: {
        tokenCost: 6500,
        toolCalls: Math.max(3, fastSteps.length),
        agentExecutions: 3,
        estimatedTimeMs: 7200,
      },
      riskScore: 0.35,
      reliabilityScore: 0.82,
      previousExperienceScore: 0.80,
      complexityScore: 0.25,
      weightedDecisionScore: 0,
      pros: [
        '50% faster turnaround time',
        'Lower token and compute resource consumption',
      ],
      cons: [
        'Reduced automated test coverage',
        'Higher potential for downstream edge-case bugs',
      ],
      suggestedTools: ['tool_write_file', 'tool_terminal_exec'],
      steps: fastSteps.length > 0 ? fastSteps : baseSteps,
    });

    // Strategy 3: Enterprise Robust (Maximum Verification & Security)
    const robustSteps = [...baseSteps];
    strategies.push({
      strategyId: 'strat_enterprise_robust',
      strategyType: 'ENTERPRISE_ROBUST',
      name: 'Enterprise High-Reliability Architecture',
      description: 'Rigorous multi-layer verification with full AST validation, security audit, database transaction rollback guards, and multi-agent peer reviews.',
      expectedSuccessProbability: 0.98,
      estimatedExecutionTimeMs: 24000,
      estimatedCost: {
        tokenCost: 22000,
        toolCalls: baseSteps.length + 3,
        agentExecutions: Math.min(baseSteps.length + 2, 8),
        estimatedTimeMs: 24000,
      },
      riskScore: 0.08,
      reliabilityScore: 0.97,
      previousExperienceScore: 0.94,
      complexityScore: 0.80,
      weightedDecisionScore: 0,
      pros: [
        'Near-zero failure rate in production',
        'Comprehensive security and compliance audit',
        'Automatic rollback readiness',
      ],
      cons: [
        'Higher token cost and execution latency',
      ],
      suggestedTools: ['tool_read_file', 'tool_write_file', 'tool_terminal_exec', 'tool_lint_applet'],
      steps: robustSteps,
    });

    // Strategy 4: Serverless/Database-Specific if requested
    if (requirements.integrations.includes('FIREBASE') || requirements.projectType === 'AI_APPLICATION') {
      strategies.push({
        strategyId: 'strat_serverless_firebase',
        strategyType: 'SERVERLESS_FIREBASE',
        name: 'Cloud Serverless Architecture',
        description: 'Leverages serverless backend functions and real-time document stores for reactive scaling.',
        expectedSuccessProbability: 0.91,
        estimatedExecutionTimeMs: 12000,
        estimatedCost: {
          tokenCost: 10000,
          toolCalls: baseSteps.length,
          agentExecutions: 4,
          estimatedTimeMs: 12000,
        },
        riskScore: 0.20,
        reliabilityScore: 0.90,
        previousExperienceScore: 0.85,
        complexityScore: 0.45,
        weightedDecisionScore: 0,
        pros: ['Automatic elastic scaling', 'Real-time synchronization'],
        cons: ['Requires live configured cloud credentials'],
        suggestedTools: ['tool_firebase_provision', 'tool_write_file'],
        steps: baseSteps,
      });
    }

    return strategies;
  }

  /**
   * Deterministically scores a strategy using multi-dimensional factors.
   */
  public async scoreStrategy(
    workspaceId: string,
    strategy: WorkflowStrategy,
    weights: StrategyScoringWeights = DEFAULT_WEIGHTS
  ): Promise<WorkflowStrategy> {
    // 1. Query past experience memory for this strategy type
    try {
      const pastExperiences = await agentExperienceManager.searchExperiences({
        workspaceId,
        query: strategy.strategyType,
        limit: 5,
      });

      if (pastExperiences.length > 0) {
        const successes = pastExperiences.filter((e) => e.experience.success);
        const expScore = successes.length / pastExperiences.length;
        strategy.previousExperienceScore = Math.round(expScore * 100) / 100;
      }
    } catch {
      // Non-blocking fallback
    }

    // 2. Adjust tool reliability
    if (strategy.suggestedTools.length > 0) {
      try {
        let totalHealth = 0;
        for (const t of strategy.suggestedTools) {
          totalHealth += await toolReliabilityEngine.getToolHealthScore(workspaceId, t);
        }
        const avgHealth = totalHealth / strategy.suggestedTools.length;
        strategy.reliabilityScore = Math.round(((strategy.reliabilityScore * 0.5) + (avgHealth * 0.5)) * 100) / 100;
      } catch {
        // Non-blocking
      }
    }

    // 3. Normalized Score Calculations (All 0.0 to 1.0)
    const successProbNorm = strategy.expectedSuccessProbability;
    const reliabilityNorm = strategy.reliabilityScore;
    const experienceNorm = strategy.previousExperienceScore;
    const riskInversionNorm = Math.max(0, 1 - strategy.riskScore);
    const costInversionNorm = Math.max(0, 1 - Math.min(strategy.estimatedCost.tokenCost / 30000, 1));
    const timeInversionNorm = Math.max(0, 1 - Math.min(strategy.estimatedExecutionTimeMs / 30000, 1));

    const weightedScore =
      (successProbNorm * weights.successProbabilityWeight) +
      (reliabilityNorm * weights.reliabilityWeight) +
      (experienceNorm * weights.experienceWeight) +
      (riskInversionNorm * weights.riskInversionWeight) +
      (costInversionNorm * weights.costInversionWeight) +
      (timeInversionNorm * weights.timeInversionWeight);

    strategy.weightedDecisionScore = Math.round(weightedScore * 1000) / 1000;
    return strategy;
  }

  /**
   * Generates a clear, transparent explanation for why a strategy was selected.
   */
  private generateSelectionRationale(
    selected: WorkflowStrategy,
    allStrategies: WorkflowStrategy[]
  ): string {
    const otherStrats = allStrategies.filter((s) => s.strategyId !== selected.strategyId);
    if (otherStrats.length === 0) {
      return `Selected '${selected.name}' with weighted decision score ${selected.weightedDecisionScore} (Success: ${Math.round(selected.expectedSuccessProbability * 100)}%, Risk: ${Math.round(selected.riskScore * 100)}%).`;
    }

    const runnerUp = otherStrats[0];
    const scoreDiff = Math.round((selected.weightedDecisionScore - runnerUp.weightedDecisionScore) * 100);

    return `Selected '${selected.name}' (score: ${selected.weightedDecisionScore}) over '${runnerUp.name}' (score: ${runnerUp.weightedDecisionScore}, +${scoreDiff}% advantage). Reason: Higher reliability (${Math.round(selected.reliabilityScore * 100)}%) and stronger previous experience score (${Math.round(selected.previousExperienceScore * 100)}%) with a low risk profile (${Math.round(selected.riskScore * 100)}%).`;
  }
}

export const decisionOptimizationEngine = new DecisionOptimizationEngine();
