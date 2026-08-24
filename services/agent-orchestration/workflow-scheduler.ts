import {
  Workflow,
  WorkflowExecution,
  WorkflowResult,
  WorkflowStep,
} from '@/packages/types/src';
import { WorkflowGraph } from './workflow-graph';
import { agentAssignmentResolver } from './agent-assignment-resolver';
import { workflowStateManagerService } from './workflow-state-manager';
import { workflowEventBus } from './workflow-event-bus';
import { usageControlEngine } from '@/services/workspace/usage-control-engine';
import { RetryPolicyEngine } from './retry-policy-engine';

export interface WorkflowSchedulerOptions {
  workflow: Workflow;
  workspaceId: string;
  userId: string;
}

export class WorkflowScheduler {
  /**
   * Schedules and executes a workflow sequentially in a deterministic dependency-aware graph loop.
   */
  public async executeWorkflow(options: WorkflowSchedulerOptions): Promise<WorkflowResult> {
    const { workflow, workspaceId, userId } = options;
    const startTime = Date.now();

    // 1. Verify workspace isolation
    if (workflow.workspaceId !== workspaceId) {
      throw new Error(
        `Workspace isolation violation: Workflow workspace '${workflow.workspaceId}' does not match context workspace '${workspaceId}'`
      );
    }

    // 2. Validate graph structure
    const graphValidation = WorkflowGraph.validateGraph(workflow.steps);
    if (!graphValidation.valid) {
      const errorMsg = `Invalid workflow graph: ${graphValidation.errors.join('; ')}`;
      workflowEventBus.emitEvent(workflow.id, workspaceId, 'WORKFLOW_FAILED', { error: errorMsg });
      return {
        workflowId: workflow.id,
        executionId: `exec_${Date.now()}`,
        success: false,
        status: 'FAILED',
        outputs: {},
        completedStepsCount: 0,
        failedStepsCount: workflow.steps.length,
        durationMs: Date.now() - startTime,
        error: errorMsg,
      };
    }

    // 3. Initialize Execution Context & State
    const executionId = `exec_wf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    workflowStateManagerService.initializeState(workflow.id, workspaceId, userId, executionId);

    workflowEventBus.emitEvent(workflow.id, workspaceId, 'WORKFLOW_STARTED', { executionId });

    const executionRecord: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      workspaceId,
      userId,
      status: 'RUNNING',
      completedSteps: [],
      failedSteps: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Make local mutable copies of steps
    const currentSteps: WorkflowStep[] = workflow.steps.map((s) => ({
      ...s,
      status: s.status || 'PENDING',
    }));

    let hasProgress = true;

    while (hasProgress) {
      // Find READY steps
      const readySteps = WorkflowGraph.getReadySteps(currentSteps);

      if (readySteps.length === 0) {
        // Check if all steps are completed or if blocked/failed
        const allCompleted = currentSteps.every(
          (s) => s.status === 'COMPLETED' || s.status === 'SKIPPED'
        );
        const anyFailed = currentSteps.some((s) => s.status === 'FAILED');

        if (allCompleted) {
          executionRecord.status = 'COMPLETED';
          executionRecord.completedAt = new Date().toISOString();
          workflowEventBus.emitEvent(workflow.id, workspaceId, 'WORKFLOW_COMPLETED', {
            executionId,
            completedCount: currentSteps.length,
          });

          const finalState = workflowStateManagerService.getState(executionId, workspaceId);
          return {
            workflowId: workflow.id,
            executionId,
            success: true,
            status: 'COMPLETED',
            outputs: finalState?.agentOutputs || {},
            completedStepsCount: currentSteps.filter((s) => s.status === 'COMPLETED').length,
            failedStepsCount: 0,
            durationMs: Date.now() - startTime,
          };
        }

        if (anyFailed) {
          executionRecord.status = 'FAILED';
          workflowEventBus.emitEvent(workflow.id, workspaceId, 'WORKFLOW_FAILED', {
            executionId,
            reason: 'Step dependency failure',
          });

          const finalState = workflowStateManagerService.getState(executionId, workspaceId);
          return {
            workflowId: workflow.id,
            executionId,
            success: false,
            status: 'FAILED',
            outputs: finalState?.agentOutputs || {},
            completedStepsCount: currentSteps.filter((s) => s.status === 'COMPLETED').length,
            failedStepsCount: currentSteps.filter((s) => s.status === 'FAILED').length,
            durationMs: Date.now() - startTime,
            error: 'Workflow halted due to step failure',
          };
        }

        // Deadlock / cycle case
        hasProgress = false;
        break;
      }

      // Execute ready steps sequentially
      for (const step of readySteps) {
        workflowEventBus.emitEvent(workflow.id, workspaceId, 'STEP_READY', { stepId: step.id });

        // Governance / quota check
        const quotaOk = usageControlEngine.validateQuota(workspaceId, 'AGENTS', 1);
        if (!quotaOk.allowed) {
          step.status = 'FAILED';
          executionRecord.failedSteps.push(step.id);
          workflowStateManagerService.recordStepFailure(
            executionId,
            workspaceId,
            step.id,
            'Workspace quota exceeded'
          );
          workflowEventBus.emitEvent(workflow.id, workspaceId, 'STEP_FAILED', {
            stepId: step.id,
            reason: 'Quota limit exceeded',
          });
          continue;
        }

        // Resolve Agent
        let assignment;
        try {
          assignment = await agentAssignmentResolver.resolveAgent({
            role: step.agentId || 'CODING_AGENT',
            requiredCapabilities: step.requiredCapabilities,
            workspaceId,
            userId,
          });
        } catch (assignErr: unknown) {
          const errMsg = assignErr instanceof Error ? assignErr.message : String(assignErr);
          step.status = 'FAILED';
          executionRecord.failedSteps.push(step.id);
          workflowStateManagerService.recordStepFailure(executionId, workspaceId, step.id, errMsg);
          workflowEventBus.emitEvent(workflow.id, workspaceId, 'STEP_FAILED', {
            stepId: step.id,
            error: errMsg,
          });
          continue;
        }

        // Execute step
        step.status = 'RUNNING';
        workflowEventBus.emitEvent(
          workflow.id,
          workspaceId,
          'STEP_STARTED',
          { stepId: step.id, agentId: assignment.agentId },
          step.id,
          assignment.agentId
        );

        let attempt = 1;
        let stepSuccess = false;
        let stepOutput: Record<string, unknown> = {};

        while (attempt <= (step.retryPolicy?.maxAttempts || 1) && !stepSuccess) {
          try {
            // Simulated / real step execution result
            stepOutput = {
              executedStep: step.id,
              agentId: assignment.agentId,
              role: assignment.role,
              status: 'SUCCESS',
              processedInput: step.input,
              timestamp: new Date().toISOString(),
            };
            stepSuccess = true;
          } catch (execErr: unknown) {
            const err = execErr instanceof Error ? execErr : new Error(String(execErr));
            const retryEval = RetryPolicyEngine.evaluateRetry(step, attempt, err);

            if (retryEval.shouldRetry) {
              workflowEventBus.emitEvent(workflow.id, workspaceId, 'STEP_RETRYING', {
                stepId: step.id,
                attempt,
                backoffMs: retryEval.backoffMs,
              });
              attempt++;
            } else {
              workflowStateManagerService.recordStepFailure(
                executionId,
                workspaceId,
                step.id,
                err.message
              );
              break;
            }
          }
        }

        if (stepSuccess) {
          step.status = 'COMPLETED';
          step.output = stepOutput;
          executionRecord.completedSteps.push(step.id);

          workflowStateManagerService.updateStepOutput(
            executionId,
            workspaceId,
            step.id,
            stepOutput
          );

          workflowEventBus.emitEvent(
            workflow.id,
            workspaceId,
            'STEP_COMPLETED',
            { stepId: step.id, agentId: assignment.agentId },
            step.id,
            assignment.agentId
          );
        } else {
          step.status = 'FAILED';
          executionRecord.failedSteps.push(step.id);
          workflowEventBus.emitEvent(workflow.id, workspaceId, 'STEP_FAILED', {
            stepId: step.id,
            agentId: assignment.agentId,
          });
        }
      }
    }

    const finalState = workflowStateManagerService.getState(executionId, workspaceId);
    return {
      workflowId: workflow.id,
      executionId,
      success: executionRecord.status === 'COMPLETED',
      status: executionRecord.status,
      outputs: finalState?.agentOutputs || {},
      completedStepsCount: currentSteps.filter((s) => s.status === 'COMPLETED').length,
      failedStepsCount: currentSteps.filter((s) => s.status === 'FAILED').length,
      durationMs: Date.now() - startTime,
    };
  }
}

export const workflowScheduler = new WorkflowScheduler();
