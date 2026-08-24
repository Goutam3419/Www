import { WorkflowStep, WorkflowStepStatus } from '@/packages/types/src';

export interface GraphValidationResult {
  valid: boolean;
  errors: string[];
}

export class WorkflowGraph {
  /**
   * Validates workflow step graph structure for missing dependencies and cycles.
   */
  public static validateGraph(steps: WorkflowStep[]): GraphValidationResult {
    const errors: string[] = [];
    const stepMap = new Map<string, WorkflowStep>();

    for (const step of steps) {
      if (stepMap.has(step.id)) {
        errors.push(`Duplicate step ID detected: '${step.id}'`);
      }
      stepMap.set(step.id, step);
    }

    // Check missing dependencies
    for (const step of steps) {
      for (const depId of step.dependencies || []) {
        if (!stepMap.has(depId)) {
          errors.push(`Step '${step.id}' depends on non-existent step '${depId}'`);
        }
        if (depId === step.id) {
          errors.push(`Step '${step.id}' cannot depend on itself`);
        }
      }
    }

    // Check for cycles using DFS
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const dfs = (stepId: string, path: string[]) => {
      visited.add(stepId);
      inStack.add(stepId);

      const step = stepMap.get(stepId);
      if (step) {
        for (const depId of step.dependencies || []) {
          if (!visited.has(depId)) {
            dfs(depId, [...path, stepId]);
          } else if (inStack.has(depId)) {
            errors.push(`Circular dependency detected: ${[...path, stepId, depId].join(' -> ')}`);
          }
        }
      }

      inStack.delete(stepId);
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        dfs(step.id, []);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Returns steps that are in PENDING state and have all dependencies completed or skipped.
   */
  public static getReadySteps(steps: WorkflowStep[]): WorkflowStep[] {
    const stepMap = new Map<string, WorkflowStep>(steps.map((s) => [s.id, s]));

    return steps.filter((step) => {
      if (step.status !== 'PENDING') return false;

      const deps = step.dependencies || [];
      if (deps.length === 0) return true;

      return deps.every((depId) => {
        const depStep = stepMap.get(depId);
        return depStep && (depStep.status === 'COMPLETED' || depStep.status === 'SKIPPED');
      });
    });
  }

  /**
   * Checks if a specific step is blocked by unfulfilled dependencies.
   */
  public static isStepBlocked(step: WorkflowStep, allSteps: WorkflowStep[]): boolean {
    if (step.status === 'COMPLETED' || step.status === 'SKIPPED' || step.status === 'CANCELLED') {
      return false;
    }
    const stepMap = new Map<string, WorkflowStep>(allSteps.map((s) => [s.id, s]));
    const deps = step.dependencies || [];

    return deps.some((depId) => {
      const depStep = stepMap.get(depId);
      return !depStep || (depStep.status !== 'COMPLETED' && depStep.status !== 'SKIPPED');
    });
  }

  /**
   * Returns topological stages (groups of steps that can be run at each execution tier).
   */
  public static getExecutionStages(steps: WorkflowStep[]): WorkflowStep[][] {
    const validation = this.validateGraph(steps);
    if (!validation.valid) {
      throw new Error(`Cannot compute execution stages for invalid graph: ${validation.errors.join('; ')}`);
    }

    const stepMap = new Map<string, WorkflowStep>(steps.map((s) => [s.id, s]));
    const assignedStage = new Map<string, number>();

    const getStageDepth = (stepId: string, visited: Set<string>): number => {
      if (assignedStage.has(stepId)) return assignedStage.get(stepId)!;
      const step = stepMap.get(stepId);
      if (!step || !step.dependencies || step.dependencies.length === 0) {
        assignedStage.set(stepId, 0);
        return 0;
      }

      visited.add(stepId);
      let maxDepStage = -1;
      for (const depId of step.dependencies) {
        if (!visited.has(depId)) {
          const depStage = getStageDepth(depId, new Set(visited));
          maxDepStage = Math.max(maxDepStage, depStage);
        }
      }
      const myStage = maxDepStage + 1;
      assignedStage.set(stepId, myStage);
      return myStage;
    };

    for (const step of steps) {
      getStageDepth(step.id, new Set());
    }

    const maxStage = Math.max(...Array.from(assignedStage.values()), 0);
    const stages: WorkflowStep[][] = Array.from({ length: maxStage + 1 }, () => []);

    for (const step of steps) {
      const stageIdx = assignedStage.get(step.id) || 0;
      stages[stageIdx].push(step);
    }

    return stages;
  }
}
