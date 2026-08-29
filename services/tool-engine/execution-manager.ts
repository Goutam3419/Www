import { db } from '@/lib/db/store';
import {
  ToolExecution,
  UserRole,
  ApprovalRequest,
  ExecutionMetrics,
  ExecutionHistoryItem,
  ExecutionProgressReport,
  ExecutionResult,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolRiskLevel
} from '@/packages/types/src';
import { toolRegistryService } from './tool-registry';
import { toolValidatorService } from './tool-validator';
import { toolPermissionManagerService } from './tool-permission-manager';
import { executionContextService } from './execution-context';
import { executionApprovalService } from './execution-approval';
import { executionWorkerService } from './execution-worker';
import { executionHistoryService } from './execution-history';
import { executionMetricsService } from './execution-metrics';
import { toolEventManagerService } from './tool-event-manager';
import { mcpClientEngine } from './mcp-client';
import { providerAdapterRegistry } from './provider-adapters';
import { circuitBreakerEngine } from '@/services/agent-orchestration/circuit-breaker-engine';
import { idempotencyManager } from '@/services/agent-orchestration/idempotency-manager';

export interface StartExecutionInput {
  toolId: string;
  workspaceId: string;
  projectId: string;
  userId: string;
  userRole?: UserRole;
  inputs: Record<string, unknown>;
  conversationId?: string;
  aiSessionId?: string;
  currentGoal?: string;
  maxRetries?: number;
}

export class ExecutionManagerService {
  /**
   * Start a new tool execution request
   */
  public async startExecution(input: StartExecutionInput): Promise<{
    execution: ToolExecution;
    approvalRequired: boolean;
    approvalRequest?: ApprovalRequest;
  }> {
    const tool = toolRegistryService.getTool(input.toolId);
    if (!tool) {
      throw new Error(`Tool ID '${input.toolId}' not found.`);
    }

    // 1. Permission Check
    const permCheck = toolPermissionManagerService.checkPermission(
      tool,
      input.userRole || 'ADMIN'
    );
    if (!permCheck.allowed) {
      throw new Error(permCheck.reason || 'Permission denied for tool execution.');
    }

    // 2. Create Tool Execution record in DB
    const startTime = new Date().toISOString();
    const exec = db.createToolExecution({
      toolId: tool.id,
      toolName: tool.name,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      userId: input.userId,
      status: 'Pending',
      progress: 0,
      stepMessage: 'Execution request initialized...',
      inputs: input.inputs,
      startTime,
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3
    });

    // 3. Build & Freeze Execution Context
    executionContextService.buildContext({
      executionId: exec.id,
      tool,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      userId: input.userId,
      userRole: input.userRole,
      inputs: input.inputs,
      conversationId: input.conversationId,
      aiSessionId: input.aiSessionId,
      currentGoal: input.currentGoal
    });

    // 4. Log Event
    toolEventManagerService.emitEvent(
      tool.id,
      'Execution Created',
      `Execution request ${exec.id} created for tool '${tool.name}'`,
      { executionId: exec.id, inputs: input.inputs },
      input.workspaceId
    );

    // 5. Run Worker Pipeline (asynchronously / non-blocking if approval needed, or synchronous step)
    const updatedExec = await executionWorkerService.processExecution(exec.id);

    const approvalRequired = updatedExec.status === 'Waiting';
    let approvalRequest: ApprovalRequest | undefined = undefined;
    if (updatedExec.approvalId) {
      approvalRequest = executionApprovalService.getApproval(updatedExec.approvalId);
    }

    return {
      execution: updatedExec,
      approvalRequired,
      approvalRequest
    };
  }

  /**
   * Cancel execution
   */
  public cancelExecution(executionId: string, reason: string = 'User cancelled'): ToolExecution | undefined {
    const exec = db.getToolExecution(executionId);
    if (!exec) return undefined;

    if (exec.status === 'Completed' || exec.status === 'Failed' || exec.status === 'Cancelled') {
      return exec;
    }

    const updated = db.updateToolExecution(executionId, {
      status: 'Cancelled',
      stepMessage: `Execution cancelled: ${reason}`,
      endTime: new Date().toISOString()
    });

    toolEventManagerService.emitEvent(
      exec.toolId,
      'Execution Cancelled',
      `Execution ${executionId} cancelled: ${reason}`,
      { executionId, reason },
      exec.workspaceId
    );

    return updated;
  }

  /**
   * Retry failed execution
   */
  public async retryExecution(executionId: string): Promise<ToolExecution> {
    const exec = db.getToolExecution(executionId);
    if (!exec) {
      throw new Error(`Execution ID '${executionId}' not found.`);
    }

    if (exec.retryCount >= exec.maxRetries) {
      throw new Error(`Maximum retries (${exec.maxRetries}) reached for execution ${executionId}.`);
    }

    const updated = db.updateToolExecution(executionId, {
      status: 'Retrying',
      retryCount: exec.retryCount + 1,
      progress: 0,
      stepMessage: `Retrying execution (Attempt ${exec.retryCount + 1} of ${exec.maxRetries})...`,
      error: undefined
    });

    toolEventManagerService.emitEvent(
      exec.toolId,
      'Execution Retried',
      `Retrying execution ${executionId} (Attempt ${exec.retryCount + 1})`,
      { executionId, attempt: exec.retryCount + 1 },
      exec.workspaceId
    );

    return executionWorkerService.processExecution(executionId);
  }

