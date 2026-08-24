import { db } from '@/lib/db/store';
import { ApprovalRequest, ToolDefinition, ApprovalLevel, UserRole } from '@/packages/types/src';
import { toolEventManagerService } from './tool-event-manager';

export interface CreateApprovalInput {
  executionId: string;
  tool: ToolDefinition;
  workspaceId: string;
  projectId: string;
  requestedBy: string;
  reason?: string;
  approvalLevel?: ApprovalLevel;
}

export class ExecutionApprovalService {
  /**
   * Determine required approval level for tool execution
   */
  public determineApprovalLevel(tool: ToolDefinition, userRole: UserRole = 'MEMBER'): ApprovalLevel {
    if (tool.status === 'Disabled') {
      return 'Blocked';
    }

    const danger = tool.dangerLevel;

    if (danger === 'Critical') {
      return 'Admin Only';
    }

    if (danger === 'High') {
      return userRole === 'ADMIN' ? 'Ask User' : 'Admin Only';
    }

    if (danger === 'Medium' || tool.requiresApproval || tool.approvalRequired) {
      return 'Ask User';
    }

    return 'Auto';
  }

  /**
   * Check if approval is required for tool execution based on danger level and approval flag
   */
  public isApprovalRequired(tool: ToolDefinition, userRole: UserRole = 'MEMBER'): boolean {
    const level = this.determineApprovalLevel(tool, userRole);
    return level === 'Ask User' || level === 'Admin Only';
  }

  /**
   * Request approval for execution
   */
  public createApprovalRequest(input: CreateApprovalInput): ApprovalRequest {
    const approvalLevel = input.approvalLevel || this.determineApprovalLevel(input.tool);
    const reason =
      input.reason ||
      `Tool '${input.tool.name}' (Danger: ${input.tool.dangerLevel}, Approval Level: ${approvalLevel}) requires authorization before execution.`;

    const req = db.createApprovalRequest({
      executionId: input.executionId,
      toolId: input.tool.id,
      toolName: input.tool.name,
      dangerLevel: input.tool.dangerLevel,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      requestedBy: input.requestedBy,
      reason,
      status: 'PENDING'
    });

    toolEventManagerService.emitEvent(
      input.tool.id,
      'Approval Requested',
      `Approval requested (${approvalLevel}) for execution ${input.executionId} (${input.tool.name})`,
      { approvalId: req.id, dangerLevel: input.tool.dangerLevel, approvalLevel },
      input.workspaceId
    );

    return req;
  }

  /**
   * Approve a pending execution request
   */
  public approve(approvalId: string, reviewerId: string = 'usr_ceo_001'): ApprovalRequest | undefined {
    const req = db.updateApprovalRequest(approvalId, 'APPROVED', reviewerId);
    if (req) {
      toolEventManagerService.emitEvent(
        req.toolId,
        'Approval Granted',
        `Approval granted for execution ${req.executionId} by ${reviewerId}`,
        { approvalId: req.id },
        req.workspaceId
      );
    }
    return req;
  }

  /**
   * Reject a pending execution request
   */
  public reject(approvalId: string, reviewerId: string = 'usr_ceo_001'): ApprovalRequest | undefined {
    const req = db.updateApprovalRequest(approvalId, 'REJECTED', reviewerId);
    if (req) {
      toolEventManagerService.emitEvent(
        req.toolId,
        'Approval Rejected',
        `Approval rejected for execution ${req.executionId} by ${reviewerId}`,
        { approvalId: req.id },
        req.workspaceId
      );
    }
    return req;
  }

  /**
   * Get approval request by ID
   */
  public getApproval(id: string): ApprovalRequest | undefined {
    return db.getApprovalRequest(id);
  }

  /**
   * List approval requests for workspace
   */
  public listApprovals(workspaceId?: string): ApprovalRequest[] {
    return db.getApprovalRequests(workspaceId);
  }
}

export const executionApprovalService = new ExecutionApprovalService();
