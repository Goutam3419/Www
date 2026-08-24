import {
  WorkflowCheckpoint,
  CheckpointTransitionEvent,
  WorkflowStepCheckpointState,
  WorkflowStatus,
  AgentRole,
} from '@/packages/types/src';
import { sanitizeSecretsInValue } from './workflow-state-manager';
import { getRepositorySuite } from '@/lib/db/repositories';
import crypto from 'crypto';

export interface CreateCheckpointOptions {
  workflowId: string;
  workspaceId: string;
  executionId: string;
  transitionEvent: CheckpointTransitionEvent;
  stepId?: string;
  status: WorkflowStatus;
  stepStates: Record<string, WorkflowStepCheckpointState>;
  variables: Record<string, unknown>;
  agentOutputs: Record<string, unknown>;
  toolResults: Record<string, unknown>;
  artifacts: Record<string, unknown>;
  pendingApprovals: string[];
  activeAgentAssignments: Record<string, { agentId: string; role: AgentRole }>;
  retryCounters: Record<string, number>;
  replanCount?: number;
  repairAttemptsCount?: number;
  metadata?: Record<string, unknown>;
}

export class DurableCheckpointManager {
  /**
   * Calculates a deterministic SHA-256 integrity checksum for a checkpoint payload.
   */
  public calculateChecksum(data: Omit<WorkflowCheckpoint, 'id' | 'checksum' | 'timestamp'>): string {
    // Sort keys deterministically for reproducible hashing
    const normalized = {
      workflowId: data.workflowId,
      workspaceId: data.workspaceId,
      executionId: data.executionId,
      transitionEvent: data.transitionEvent,
      stepId: data.stepId || '',
      status: data.status,
      stepStates: Object.keys(data.stepStates || {}).sort().reduce((acc, k) => {
        acc[k] = data.stepStates[k];
        return acc;
      }, {} as Record<string, WorkflowStepCheckpointState>),
      completedStepIds: Object.keys(data.stepStates || {})
        .filter((id) => data.stepStates[id]?.status === 'COMPLETED')
        .sort(),
      replanCount: data.replanCount || 0,
      repairAttemptsCount: data.repairAttemptsCount || 0,
    };
    return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  /**
   * Validates integrity of a stored checkpoint against its checksum.
   */
  public validateCheckpointIntegrity(checkpoint: WorkflowCheckpoint): boolean {
    if (!checkpoint || !checkpoint.checksum) return false;
    const expected = this.calculateChecksum({
      workflowId: checkpoint.workflowId,
      workspaceId: checkpoint.workspaceId,
      executionId: checkpoint.executionId,
      transitionEvent: checkpoint.transitionEvent,
      stepId: checkpoint.stepId,
      status: checkpoint.status,
      stepStates: checkpoint.stepStates,
      variables: checkpoint.variables,
      agentOutputs: checkpoint.agentOutputs,
      toolResults: checkpoint.toolResults,
      artifacts: checkpoint.artifacts,
      pendingApprovals: checkpoint.pendingApprovals,
      activeAgentAssignments: checkpoint.activeAgentAssignments,
      retryCounters: checkpoint.retryCounters,
      replanCount: checkpoint.replanCount,
      repairAttemptsCount: checkpoint.repairAttemptsCount,
      metadata: checkpoint.metadata,
    });
    return expected === checkpoint.checksum;
  }

  /**
   * Persists a durable execution checkpoint.
   */
  public async createCheckpoint(options: CreateCheckpointOptions): Promise<WorkflowCheckpoint> {
    const repos = getRepositorySuite();
    const now = new Date().toISOString();

    // Redact all sensitive tokens before storing checkpoint
    const sanitizedVars = sanitizeSecretsInValue(options.variables) as Record<string, unknown>;
    const sanitizedOutputs = sanitizeSecretsInValue(options.agentOutputs) as Record<string, unknown>;
    const sanitizedToolResults = sanitizeSecretsInValue(options.toolResults) as Record<string, unknown>;
    const sanitizedArtifacts = sanitizeSecretsInValue(options.artifacts) as Record<string, unknown>;

    const basePayload: Omit<WorkflowCheckpoint, 'id' | 'checksum' | 'timestamp'> = {
      workflowId: options.workflowId,
      workspaceId: options.workspaceId,
      executionId: options.executionId,
      transitionEvent: options.transitionEvent,
      stepId: options.stepId,
      status: options.status,
      stepStates: options.stepStates,
      variables: sanitizedVars,
      agentOutputs: sanitizedOutputs,
      toolResults: sanitizedToolResults,
      artifacts: sanitizedArtifacts,
      pendingApprovals: options.pendingApprovals,
      activeAgentAssignments: options.activeAgentAssignments,
      retryCounters: options.retryCounters,
      replanCount: options.replanCount || 0,
      repairAttemptsCount: options.repairAttemptsCount || 0,
      metadata: options.metadata || {},
    };

    const checksum = this.calculateChecksum(basePayload);

    const checkpoint: WorkflowCheckpoint = await repos.checkpoints.create({
      ...basePayload,
      checksum,
      timestamp: now,
    });

    return checkpoint;
  }

  /**
   * Retrieves latest durable checkpoint for an execution with workspace verification.
   */
  public async getLatestCheckpoint(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint | null> {
    const repos = getRepositorySuite();
    const checkpoint = await repos.checkpoints.getLatestByExecution(executionId, workspaceId);
    if (!checkpoint) return null;
    if (checkpoint.workspaceId !== workspaceId) {
      throw new Error(`Workspace isolation violation: Checkpoint belongs to workspace '${checkpoint.workspaceId}', not '${workspaceId}'`);
    }
    return checkpoint;
  }

  /**
   * Lists all sequential checkpoints for an execution.
   */
  public async listCheckpoints(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint[]> {
    const repos = getRepositorySuite();
    const list = await repos.checkpoints.listByExecution(executionId, workspaceId);
    for (const item of list) {
      if (item.workspaceId !== workspaceId) {
        throw new Error(`Workspace isolation violation: Checkpoint belongs to workspace '${item.workspaceId}', not '${workspaceId}'`);
      }
    }
    return list;
  }
}

export const durableCheckpointManager = new DurableCheckpointManager();
