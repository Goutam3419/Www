import { ExecutionPlan, ExecutionPlanStep, PipelineStageState } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface PlanGenerationInput {
  requestId?: string;
  goal: string;
  workspaceId?: string;
  projectId?: string;
  toolIds?: string[];
}

export class ExecutionPlannerService {
  /**
   * Generates a multi-step execution plan from an AI/user request without executing any step.
   */
  public createPlan(input: PlanGenerationInput): ExecutionPlan {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const requestId = input.requestId || `req_${Date.now()}`;

    // Standard high-level execution step breakdown derived from the goal
    const rawSteps = [
      {
        actionName: 'Context Initialization',
        description: `Analyze workspace context and validate target environment for goal: "${input.goal}".`,
        toolId: input.toolIds?.[0] || 'tool_context_init'
      },
      {
        actionName: 'Dependency & Permission Check',
        description: 'Verify required permissions, tool registration, and execution policies.',
        toolId: 'tool_permission_check'
      },
      {
        actionName: 'Execution Strategy Preparation',
        description: 'Format parameter payload and configure queue priority.',
        toolId: 'tool_strategy_prep'
      },
      {
        actionName: 'Step Dispatch & Verification',
        description: 'Prepare final execution state and record pre-flight telemetry.',
        toolId: 'tool_dispatch_verify'
      }
    ];

    const steps: ExecutionPlanStep[] = rawSteps.map((s, idx) => ({
      id: `step_${planId}_${idx + 1}`,
      stepNumber: idx + 1,
      toolId: s.toolId,
      actionName: s.actionName,
      description: s.description,
      status: (idx === 0 ? 'Ready' : 'Pending') as PipelineStageState,
      dependsOnStepIds: idx > 0 ? [`step_${planId}_${idx}`] : []
    }));

    const plan: ExecutionPlan = {
      id: planId,
      requestId,
      title: `Plan: ${input.goal.slice(0, 40)}${input.goal.length > 40 ? '...' : ''}`,
      goal: input.goal,
      steps,
      status: 'Ready',
      createdAt: new Date().toISOString(),
      workspaceId: input.workspaceId,
      projectId: input.projectId
    };

    db.saveExecutionPlan(plan);
    return plan;
  }

  public getPlan(planId: string): ExecutionPlan | undefined {
    return db.getExecutionPlan(planId);
  }

  public getPlans(workspaceId?: string): ExecutionPlan[] {
    return db.getExecutionPlans(workspaceId);
  }
}

export const executionPlannerService = new ExecutionPlannerService();
