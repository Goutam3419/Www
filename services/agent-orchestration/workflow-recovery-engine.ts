import {
  WorkflowRecoveryResult,
  WorkflowCheckpoint,
  WorkflowResult,
  UserRole,
  WorkflowStep,
} from '@/packages/types/src';
import { durableCheckpointManager } from './durable-checkpoint-manager';
import { getRepositorySuite } from '@/lib/db/repositories';
import { workflowStateManagerService } from './workflow-state-manager';
import { workflowEventBus } from './workflow-event-bus';
import { agentContextManager } from './agent-context-manager';
import { agentArtifactRegistry } from './agent-artifact-registry';
import { heartbeatMonitor } from './heartbeat-monitor';
import { workflowDeadlockDetector } from './workflow-deadlock-detector';
import { workflowExecutionEngine } from './workflow-execution-engine';

export interface RecoverExecutionOptions {
  executionId: string;
  workspaceId: string;
  userId: string;
  userRole?: UserRole;
  customCheckpointId?: string;
}

export class WorkflowRecoveryEngine {
  /**
   * Recovers and resumes a workflow execution from its latest durable checkpoint.
   */
  public async recoverExecution(options: RecoverExecutionOptions): Promise<WorkflowRecoveryResult> {
    const { executionId, workspaceId, userId, userRole = 'ADMIN', customCheckpointId } = options;
    const repos = getRepositorySuite();

    // 1. Fetch latest or specified checkpoint
    let checkpoint: WorkflowCheckpoint | null = null;
    if (customCheckpointId) {
      checkpoint = await repos.checkpoints.get(customCheckpointId);
      if (checkpoint && checkpoint.workspaceId !== workspaceId) {
        checkpoint = null;
      }
    } else {
      checkpoint = await durableCheckpointManager.getLatestCheckpoint(executionId, workspaceId);
    }

    if (!checkpoint) {
      return {
        workflowId: '',
        executionId,
        workspaceId,
        checkpointLoaded: false,
        integrityValid: false,
        alreadyCompletedSteps: [],
        resumedSteps: [],
        status: 'FAILED',
        actionsTaken: [],
        error: `No valid checkpoint found for execution '${executionId}' in workspace '${workspaceId}'`,
      };
    }

    // 2. Validate Checksum & Integrity
    const isIntegrityValid = durableCheckpointManager.validateCheckpointIntegrity(checkpoint);
    if (!isIntegrityValid) {
      await repos.recoveryAudit.log({
        workspaceId,
        workflowId: checkpoint.workflowId,
        executionId,
        stepId: checkpoint.stepId,
        eventType: 'INTEGRITY_CHECK_FAILED',
        failureCategory: 'VALIDATION_ERROR',
        recoveryAction: 'ABORT_CORRUPTED_CHECKPOINT',
        attemptNumber: 1,
        actor: 'WORKFLOW_RECOVERY_ENGINE',
        result: 'FAILED',
        metadata: { checkpointId: checkpoint.id, storedChecksum: checkpoint.checksum },
      });

      return {
        workflowId: checkpoint.workflowId,
        executionId,
        workspaceId,
        checkpointLoaded: true,
        integrityValid: false,
        alreadyCompletedSteps: [],
        resumedSteps: [],
        status: 'FAILED',
        actionsTaken: ['ABORT_CORRUPTED_CHECKPOINT'],
        error: `Checkpoint integrity verification failed (checksum mismatch) for checkpoint '${checkpoint.id}'.`,
      };
    }

    // 3. Load Workflow Definition
    const workflow = await repos.workflows.get(checkpoint.workflowId);
    if (!workflow) {
      return {
        workflowId: checkpoint.workflowId,
        executionId,
        workspaceId,
        checkpointLoaded: true,
        integrityValid: true,
        alreadyCompletedSteps: [],
        resumedSteps: [],
        status: 'FAILED',
        actionsTaken: [],
        error: `Underlying workflow definition '${checkpoint.workflowId}' not found.`,
      };
    }

    if (workflow.workspaceId !== workspaceId) {
      throw new Error(`Workspace isolation violation: Workflow belongs to workspace '${workflow.workspaceId}'`);
    }

    // 4. Determine completed steps to skip
    const completedStepIds: string[] = [];
    for (const [stepId, state] of Object.entries(checkpoint.stepStates || {})) {
      if (state.status === 'COMPLETED') {
        completedStepIds.push(stepId);
      }
    }

    // 5. Restore In-Memory State & Agent Context
    workflowStateManagerService.initializeState(
      checkpoint.workflowId,
      workspaceId,
      userId,
      executionId,
      checkpoint.variables
    );

    for (const [stepId, out] of Object.entries(checkpoint.agentOutputs || {})) {
      const toolRes = checkpoint.toolResults[stepId] as Record<string, unknown> | undefined;
      workflowStateManagerService.updateStepOutput(
        executionId,
        workspaceId,
        stepId,
        out as Record<string, unknown>,
        toolRes
      );
    }

    agentContextManager.createContext(workspaceId, checkpoint.workflowId, checkpoint.variables);

    // 6. Update step statuses in workflow definition: Mark already-completed steps
    const restoredSteps: WorkflowStep[] = workflow.steps.map((step) => {
      const savedState = checkpoint?.stepStates[step.id];
      if (savedState && savedState.status === 'COMPLETED') {
        return {
          ...step,
          status: 'COMPLETED',
          output: (checkpoint?.agentOutputs[step.id] as Record<string, unknown>) || step.output,
        };
      }
      return {
        ...step,
        status: 'PENDING',
      };
    });

    const updatedWorkflow = {
      ...workflow,
      steps: restoredSteps,
    };

    // 7. Check for deadlocks in remaining steps before resuming
    const deadlockReport = workflowDeadlockDetector.detectDeadlock(
      {
        workflowId: workflow.id,
        plannedSteps: restoredSteps.map((s) => ({
          id: s.id,
          name: s.name,
          dependencies: s.dependencies || [],
          toolId: s.toolId,
          assignedAgentId: s.agentId,
          requiredCapabilities: s.requiredCapabilities,
        })),
        decisions: [],
        planningStatus: 'SUCCESS',
        estimatedDurationMs: 5000,
      },
      checkpoint.stepStates
    );

    if (deadlockReport.isDeadlocked && deadlockReport.cycleDetected) {
      return {
        workflowId: checkpoint.workflowId,
        executionId,
        workspaceId,
        checkpointLoaded: true,
        integrityValid: true,
        alreadyCompletedSteps: completedStepIds,
        resumedSteps: [],
        status: 'FAILED',
        actionsTaken: ['DEADLOCK_DETECTED'],
        error: `Deadlock detected during recovery: ${deadlockReport.reason}`,
      };
    }

    // 8. Log Recovery Audit Event
    await repos.recoveryAudit.log({
      workspaceId,
      workflowId: checkpoint.workflowId,
      executionId,
      stepId: checkpoint.stepId,
      eventType: 'CHECKPOINT_RESTORED',
      failureCategory: 'UNKNOWN_ERROR',
      recoveryAction: 'RESUME_FROM_CHECKPOINT',
      attemptNumber: (checkpoint.repairAttemptsCount || 0) + 1,
      actor: 'WORKFLOW_RECOVERY_ENGINE',
      result: 'SUCCESS',
      metadata: {
        checkpointId: checkpoint.id,
        skippedSteps: completedStepIds,
        remainingStepsCount: restoredSteps.length - completedStepIds.length,
      },
    });

    workflowEventBus.emitEvent(workflow.id, workspaceId, 'WORKFLOW_RESUMED', {
      executionId,
      recoveredFromCheckpointId: checkpoint.id,
      completedStepsCount: completedStepIds.length,
    });

    // 9. Execute remaining workflow steps to completion
    const executionResult = await workflowExecutionEngine.executeWorkflow({
      workflow: updatedWorkflow,
      workspaceId,
      userId,
      userRole,
      skipApprovalCheck: true,
    });

    return {
      workflowId: checkpoint.workflowId,
      executionId,
      workspaceId,
      checkpointLoaded: true,
      integrityValid: true,
      alreadyCompletedSteps: completedStepIds,
      resumedSteps: restoredSteps.filter((s) => s.status !== 'COMPLETED').map((s) => s.id),
      status: executionResult.status,
      actionsTaken: ['RESTORE_STATE', 'SKIP_COMPLETED_STEPS', 'EXECUTE_DAG'],
      workflowResult: executionResult,
      error: executionResult.error,
    };
  }

  /**
   * Periodically recovers any orphaned executions across the workspace.
   */
  public async recoverOrphanedWorkflows(
    workspaceId: string,
    userId: string,
    timeoutMs = 60000
  ): Promise<WorkflowRecoveryResult[]> {
    const orphanReport = await heartbeatMonitor.recoverOrphans(workspaceId, timeoutMs);
    const results: WorkflowRecoveryResult[] = [];

    for (const diag of orphanReport.diagnostics) {
      try {
        const res = await this.recoverExecution({
          executionId: diag.executionId,
          workspaceId,
          userId,
        });
        results.push(res);
      } catch (err: unknown) {
        results.push({
          workflowId: '',
          executionId: diag.executionId,
          workspaceId,
          checkpointLoaded: false,
          integrityValid: false,
          alreadyCompletedSteps: [],
          resumedSteps: [],
          status: 'FAILED',
          actionsTaken: [],
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return results;
  }
}

export const workflowRecoveryEngine = new WorkflowRecoveryEngine();
