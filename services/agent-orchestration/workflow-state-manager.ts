import { WorkflowState } from '@/packages/types/src';

export function sanitizeSecretsInValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') {
    let sanitized = val;
    // Mask potential tokens, secret keys, password values
    sanitized = sanitized.replace(/bearer\s+[a-zA-Z0-9_\-\.\~]+/gi, 'Bearer [REDACTED]');
    sanitized = sanitized.replace(/AIzaSy[a-zA-Z0-9_\-]{20,}/g, '[REDACTED]');
    sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED]');
    sanitized = sanitized.replace(/ghp_[a-zA-Z0-9]{20,}/g, '[REDACTED]');
    sanitized = sanitized.replace(/vcp_[a-zA-Z0-9]{20,}/g, '[REDACTED]');
    sanitized = sanitized.replace(/xox[baprs]-[a-zA-Z0-9_\-]{20,}/g, '[REDACTED]');
    return sanitized;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeSecretsInValue);
  }
  if (typeof val === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, propValue] of Object.entries(val as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('api_key') ||
        lowerKey.includes('auth_token') ||
        lowerKey.includes('private_key') ||
        lowerKey.includes('bearer')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeSecretsInValue(propValue);
      }
    }
    return sanitized;
  }
  return val;
}

export class WorkflowStateManagerService {
  private states = new Map<string, WorkflowState>();

  /**
   * Initializes state container for a workflow execution.
   */
  public initializeState(
    workflowId: string,
    workspaceId: string,
    userId: string,
    executionId: string,
    initialVariables: Record<string, unknown> = {}
  ): WorkflowState {
    const now = new Date().toISOString();
    const sanitizedVars = sanitizeSecretsInValue(initialVariables) as Record<string, unknown>;

    const state: WorkflowState = {
      workflowId,
      workspaceId,
      userId,
      executionId,
      completedSteps: [],
      failedSteps: [],
      artifacts: {},
      variables: sanitizedVars,
      agentOutputs: {},
      toolResults: {},
      errors: [],
      timestamps: {
        createdAt: now,
        updatedAt: now,
        startedAt: now,
      },
    };

    this.states.set(executionId, state);
    return state;
  }

  /**
   * Retrieves state for an execution and verifies workspace isolation.
   */
  public getState(executionId: string, targetWorkspaceId: string): WorkflowState | null {
    const state = this.states.get(executionId);
    if (!state) return null;
    if (state.workspaceId !== targetWorkspaceId) {
      throw new Error(`Workspace isolation violation: Execution '${executionId}' belongs to workspace '${state.workspaceId}', not '${targetWorkspaceId}'`);
    }
    return state;
  }

  /**
   * Updates current step and records output.
   */
  public updateStepOutput(
    executionId: string,
    workspaceId: string,
    stepId: string,
    agentOutput: Record<string, unknown>,
    toolResult?: Record<string, unknown>
  ): WorkflowState {
    const state = this.getState(executionId, workspaceId);
    if (!state) throw new Error(`Execution state '${executionId}' not found`);

    const sanitizedOutput = sanitizeSecretsInValue(agentOutput) as Record<string, unknown>;
    state.agentOutputs[stepId] = sanitizedOutput;

    if (toolResult) {
      state.toolResults[stepId] = sanitizeSecretsInValue(toolResult) as Record<string, unknown>;
    }

    if (!state.completedSteps.includes(stepId)) {
      state.completedSteps.push(stepId);
    }

    state.currentStepId = stepId;
    state.timestamps.updatedAt = new Date().toISOString();
    this.states.set(executionId, state);
    return state;
  }

  /**
   * Records step execution failure safely.
   */
  public recordStepFailure(
    executionId: string,
    workspaceId: string,
    stepId: string,
    errorMsg: string
  ): WorkflowState {
    const state = this.getState(executionId, workspaceId);
    if (!state) throw new Error(`Execution state '${executionId}' not found`);

    const sanitizedError = sanitizeSecretsInValue(errorMsg) as string;
    if (!state.failedSteps.includes(stepId)) {
      state.failedSteps.push(stepId);
    }
    state.errors.push({
      stepId,
      message: sanitizedError,
      timestamp: new Date().toISOString(),
    });
    state.timestamps.updatedAt = new Date().toISOString();
    this.states.set(executionId, state);
    return state;
  }

  /**
   * Sets variables/artifacts into workflow state.
   */
  public setVariable(
    executionId: string,
    workspaceId: string,
    key: string,
    value: unknown
  ): WorkflowState {
    const state = this.getState(executionId, workspaceId);
    if (!state) throw new Error(`Execution state '${executionId}' not found`);

    state.variables[key] = sanitizeSecretsInValue(value);
    state.timestamps.updatedAt = new Date().toISOString();
    this.states.set(executionId, state);
    return state;
  }
}

export const workflowStateManagerService = new WorkflowStateManagerService();
