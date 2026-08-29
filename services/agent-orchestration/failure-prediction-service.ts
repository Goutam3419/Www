import {
  FailurePrediction,
  WorkflowFailurePredictionReport,
  PreventiveActionRecommendation,
  WorkflowStep,
  WorkflowPlannedStep,
  AgentRole,
} from '@/packages/types/src';
import { agentExperienceManager } from './experience-memory';
import { toolReliabilityEngine } from './tool-reliability-engine';
import { toolRegistryService } from '@/services/tool-engine/tool-registry';

export interface PredictStepFailureOptions {
  workspaceId: string;
  stepId?: string;
  stepName: string;
  toolId?: string;
  agentRole?: AgentRole;
  agentId?: string;
  input?: Record<string, unknown>;
  requiredCapabilities?: string[];
}

export class FailurePredictionService {
  /**
   * Predicts risk, failure modes, and preventive actions for an individual workflow step.
   */
  public async predictStepFailure(options: PredictStepFailureOptions): Promise<FailurePrediction> {
    const { workspaceId, stepId, stepName, toolId, agentRole, input = {}, requiredCapabilities = [] } = options;

    const possibleFailureReasons: string[] = [];
    const recommendedPreventiveActions: string[] = [];
    const preventiveActionDetails: PreventiveActionRecommendation[] = [];
    const preExecutionChecks: Array<{ checkName: string; required: boolean; description: string }> = [];

    let predictedRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let confidence = 0.88;
    let historicalFailureCount = 0;
    let providerHealthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE' | 'NOT_CONFIGURED' = 'HEALTHY';

    // 1. Inspect Tool Reliability and Provider Health
    if (toolId) {
      const toolDef = toolRegistryService.getTool(toolId);
      const provider = toolDef ? toolDef.provider : toolReliabilityEngine.inferProviderFromToolId(toolId);
      const isConfigured = toolRegistryService.isProviderConfigured(provider, workspaceId);

      if (!isConfigured) {
        providerHealthStatus = 'NOT_CONFIGURED';
        predictedRisk = 'HIGH';
        confidence = 0.94;
        possibleFailureReasons.push(`Provider '${provider}' is not configured in workspace '${workspaceId}' (credentials missing).`);
        recommendedPreventiveActions.push(`Verify and supply valid API credentials for '${provider}' before executing.`);
        preventiveActionDetails.push({
          actionId: 'act_check_creds',
          action: `Configure credentials for provider '${provider}'`,
          riskMitigated: 'AUTHENTICATION_FAILURE',
          confidence: 0.95,
          automatedFixAvailable: false,
        });
        preExecutionChecks.push({
          checkName: 'PROVIDER_CREDENTIAL_CHECK',
          required: true,
          description: `Validate provider ${provider} credentials`,
        });
      } else {
        const toolRecord = await toolReliabilityEngine.getToolRecord(workspaceId, toolId);
        if (toolRecord) {
          providerHealthStatus = toolRecord.recentHealth;
          historicalFailureCount = toolRecord.failureCount;

          if (toolRecord.recentHealth === 'CRITICAL' || toolRecord.successRate < 0.5) {
            predictedRisk = 'CRITICAL';
            confidence = 0.92;
            possibleFailureReasons.push(`Tool '${toolId}' has a critical failure rate (${Math.round((1 - toolRecord.successRate) * 100)}% failure rate).`);
            recommendedPreventiveActions.push(`Consider tool substitution or fallback strategy for '${toolId}'.`);
          } else if (toolRecord.recentHealth === 'DEGRADED' || toolRecord.successRate < 0.8) {
            if (predictedRisk === 'LOW') predictedRisk = 'MEDIUM';
            possibleFailureReasons.push(`Tool '${toolId}' has recent intermittent failures (${Math.round((1 - toolRecord.successRate) * 100)}% failure rate).`);
            recommendedPreventiveActions.push(`Add retry policy with exponential backoff for step '${stepName}'.`);
          }
        }
      }
    }

    // 2. Query Experience Memory for Past Similar Failures
    try {
      const failureExperiences = await agentExperienceManager.searchExperiences({
        workspaceId,
        query: `${stepName} ${toolId || ''} ${requiredCapabilities.join(' ')}`,
        limit: 5,
      });

      const failedMatches = failureExperiences.filter((e) => !e.experience.success);
      if (failedMatches.length > 0) {
        historicalFailureCount += failedMatches.length;
        const highestMatch = failedMatches[0];

        if (highestMatch.similarity > 0.65) {
          if (predictedRisk === 'LOW') predictedRisk = 'MEDIUM';
          const reason = highestMatch.experience.resultSummary || highestMatch.experience.errorCategory || 'Historical failure detected';
          if (!possibleFailureReasons.includes(reason)) {
            possibleFailureReasons.push(`Similar past step failed: ${reason}`);
          }

          if (highestMatch.experience.resolution) {
            const act = `Apply past resolution: ${highestMatch.experience.resolution}`;
            if (!recommendedPreventiveActions.includes(act)) {
              recommendedPreventiveActions.push(act);
              preventiveActionDetails.push({
                actionId: `act_res_${highestMatch.experience.id}`,
                action: act,
                riskMitigated: highestMatch.experience.errorCategory || 'STEP_FAILURE',
                confidence: highestMatch.experience.confidence,
                automatedFixAvailable: true,
              });
            }
          }
        }
      }
    } catch {
      // Non-blocking fallback
    }

    // 3. Inspect Specific Step Characteristics
    const stepLower = stepName.toLowerCase();
    if (stepLower.includes('deploy') || stepLower.includes('vercel') || stepLower.includes('firebase')) {
      preExecutionChecks.push({
        checkName: 'ENV_CONFIG_VALIDATION',
        required: true,
        description: 'Ensure all required environment variables are set before deployment.',
      });
      if (!input.validatedEnv) {
        possibleFailureReasons.push('Deployment may fail if required production environment variables are missing.');
        recommendedPreventiveActions.push('Run environment configuration validation before deployment trigger.');
      }
    }

    if (stepLower.includes('build') || stepLower.includes('test') || stepLower.includes('compile')) {
      preExecutionChecks.push({
        checkName: 'DEPENDENCY_SYNCHRONIZATION_CHECK',
        required: false,
        description: 'Verify package.json dependencies are installed.',
      });
    }

    if (stepLower.includes('database') || stepLower.includes('migration') || stepLower.includes('sql')) {
      preExecutionChecks.push({
        checkName: 'SCHEMA_BACKUP_CHECK',
        required: true,
        description: 'Verify database connectivity and transaction safety before migration.',
      });
    }

    // Default safe action if none generated
    if (recommendedPreventiveActions.length === 0) {
      recommendedPreventiveActions.push('Standard execution with telemetry and boundary validation.');
    }

    return {
      stepId,
      stepName,
      toolId,
      agentRole,
      predictedRisk,
      confidence: Math.round(confidence * 100) / 100,
      possibleFailureReasons,
      recommendedPreventiveActions,
      preventiveActionDetails,
      historicalFailureCount,
      providerHealthStatus,
      preExecutionChecks,
    };
  }

