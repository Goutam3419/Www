import {
  WorkflowPlan,
  WorkflowStepStatus,
  DeadlockDiagnosticReport,
  DeadlockUnresolvedDependency,
} from '@/packages/types/src';

export interface DeadlockDetectableStep {
  id: string;
  dependencies?: string[];
  requiredCapabilities?: string[];
  name?: string;
  toolId?: string;
  assignedAgentId?: string;
}

export type DeadlockDetectablePlan =
  | WorkflowPlan
  | {
      plannedSteps: DeadlockDetectableStep[];
      selectedTools?: string[];
      workflowId?: string;
      [key: string]: unknown;
    };

export class WorkflowDeadlockDetector {
  /**
   * Analyzes workflow plan and step statuses to detect deadlocks, cycles, or unresolvable dependencies.
   */
  public detectDeadlock(
    plan: DeadlockDetectablePlan,
    stepStates: Record<string, { status: WorkflowStepStatus; error?: string }>
  ): DeadlockDiagnosticReport {
    const blockedSteps: string[] = [];
    const unresolvedDependencies: DeadlockUnresolvedDependency[] = [];
    const missingCapabilities: string[] = [];

    const steps = plan.plannedSteps || [];
    const stepMap = new Map(steps.map((s) => [s.id, s]));
    const statusMap = new Map<string, WorkflowStepStatus>();

    for (const s of steps) {
      statusMap.set(s.id, stepStates[s.id]?.status || 'PENDING');
    }

    // 1. Cycle Detection via Tarjan's / DFS
    const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
    let cycleDetected = false;

    const dfs = (stepId: string): boolean => {
      visited.set(stepId, 1);
      const step = stepMap.get(stepId);
      if (step) {
        for (const depId of step.dependencies || []) {
          if (visited.get(depId) === 1) {
            return true; // cycle!
          }
          if (!visited.get(depId) && dfs(depId)) {
            return true;
          }
        }
      }
      visited.set(stepId, 2);
      return false;
    };

    for (const step of steps) {
      if (!visited.get(step.id)) {
        if (dfs(step.id)) {
          cycleDetected = true;
          break;
        }
      }
    }

    if (cycleDetected) {
      return {
        isDeadlocked: true,
        reason: 'Circular dependency cycle detected in workflow DAG.',
        blockedSteps: steps.map((s) => s.id),
        cycleDetected: true,
        missingCapabilities: [],
        unresolvedDependencies: [],
        recommendedAction: 'Replan workflow DAG to break cyclic dependency edges.',
      };
    }

    // 2. Check for steps permanently blocked by failed predecessors
    for (const step of steps) {
      const currentStatus = statusMap.get(step.id);
      if (currentStatus === 'COMPLETED' || currentStatus === 'FAILED' || currentStatus === 'CANCELLED') {
        continue;
      }

      let isBlocked = false;
      for (const depId of step.dependencies || []) {
        const depStatus = statusMap.get(depId);
        if (!depStatus || depStatus === 'FAILED' || depStatus === 'CANCELLED') {
          isBlocked = true;
          unresolvedDependencies.push({
            stepId: step.id,
            waitingOn: depId,
            waitingOnStatus: depStatus || 'NOT_FOUND',
          });
        }
      }

      if (isBlocked) {
        blockedSteps.push(step.id);
      }

      // Check missing required capabilities
      if (step.requiredCapabilities && step.requiredCapabilities.length > 0) {
        const hasTools = step.toolId || (plan.selectedTools && plan.selectedTools.length > 0);
        if (!hasTools && !step.assignedAgentId) {
          missingCapabilities.push(...step.requiredCapabilities);
        }
      }
    }

    // 3. Are all remaining non-completed steps blocked?
    const nonCompleted = steps.filter((s) => {
      const st = statusMap.get(s.id);
      return st !== 'COMPLETED' && st !== 'FAILED' && st !== 'CANCELLED';
    });

    const isFullyDeadlocked = nonCompleted.length > 0 && blockedSteps.length === nonCompleted.length;

    if (isFullyDeadlocked || unresolvedDependencies.length > 0) {
      return {
        isDeadlocked: true,
        reason: `Workflow blocked: ${blockedSteps.length} steps waiting on failed/cancelled dependencies (${unresolvedDependencies.map((u) => `${u.stepId}->${u.waitingOn}:${u.waitingOnStatus}`).join(', ')}).`,
        blockedSteps,
        cycleDetected: false,
        missingCapabilities: Array.from(new Set(missingCapabilities)),
        unresolvedDependencies,
        recommendedAction: 'Trigger autonomous workflow replanning or self-healing to repair failed predecessor branch.',
      };
    }

    return {
      isDeadlocked: false,
      reason: 'Workflow execution graph has no deadlocks or unresolved dependency cycles.',
      blockedSteps: [],
      cycleDetected: false,
      missingCapabilities: [],
      unresolvedDependencies: [],
      recommendedAction: 'Proceed with execution of ready frontier steps.',
    };
  }
}

export const workflowDeadlockDetector = new WorkflowDeadlockDetector();
