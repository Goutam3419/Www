import {
  ToolDefinition,
  ToolExecutionContext,
  ExecutionPolicyResult,
  PolicyDecision
} from '@/packages/types/src';
import { permissionValidatorService } from './permission-validator';
import { dangerClassifierService } from './danger-classifier';
import { executionApprovalService } from './execution-approval';

export class ExecutionPolicyEngineService {
  /**
   * Evaluates policy for a tool execution request and yields a decision: Allow, Require Approval, or Reject.
   */
  public evaluate(
    tool: ToolDefinition,
    context: Partial<ToolExecutionContext>,
    inputs: Record<string, unknown> = {}
  ): ExecutionPolicyResult {
    // 1. Permission Validation
    const permResult = permissionValidatorService.validate(tool, context);

    // 2. Danger Classification
    const dangerResult = dangerClassifierService.classify(tool, inputs);

    // 3. Approval Level Determination
    const userRole = context.userRole || 'MEMBER';
    const approvalLevel = executionApprovalService.determineApprovalLevel(tool, userRole);

    let decision: PolicyDecision = 'Allow';
    let reason = 'Tool execution policy evaluation passed successfully.';

    // If permissions fail, Reject
    if (!permResult.valid) {
      decision = 'Reject';
      reason = `Permission validation failed: ${permResult.errors.join('; ')}`;
    }
    // If approval level is Blocked, Reject
    else if (approvalLevel === 'Blocked') {
      decision = 'Reject';
      reason = `Tool '${tool.name}' is blocked from execution by platform policy.`;
    }
    // If approval level is Admin Only and user is not admin/CEO, Reject or Require Approval
    else if (approvalLevel === 'Admin Only' && userRole !== 'ADMIN' && userRole !== 'CEO') {
      decision = 'Require Approval';
      reason = `Tool '${tool.name}' requires Admin authorization for execution.`;
    }
    // If approval level is Ask User or danger classified as requiring approval, Require Approval
    else if (approvalLevel === 'Ask User' || dangerResult.requiresApproval) {
      decision = 'Require Approval';
      reason = `Tool '${tool.name}' requires user confirmation before execution (Danger Level: ${dangerResult.dangerLevel}).`;
    }

    return {
      decision,
      approvalLevel,
      dangerLevel: dangerResult.dangerLevel,
      reason,
      permissionValidation: permResult,
      dangerClassification: dangerResult
    };
  }
}

export const executionPolicyEngineService = new ExecutionPolicyEngineService();
