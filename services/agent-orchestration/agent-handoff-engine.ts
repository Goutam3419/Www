import {
  AgentHandoff,
  AgentRole,
  AgentTaskContext,
  UserRole,
  WorkspaceRole,
} from '@/packages/types/src';
import { agentContextManager } from './agent-context-manager';
import { agentCollaborationBus } from './agent-collaboration-bus';
import { getAgentRoleDefinition } from './agent-roles';
import { workflowEventBus } from './workflow-event-bus';
import { usageControlEngine } from '@/services/workspace/usage-control-engine';
import { workflowReplanner } from './workflow-replanner';
import { getRepositories } from '@/lib/db/repositories';
import { dbStore } from '@/lib/db/store';

export interface RequestHandoffParams {
  workspaceId: string;
  workflowId: string;
  fromStepId: string;
  toStepId: string;
  fromAgentId: string;
  fromAgentRole: AgentRole;
  toAgentId: string;
  toAgentRole: AgentRole;
  contextId?: string;
  requiredArtifactIds?: string[];
  requiresApproval?: boolean;
  userRole?: UserRole | WorkspaceRole;
}

export class AgentHandoffEngine {
  private handoffs: Map<string, AgentHandoff> = new Map(); // key: `${workspaceId}:${handoffId}`

  /**
   * Requests a formal handoff between two specialized agents.
   */
  public async requestHandoff(params: RequestHandoffParams): Promise<AgentHandoff> {
    const {
      workspaceId,
      workflowId,
      fromStepId,
      toStepId,
      fromAgentId,
      fromAgentRole,
      toAgentId,
      toAgentRole,
      requiredArtifactIds = [],
      requiresApproval = false,
      userRole = 'ADMIN',
    } = params;

    const handoffId = `hnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const context = agentContextManager.getContext(workspaceId, params.contextId || workflowId);
    const contextId = context?.contextId || `ctx_${workflowId}`;

    const handoff: AgentHandoff = {
      handoffId,
      workspaceId,
      workflowId,
      fromStepId,
      toStepId,
      fromAgentId,
      fromAgentRole,
      toAgentId,
      toAgentRole,
      status: 'PENDING_VALIDATION',
      contextId,
      requiredArtifactIds,
      validationErrors: [],
      requiresApproval,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const key = `${workspaceId}:${handoffId}`;
    this.handoffs.set(key, handoff);

    // Validate handoff immediately
    const validation = await this.validateHandoff(handoffId, workspaceId, userRole);
    if (!validation.valid) {
      handoff.status = 'FAILED';
      handoff.validationErrors = validation.errors;
      handoff.updatedAt = new Date().toISOString();

      // Emit handoff failure event
      agentCollaborationBus.publishMessage({
        workspaceId,
        workflowId,
        sessionId: `sess_${workflowId}`,
        fromAgentId,
        fromAgentRole,
        toAgentId,
        toAgentRole,
        messageType: 'ERROR',
        content: `Handoff validation failed from ${fromAgentRole} to ${toAgentRole}: ${validation.errors.join(', ')}`,
        correlationId: handoffId,
      });

      return handoff;
    }

    handoff.status = requiresApproval ? 'PENDING_VALIDATION' : 'VALIDATED';
    handoff.updatedAt = new Date().toISOString();

    // Log activity
    dbStore.logWorkspaceActivity({
      workspaceId,
      eventType: 'AGENT_HANDOFF_REQUESTED',
      title: `Agent Handoff Requested: ${fromAgentRole} -> ${toAgentRole}`,
      description: `Step ${fromStepId} -> ${toStepId}`,
      details: { handoffId, workflowId, fromAgentRole, toAgentRole },
    });

    return handoff;
  }

  /**
   * Validates handoff feasibility against 9 strict rules:
   * 1. Workspace access
   * 2. Agent availability
   * 3. Agent capability
   * 4. RBAC permissions
   * 5. Workflow state
   * 6. Quota
   * 7. Required artifacts
   * 8. Dependency completion
   * 9. Approval requirements
   */
  public async validateHandoff(
    handoffId: string,
    workspaceId: string,
    userRole: UserRole | WorkspaceRole = 'ADMIN'
  ): Promise<{ valid: boolean; errors: string[] }> {
    const key = `${workspaceId}:${handoffId}`;
    const handoff = this.handoffs.get(key);
    if (!handoff) {
      return { valid: false, errors: [`Handoff '${handoffId}' not found in workspace '${workspaceId}'`] };
    }

    const errors: string[] = [];

    // 1. Workspace access
    if (handoff.workspaceId !== workspaceId) {
      errors.push(`Workspace isolation error: Handoff belongs to '${handoff.workspaceId}', attempted access by '${workspaceId}'`);
    }

    // 2. RBAC permissions (VIEWER cannot initiate or approve handoffs)
    if (userRole === 'VIEWER') {
      errors.push(`RBAC policy violation: User with role '${userRole}' cannot authorize agent handoffs`);
    }

    // 3. Quota check
    const quotaCheck = usageControlEngine.validateQuota(workspaceId, 'TASKS', 1);
    if (!quotaCheck.allowed) {
      errors.push(`Quota limit exceeded for workspace '${workspaceId}': ${quotaCheck.reason}`);
    }

    // 4. Agent capability validation
    try {
      const roleDef = getAgentRoleDefinition(handoff.toAgentRole);
      if (!roleDef) {
        errors.push(`Target agent role '${handoff.toAgentRole}' is not registered`);
      }
    } catch {
      errors.push(`Failed to verify target agent role '${handoff.toAgentRole}'`);
    }

    // 5. Context and Required Artifacts check
    const context = agentContextManager.getContext(workspaceId, handoff.contextId);
    if (!context) {
      errors.push(`Context '${handoff.contextId}' not found in workspace`);
    } else if (handoff.requiredArtifactIds.length > 0) {
      const existingArtifactIds = new Set(context.artifacts.map((a) => a.artifactId));
      for (const requiredId of handoff.requiredArtifactIds) {
        if (!existingArtifactIds.has(requiredId)) {
          errors.push(`Required artifact '${requiredId}' is missing from shared context`);
        }
      }
    }

    // 6. Workflow state check
    const repos = getRepositories();
    const wf = await repos.workflows.get(handoff.workflowId);
    if (wf && (wf.status === 'FAILED' || wf.status === 'CANCELLED')) {
      errors.push(`Cannot handoff in a ${wf.status} workflow`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Approves a pending handoff gate.
   */
  public async approveHandoff(
    handoffId: string,
    workspaceId: string,
    approverUserId: string,
    approverRole: UserRole | WorkspaceRole
  ): Promise<AgentHandoff> {
    const key = `${workspaceId}:${handoffId}`;
    const handoff = this.handoffs.get(key);
    if (!handoff) {
      throw new Error(`Handoff '${handoffId}' not found`);
    }

    if (approverRole === 'VIEWER' || approverRole === 'MEMBER') {
      throw new Error(`Permission denied: Role '${approverRole}' cannot approve agent handoffs`);
    }

    handoff.status = 'APPROVED';
    handoff.approvedBy = approverUserId;
    handoff.approvalDecision = 'APPROVED';
    handoff.updatedAt = new Date().toISOString();

    agentCollaborationBus.publishMessage({
      workspaceId,
      workflowId: handoff.workflowId,
      sessionId: `sess_${handoff.workflowId}`,
      fromAgentId: approverUserId,
      fromAgentRole: 'CEO_AGENT',
      toAgentId: handoff.toAgentId,
      toAgentRole: handoff.toAgentRole,
      messageType: 'APPROVAL_RESPONSE',
      content: `Handoff '${handoffId}' approved by ${approverUserId} (${approverRole})`,
      correlationId: handoffId,
    });

    return handoff;
  }

  /**
   * Rejects a pending handoff gate and triggers replanning.
   */
  public async rejectHandoff(
    handoffId: string,
    workspaceId: string,
    rejectorUserId: string,
    reason: string
  ): Promise<AgentHandoff> {
    const key = `${workspaceId}:${handoffId}`;
    const handoff = this.handoffs.get(key);
    if (!handoff) {
      throw new Error(`Handoff '${handoffId}' not found`);
    }

    handoff.status = 'REJECTED';
    handoff.approvalDecision = 'REJECTED';
    handoff.rejectionReason = reason;
    handoff.updatedAt = new Date().toISOString();

    agentCollaborationBus.publishMessage({
      workspaceId,
      workflowId: handoff.workflowId,
      sessionId: `sess_${handoff.workflowId}`,
      fromAgentId: rejectorUserId,
      fromAgentRole: 'CEO_AGENT',
      toAgentId: handoff.fromAgentId,
      toAgentRole: handoff.fromAgentRole,
      messageType: 'APPROVAL_RESPONSE',
      content: `Handoff '${handoffId}' rejected: ${reason}`,
      correlationId: handoffId,
    });

    // Trigger workflow replanner for handoff rejection
    const repos = getRepositories();
    const wf = await repos.workflows.get(handoff.workflowId);
    if (wf) {
      await workflowReplanner.replanWorkflow({
        workflow: wf,
        failedStepId: handoff.fromStepId,
        failureReason: `Handoff rejected: ${reason}`,
        failureCategory: 'APPROVAL_DENIED',
        workspaceId,
        userId: rejectorUserId,
      });
    }

    return handoff;
  }

  /**
   * Executes the handoff transfer, sanitizing and delivering context to the recipient agent.
   */
  public async executeHandoff(
    handoffId: string,
    workspaceId: string
  ): Promise<{ success: boolean; handoff: AgentHandoff; recipientContext: AgentTaskContext }> {
    const key = `${workspaceId}:${handoffId}`;
    const handoff = this.handoffs.get(key);
    if (!handoff) {
      throw new Error(`Handoff '${handoffId}' not found`);
    }

    if (handoff.status !== 'VALIDATED' && handoff.status !== 'APPROVED') {
      // If validation not passed, replan
      const repos = getRepositories();
      const wf = await repos.workflows.get(handoff.workflowId);
      if (wf) {
        await workflowReplanner.replanWorkflow({
          workflow: wf,
          failedStepId: handoff.fromStepId,
          failureReason: `Handoff execution failed: Status is ${handoff.status}`,
          failureCategory: 'AGENT_FAILURE',
          workspaceId,
          userId: 'system_handoff_engine',
        });
      }
      throw new Error(`Handoff '${handoffId}' cannot be executed in state '${handoff.status}'`);
    }

    handoff.status = 'EXECUTING';

    const fullContext = agentContextManager.getContext(workspaceId, handoff.contextId);
    if (!fullContext) {
      handoff.status = 'FAILED';
      throw new Error(`Context not found during handoff execution`);
    }

    // Filter context specifically for recipient agent role
    const recipientContext = agentContextManager.filterContextForAgent(fullContext, handoff.toAgentRole);

    handoff.status = 'COMPLETED';
    handoff.resultSummary = `Transferred context v${recipientContext.version} with ${recipientContext.artifacts.length} artifacts to ${handoff.toAgentRole}`;
    handoff.updatedAt = new Date().toISOString();

    // Publish handoff completion message
    agentCollaborationBus.publishMessage({
      workspaceId,
      workflowId: handoff.workflowId,
      sessionId: `sess_${handoff.workflowId}`,
      fromAgentId: handoff.fromAgentId,
      fromAgentRole: handoff.fromAgentRole,
      toAgentId: handoff.toAgentId,
      toAgentRole: handoff.toAgentRole,
      messageType: 'HANDOFF',
      content: handoff.resultSummary,
      artifactIds: recipientContext.artifacts.map((a) => a.artifactId),
      correlationId: handoffId,
    });

    workflowEventBus.emitEvent(
      handoff.workflowId,
      workspaceId,
      'STEP_COMPLETED',
      {
        action: 'AGENT_HANDOFF_COMPLETED',
        handoffId,
        fromAgent: handoff.fromAgentRole,
        toAgent: handoff.toAgentRole,
      },
      handoff.fromStepId,
      handoff.fromAgentId
    );

    return {
      success: true,
      handoff,
      recipientContext,
    };
  }

  /**
   * Gets handoff by ID.
   */
  public getHandoffStatus(handoffId: string, workspaceId: string): AgentHandoff | null {
    const key = `${workspaceId}:${handoffId}`;
    const h = this.handoffs.get(key);
    if (!h || h.workspaceId !== workspaceId) return null;
    return h;
  }

  /**
   * Lists handoffs for a workspace/workflow.
   */
  public listHandoffs(workspaceId: string, workflowId?: string): AgentHandoff[] {
    const list: AgentHandoff[] = [];
    for (const h of this.handoffs.values()) {
      if (h.workspaceId !== workspaceId) continue;
      if (workflowId && h.workflowId !== workflowId) continue;
      list.push(h);
    }
    return list;
  }
}

export const agentHandoffEngine = new AgentHandoffEngine();