  /**
   * Get single execution details
   */
  public getExecution(id: string): ToolExecution | undefined {
    return db.getToolExecution(id);
  }

  /**
   * List executions
   */
  public listExecutions(workspaceId?: string, projectId?: string): ToolExecution[] {
    return db.getToolExecutions(workspaceId, projectId);
  }

  /**
   * Get progress reports for execution
   */
  public getProgressReports(executionId: string): ExecutionProgressReport[] {
    return db.getExecutionProgressReports(executionId);
  }

  /**
   * Get execution metrics
   */
  public getMetrics(executionId: string): ExecutionMetrics | undefined {
    return executionMetricsService.getMetrics(executionId);
  }

  /**
   * Get execution history
   */
  public getHistory(toolId?: string, workspaceId?: string): ExecutionHistoryItem[] {
    return executionHistoryService.getHistory(toolId, workspaceId);
  }

  /**
   * Get execution result
   */
  public getResult(executionId: string): ExecutionResult | undefined {
    return db.getExecutionResult(executionId);
  }

  /**
   * Approve and execute pending request
   */
  public async approveAndExecute(approvalId: string, reviewerId: string = 'usr_ceo_001'): Promise<ToolExecution> {
    const approval = executionApprovalService.approve(approvalId, reviewerId);
    if (!approval) {
      throw new Error(`Approval ID '${approvalId}' not found.`);
    }

    return executionWorkerService.processExecution(approval.executionId);
  }

  /**
   * Universal Tool Execution Pipeline
   * REQUEST → LOOKUP → VALIDATION → AUTH → WORKSPACE → PERMISSION → GOVERNANCE/RISK → APPROVAL → EXECUTE → NORMALIZE → AUDIT
   */
  public async executeUniversalTool(params: {
    toolId: string;
    workspaceId: string;
    userId: string;
    agentId?: string;
    input: Record<string, unknown>;
    userRole?: UserRole;
    skipApprovalCheck?: boolean;
    idempotencyKey?: string;
  }): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. TOOL LOOKUP
    const tool = toolRegistryService.getTool(params.toolId);
    if (!tool) {
      return {
        success: false,
        toolId: params.toolId,
        provider: 'unknown',
        executionId,
        error: `Tool lookup failed: Tool ID '${params.toolId}' is not registered in Universal Tool Registry.`,
        durationMs: Date.now() - startTime,
        retryCount: 0,
      };
    }

    if (!tool.enabled) {
      return {
        success: false,
        toolId: tool.id,
        provider: tool.provider,
        executionId,
        error: `Tool execution rejected: Tool '${tool.name}' is currently disabled.`,
        durationMs: Date.now() - startTime,
        retryCount: 0,
      };
    }

    // 2. CIRCUIT BREAKER CHECK
    const circuitStatus = await circuitBreakerEngine.checkCircuit(
      params.workspaceId,
      tool.provider,
      tool.id
    );
    if (!circuitStatus.allowed) {
      return {
        success: false,
        toolId: tool.id,
        provider: tool.provider,
        executionId,
        error: `Circuit Breaker Tripped [${circuitStatus.state}]: ${circuitStatus.reason || 'Provider downstream failure threshold exceeded. Fast failing.'}`,
        durationMs: Date.now() - startTime,
        retryCount: 0,
      };
    }

    // 3. IDEMPOTENCY DEDUPLICATION
    const idempotencyKey = params.idempotencyKey || (params.input?.__idempotencyKey as string);
    if (idempotencyKey) {
      const reservation = await idempotencyManager.reserveOperation({
        workspaceId: params.workspaceId,
        workflowExecutionId: executionId,
        stepExecutionId: `step_${tool.id}`,
        idempotencyKey,
        correlationId: executionId,
        operationType: 'TOOL_EXECUTION',
        targetResource: tool.id,
        requestPayload: params.input,
      });

      if (reservation.isDuplicate && reservation.record.status === 'COMPLETED' && reservation.record.result) {
        return {
          success: true,
          toolId: tool.id,
          provider: tool.provider,
          executionId,
          output: reservation.record.result,
          durationMs: 5,
          retryCount: 0,
          metadata: { idempotencyCached: true, idempotencyKey },
        };
      }
    }

    const context: ToolExecutionContext = {
      executionId,
      workspaceId: params.workspaceId,
      projectId: 'proj_default_001',
      userId: params.userId,
      userRole: params.userRole || 'ADMIN',
      agentId: params.agentId,
      toolId: tool.id,
      toolInputs: params.input,
      permissions: tool.requiredPermissions || [],
      dangerLevel: tool.dangerLevel,
      riskLevel: tool.dangerLevel as unknown as ToolRiskLevel,
      environment: process.env.NODE_ENV || 'development',
    };

