import {
  Workflow,
  WorkflowStep,
  WorkflowReplanningRequest,
  WorkflowReplanningResult,
} from '@/packages/types/src';
import { WorkflowGraph } from './workflow-graph';
import { workflowEventBus } from './workflow-event-bus';
import { agentAssignmentResolver } from './agent-assignment-resolver';
import { getRepositories } from '@/lib/db/repositories';
import { agentExperienceManager } from './experience-memory';
import { toolReliabilityEngine } from './tool-reliability-engine';

export class WorkflowReplanner {
  /**
   * Dynamically constructs an alternative DAG plan when a failure or blockage occurs.
   */
  public async replanWorkflow(request: WorkflowReplanningRequest): Promise<WorkflowReplanningResult> {
    const { workflow, failedStepId, failureReason, failureCategory, workspaceId, userId } = request;
    const changesSummary: string[] = [];
    let strategyUsed = 'DYNAMIC_REPLANNING';

    // Clone existing steps
    const currentSteps: WorkflowStep[] = JSON.parse(JSON.stringify(workflow.steps));
    const failedStepIndex = currentSteps.findIndex((s) => s.id === failedStepId);

    if (failedStepIndex === -1 && currentSteps.length > 0) {
      return {
        success: false,
        originalWorkflowId: workflow.id,
        replannedWorkflow: workflow,
        changesSummary: [`Step '${failedStepId}' not found in workflow`],
        strategyUsed: 'NONE',
        error: `Step '${failedStepId}' not found in workflow`,
      };
    }

    const failedStep = currentSteps[failedStepIndex];

    // Experience Engine: Query past similar failures to discover learned resolutions
    let learnedResolution: string | undefined;
    try {
      const pastExperiences = await agentExperienceManager.searchExperiences({
        workspaceId,
        errorCategory: failureCategory,
        query: `${failureReason} ${failedStep.name}`,
        limit: 3,
      });

      const fix = pastExperiences.find((p) => p.experience.success && p.experience.resolution);
      if (fix) {
        learnedResolution = fix.experience.resolution;
        changesSummary.push(`Retrieved proven historical resolution for '${failureCategory}': ${learnedResolution}`);
      }
    } catch {
      // Non-blocking fallback
    }

    switch (failureCategory) {
      case 'TEST_FAILURE':
      case 'VALIDATION_FAILURE': {
        strategyUsed = 'DIAGNOSTIC_SELF_HEAL_AND_RETEST';
        // Mark failed step as COMPLETED_WITH_DIAGNOSTICS or reset
        failedStep.status = 'COMPLETED';
        failedStep.output = { testStatus: 'FAILED', reason: failureReason, diagnosticsRequired: true };

        const healStepId = `step_heal_${Date.now()}`;
        const retestStepId = `step_retest_${Date.now()}`;

        // 1. Resolve agents
        const debugAgent = await agentAssignmentResolver.resolveAgent({
          role: 'DEBUG_AGENT',
          requiredCapabilities: ['ERROR_DIAGNOSIS', 'PATCH_GENERATION'],
          workspaceId,
          userId,
        });

        const testAgent = await agentAssignmentResolver.resolveAgent({
          role: 'TESTING_AGENT',
          requiredCapabilities: ['TEST_EXECUTION'],
          workspaceId,
          userId,
        });

        // 2. Insert self-healing step
        const healStep: WorkflowStep = {
          id: healStepId,
          workflowId: workflow.id,
          agentId: debugAgent.agentId,
          name: 'Self-Healing Automated Patch',
          description: `Diagnose test failure (${failureReason}) and apply AST code repair patch.`,
          status: 'PENDING',
          dependencies: [failedStepId],
          input: { failureReason, originalStep: failedStep.name, autoPatch: true },
          requiredCapabilities: ['ERROR_DIAGNOSIS', 'PATCH_GENERATION'],
        };

        // 3. Insert re-test verification step
        const retestStep: WorkflowStep = {
          id: retestStepId,
          workflowId: workflow.id,
          agentId: testAgent.agentId,
          name: 'Re-Verify Build & Test Suite',
          description: 'Re-execute test suite to verify applied patch resolves failures.',
          status: 'PENDING',
          dependencies: [healStepId],
          input: { rerunOriginal: failedStepId },
          requiredCapabilities: ['TEST_EXECUTION'],
        };

        // Update downstream steps that depended on the failed step to now depend on retestStepId
        for (let i = failedStepIndex + 1; i < currentSteps.length; i++) {
          const step = currentSteps[i];
          if (step.dependencies.includes(failedStepId)) {
            step.dependencies = step.dependencies.map((d) => (d === failedStepId ? retestStepId : d));
            if (step.status === 'SKIPPED' || step.status === 'FAILED') {
              step.status = 'PENDING';
            }
          }
        }

        currentSteps.splice(failedStepIndex + 1, 0, healStep, retestStep);
        changesSummary.push(`Injected diagnostic patch step '${healStepId}' and re-test step '${retestStepId}'`);
        break;
      }

      case 'DEPLOYMENT_FAILURE': {
        strategyUsed = 'FALLBACK_DEPLOYMENT_RECONFIGURATION';
        failedStep.status = 'FAILED';

        const fallbackDeployId = `step_deploy_fallback_${Date.now()}`;
        const deployAgent = await agentAssignmentResolver.resolveAgent({
          role: 'DEPLOYMENT_AGENT',
          requiredCapabilities: ['VERCEL_DEPLOYMENT'],
          workspaceId,
          userId,
        });

        const fallbackStep: WorkflowStep = {
          id: fallbackDeployId,
          workflowId: workflow.id,
          agentId: deployAgent.agentId,
          name: 'Fallback Staging Deployment',
          description: `Deploy to isolated preview environment with relaxed bundle constraints after primary failure: ${failureReason}`,
          status: 'PENDING',
          dependencies: failedStep.dependencies,
          input: { targetEnv: 'preview', fallbackMode: true, originalFailure: failureReason },
          toolId: 'vercel_deployment_create',
          requiredCapabilities: ['VERCEL_DEPLOYMENT'],
        };

        // Reroute downstream verification steps to depend on fallback step
        for (let i = failedStepIndex + 1; i < currentSteps.length; i++) {
          const step = currentSteps[i];
          if (step.dependencies.includes(failedStepId)) {
            step.dependencies = step.dependencies.map((d) => (d === failedStepId ? fallbackDeployId : d));
            if (step.status === 'SKIPPED') {
              step.status = 'PENDING';
            }
          }
        }

        currentSteps.splice(failedStepIndex + 1, 0, fallbackStep);
        changesSummary.push(`Injected fallback staging deployment step '${fallbackDeployId}'`);
        break;
      }

      case 'TOOL_FAILURE':
      case 'CAPABILITY_UNAVAILABLE': {
        strategyUsed = 'TOOL_SUBSTITUTION_AND_FALLBACK';
        // Substitute failed external tool with internal fallback file/terminal execution
        failedStep.status = 'PENDING';
        const originalTool = failedStep.toolId;
        failedStep.toolId = 'tool_terminal_exec';
        failedStep.input = {
          ...failedStep.input,
          fallbackReason: `Substituted tool '${originalTool}' due to: ${failureReason}`,
          useInternalAdapter: true,
        };
        changesSummary.push(`Substituted tool '${originalTool}' on step '${failedStepId}' with 'tool_terminal_exec' fallback adapter`);
        break;
      }

      case 'APPROVAL_DENIED': {
        strategyUsed = 'NON_DESTRUCTIVE_BRANCHING';
        failedStep.status = 'CANCELLED';

        const safeAlternativeId = `step_safe_alt_${Date.now()}`;
        const altStep: WorkflowStep = {
          id: safeAlternativeId,
          workflowId: workflow.id,
          agentId: failedStep.agentId,
          name: `${failedStep.name} (Dry Run / Staging Preview)`,
          description: `Non-destructive fallback executed because production approval was denied: ${failureReason}`,
          status: 'PENDING',
          dependencies: failedStep.dependencies,
          input: { dryRun: true, simulateOnly: true },
          approvalRequired: false,
          requiredCapabilities: failedStep.requiredCapabilities,
        };

        for (let i = failedStepIndex + 1; i < currentSteps.length; i++) {
          const step = currentSteps[i];
          if (step.dependencies.includes(failedStepId)) {
            step.dependencies = step.dependencies.map((d) => (d === failedStepId ? safeAlternativeId : d));
            if (step.status === 'SKIPPED') {
              step.status = 'PENDING';
            }
          }
        }

        currentSteps.splice(failedStepIndex + 1, 0, altStep);
        changesSummary.push(`Replaced approval-denied step with safe non-destructive alternative '${safeAlternativeId}'`);
        break;
      }

      case 'AGENT_FAILURE': {
        strategyUsed = 'AGENT_FAILOVER_AND_REASSIGNMENT';
        const newAgent = await agentAssignmentResolver.resolveAgent({
          role: 'CODING_AGENT',
          requiredCapabilities: failedStep.requiredCapabilities,
          workspaceId,
          userId,
        });

        failedStep.agentId = newAgent.agentId;
        failedStep.status = 'PENDING';
        changesSummary.push(`Reassigned failed step '${failedStepId}' to backup agent '${newAgent.agentId}'`);
        break;
      }

      case 'QUOTA_EXCEEDED': {
        strategyUsed = 'AGENT_CONSOLIDATION_AND_COMPRESSION';
        // Consolidate remaining pending steps to reduce agent overhead
        const pendingSteps = currentSteps.filter((s) => s.status === 'PENDING');
        for (const s of pendingSteps) {
          s.agentId = 'agent_coding_01'; // consolidate to standard coding agent
        }
        changesSummary.push(`Consolidated ${pendingSteps.length} pending steps to 'agent_coding_01' to conserve quota.`);
        break;
      }

      default: {
        strategyUsed = 'GENERIC_STEP_RETRY_ADAPTATION';
        failedStep.status = 'PENDING';
        failedStep.input = { ...failedStep.input, replannedAttempt: true };
        changesSummary.push(`Reset failed step '${failedStepId}' with adapted input parameters.`);
      }
    }

    // Validate the new DAG
    const validation = WorkflowGraph.validateGraph(currentSteps);
    if (!validation.valid) {
      return {
        success: false,
        originalWorkflowId: workflow.id,
        replannedWorkflow: workflow,
        changesSummary: [`Replanned graph validation failed: ${validation.errors.join(', ')}`],
        strategyUsed,
        error: `Replanned graph validation failed: ${validation.errors.join(', ')}`,
      };
    }

    const replannedWorkflow: Workflow = {
      ...workflow,
      status: 'READY',
      steps: currentSteps,
      updatedAt: new Date().toISOString(),
    };

    // Update repository
    const repos = getRepositories();
    await repos.workflows.update(workflow.id, {
      status: 'READY',
      steps: currentSteps,
    });

    workflowEventBus.emitEvent(workflow.id, workspaceId, 'WORKFLOW_PLANNED', {
      replanStrategy: strategyUsed,
      changes: changesSummary,
      triggeredByStep: failedStepId,
    });

    // Record self-healing resolution experience
    agentExperienceManager.recordExperience({
      workspaceId,
      workflowId: workflow.id,
      stepId: failedStepId,
      eventType: 'DEBUG_FIX',
      inputSummary: `Replanning triggered for step '${failedStep.name}' due to [${failureCategory}]: ${failureReason}`,
      actionSummary: `Applied strategy '${strategyUsed}' (${changesSummary.join('; ')})`,
      resultSummary: 'Alternative DAG dynamically synthesized and validated',
      success: true,
      errorCategory: failureCategory,
      resolution: strategyUsed,
      confidence: 0.95,
      tags: ['REPLANNING', failureCategory, strategyUsed],
      metadata: { failedStepId, failureCategory, failureReason, strategyUsed },
    }).catch(() => {});

    return {
      success: true,
      originalWorkflowId: workflow.id,
      replannedWorkflow,
      changesSummary,
      strategyUsed,
    };
  }
}

export const workflowReplanner = new WorkflowReplanner();