  /**
   * Evaluates failure and risk predictions across an entire workflow plan.
   */
  public async predictWorkflowFailures(
    workspaceId: string,
    steps: Array<WorkflowStep | WorkflowPlannedStep>,
    workflowId?: string
  ): Promise<WorkflowFailurePredictionReport> {
    const stepPredictions: FailurePrediction[] = [];
    const preventiveActionsRequired: string[] = [];

    for (const step of steps) {
      const pred = await this.predictStepFailure({
        workspaceId,
        stepId: step.id,
        stepName: step.name,
        toolId: step.toolId,
        agentRole: ('role' in step ? step.role : undefined) as AgentRole | undefined,
        input: 'input' in step ? (step.input as Record<string, unknown>) : {},
        requiredCapabilities: step.requiredCapabilities || [],
      });
      stepPredictions.push(pred);

      for (const act of pred.recommendedPreventiveActions) {
        if (!preventiveActionsRequired.includes(act)) {
          preventiveActionsRequired.push(act);
        }
      }
    }

    const highRiskStepCount = stepPredictions.filter(
      (p) => p.predictedRisk === 'HIGH' || p.predictedRisk === 'CRITICAL'
    ).length;

    let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (stepPredictions.some((p) => p.predictedRisk === 'CRITICAL')) {
      overallRisk = 'CRITICAL';
    } else if (highRiskStepCount > 0) {
      overallRisk = 'HIGH';
    } else if (stepPredictions.some((p) => p.predictedRisk === 'MEDIUM')) {
      overallRisk = 'MEDIUM';
    }

    return {
      workspaceId,
      workflowId,
      overallRisk,
      stepPredictions,
      highRiskStepCount,
      preventiveActionsRequired,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const failurePredictionService = new FailurePredictionService();