    // 4. SCHEMA VALIDATION
    const valResult = toolValidatorService.validateInputs(tool, params.input);
    if (!valResult.valid) {
      return {
        success: false,
        toolId: tool.id,
        provider: tool.provider,
        executionId,
        error: `Input schema validation failed: ${valResult.errors.join('; ')}`,
        durationMs: Date.now() - startTime,
        retryCount: 0,
      };
    }

    // 5. PERMISSION CHECK
    const permCheck = toolPermissionManagerService.checkPermission(
      tool,
      params.userRole || 'ADMIN'
    );
    if (!permCheck.allowed) {
      return {
        success: false,
        toolId: tool.id,
        provider: tool.provider,
        executionId,
        error: `Permission check denied: ${permCheck.reason || 'Insufficient user role permissions.'}`,
        durationMs: Date.now() - startTime,
        retryCount: 0,
      };
    }

    // 6. GOVERNANCE & APPROVAL CHECK
    if (tool.approvalRequired && !params.skipApprovalCheck) {
      if (tool.dangerLevel === 'High' || tool.dangerLevel === 'Critical') {
        // High/Critical tools require explicit approval flag or admin override
        if (params.userRole !== 'ADMIN' && params.userRole !== 'CEO') {
          return {
            success: false,
            toolId: tool.id,
            provider: tool.provider,
            executionId,
            error: `Governance Policy: Tool '${tool.name}' has risk level '${tool.dangerLevel}' and requires administrative approval.`,
            durationMs: Date.now() - startTime,
            retryCount: 0,
            metadata: { approvalRequired: true },
          };
        }
      }
    }

    // 7. EXECUTION ROUTING
    let executionResult: ToolExecutionResult;

    try {
      if (tool.source === 'mcp') {
        executionResult = await mcpClientEngine.executeMCPTool(tool, context, params.input);
      } else if (tool.source === 'provider_adapter') {
        const adapter = providerAdapterRegistry.getAdapter(tool.provider);
        if (adapter) {
          const capability = tool.capabilities?.[0] || `${tool.provider}.execute`;
          executionResult = await adapter.executeCapability(capability, context, params.input);
        } else {
          executionResult = {
            success: true,
            toolId: tool.id,
            provider: tool.provider,
            executionId,
            output: { status: 'EXECUTED_INTERNAL_HANDLER', input: params.input },
            durationMs: Date.now() - startTime,
            retryCount: 0,
          };
        }
      } else {
        // Internal execution fallback
        executionResult = {
          success: true,
          toolId: tool.id,
          provider: tool.provider,
          executionId,
          output: { status: 'EXECUTED_INTERNAL', input: params.input },
          durationMs: Date.now() - startTime,
          retryCount: 0,
        };
      }
    } catch (err: unknown) {
      executionResult = {
        success: false,
        toolId: tool.id,
        provider: tool.provider,
        executionId,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startTime,
        retryCount: 0,
      };
    }

    // 8. CIRCUIT BREAKER & IDEMPOTENCY RECORDING
    if (executionResult.success) {
      await circuitBreakerEngine.recordSuccess(params.workspaceId, tool.provider, tool.id);
      if (idempotencyKey) {
        await idempotencyManager.completeOperation(
          params.workspaceId,
          idempotencyKey,
          (executionResult.output as Record<string, unknown>) || { success: true }
        );
      }
    } else {
      // Only trip circuit on provider failures / connection failures, not expected validation/missing credential tests
      const isTransientProviderError =
        executionResult.error?.includes('502') ||
        executionResult.error?.includes('503') ||
        executionResult.error?.includes('ECONNRESET') ||
        executionResult.error?.includes('ETIMEDOUT') ||
        executionResult.error?.includes('fetch failed');

      if (isTransientProviderError) {
        await circuitBreakerEngine.recordFailure(params.workspaceId, tool.provider, tool.id);
      }

      if (idempotencyKey) {
        await idempotencyManager.failOperation(
          params.workspaceId,
          idempotencyKey,
          executionResult.error || 'Execution failed'
        );
      }
    }

    // 9. AUDIT LOG & METRICS
    toolEventManagerService.emitEvent(
      tool.id,
      executionResult.success ? 'Execution Success' : 'Execution Failed',
      `Tool '${tool.name}' execution ${executionResult.success ? 'succeeded' : 'failed'}`,
      { executionId, input: params.input, error: executionResult.error },
      params.workspaceId
    );

    return executionResult;
  }

  /**
   * Reject pending request
   */
  public rejectApproval(approvalId: string, reviewerId: string = 'usr_ceo_001'): ApprovalRequest | undefined {
    const approval = executionApprovalService.reject(approvalId, reviewerId);
    if (approval) {
      this.cancelExecution(approval.executionId, 'User administrative approval was rejected.');
    }
    return approval;
  }
}

export const executionManagerService = new ExecutionManagerService();
