import { ExecutionPlan, PipelineStageState } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class ExecutionPipelineService {
  /**
   * Updates pipeline state of an execution plan.
   */
  public updatePlanState(planId: string, newState: PipelineStageState): ExecutionPlan | undefined {
    const plan = db.getExecutionPlan(planId);
    if (plan) {
      plan.status = newState;
      db.saveExecutionPlan(plan);
    }
    return plan;
  }

  /**
   * Updates state of an individual step within an execution plan.
   */
  public updateStepState(
    planId: string,
    stepId: string,
    newState: PipelineStageState
  ): ExecutionPlan | undefined {
    const plan = db.getExecutionPlan(planId);
    if (!plan) return undefined;

    const step = plan.steps.find(s => s.id === stepId);
    if (step) {
      step.status = newState;
    }

    // Evaluate aggregate status of the plan pipeline
    const states = plan.steps.map(s => s.status);
    if (states.every(s => s === 'Completed')) {
      plan.status = 'Completed';
    } else if (states.some(s => s === 'Failed')) {
      plan.status = 'Failed';
    } else if (states.some(s => s === 'Cancelled')) {
      plan.status = 'Cancelled';
    } else if (states.some(s => s === 'Waiting Approval')) {
      plan.status = 'Waiting Approval';
    } else if (states.some(s => s === 'Running')) {
      plan.status = 'Running';
    } else if (states.some(s => s === 'Ready')) {
      plan.status = 'Ready';
    }

    db.saveExecutionPlan(plan);
    return plan;
  }

  /**
   * Calculates overall progress percentage of a plan's execution pipeline.
   */
  public getPipelineProgress(planId: string): { progressPercent: number; completedSteps: number; totalSteps: number } {
    const plan = db.getExecutionPlan(planId);
    if (!plan || plan.steps.length === 0) {
      return { progressPercent: 0, completedSteps: 0, totalSteps: 0 };
    }

    const completedSteps = plan.steps.filter(s => s.status === 'Completed').length;
    const progressPercent = Math.round((completedSteps / plan.steps.length) * 100);

    return {
      progressPercent,
      completedSteps,
      totalSteps: plan.steps.length
    };
  }
}

export const executionPipelineService = new ExecutionPipelineService();
