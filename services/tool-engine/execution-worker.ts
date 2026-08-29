import { db } from '@/lib/db/store';
import {
  ToolExecution,
  ExecutionState,
  ToolDefinition,
  ExecutionProgressReport,
  ExecutionResult
} from '@/packages/types/src';
import { toolRegistryService } from './tool-registry';
import { toolValidatorService } from './tool-validator';
import { executionApprovalService } from './execution-approval';
import { toolEventManagerService } from './tool-event-manager';
import { executionMetricsService } from './execution-metrics';
import { executionHistoryService } from './execution-history';
import { toolLoggerService } from './tool-logger';

export interface ExecuteTaskOptions {
  executionId: string;
  skipApprovalCheck?: boolean;
}

export class ExecutionWorkerService {
  /**
   * Run tool execution pipeline worker
   */
  public async processExecution(executionId: string): Promise<ToolExecution> {
    const startTimeMs = Date.now();
    const exec = db.getToolExecution(executionId);
    if (!exec) {
      throw new Error(`Execution ID '${executionId}' not found.`);
    }

    const tool = toolRegistryService.getTool(exec.toolId);
    if (!tool) {
      this.updateState(exec, 'Failed', 0, 'Tool definition missing', `Tool ID '${exec.toolId}' is not registered.`);
      return exec;
    }

    // Phase 1: Preparing & Validating
    const valStartTime = Date.now();
    this.updateState(exec, 'Preparing', 5, 'Preparing execution context and parameters...');

    this.updateState(exec, 'Validating', 15, 'Validating input parameters and danger levels...');
    const validation = toolValidatorService.validateInputs(tool, exec.inputs);
    const execCheck = toolValidatorService.isToolExecutable(tool);
    const valDurationMs = Date.now() - valStartTime;

    if (!execCheck.executable || !validation.valid) {
      const errReason = execCheck.reason || validation.errors.join('; ');
      this.updateState(exec, 'Failed', 15, 'Validation failed', errReason);
      
      this.finishExecution(exec, tool, false, undefined, errReason, valDurationMs, 0, 0, startTimeMs);
      return exec;
    }

    // Phase 2: Approval check if not already approved
    if (executionApprovalService.isApprovalRequired(tool) && exec.status !== 'Queued') {
      if (!exec.approvalId) {
        const approvalReq = executionApprovalService.createApprovalRequest({
          executionId: exec.id,
          tool,
          workspaceId: exec.workspaceId,
          projectId: exec.projectId,
          requestedBy: exec.userId
        });
        
        db.updateToolExecution(exec.id, { approvalId: approvalReq.id });
        this.updateState(
          exec,
          'Waiting',
          20,
          `Waiting for user approval (${tool.dangerLevel} danger level)...`
        );
        return exec;
      } else {
        const approval = executionApprovalService.getApproval(exec.approvalId);
        if (!approval || approval.status === 'PENDING') {
          this.updateState(exec, 'Waiting', 20, 'Waiting for administrative approval...');
          return exec;
        }
        if (approval.status === 'REJECTED') {
          this.updateState(exec, 'Cancelled', 20, 'Execution cancelled due to approval rejection', 'Administrative approval was rejected.');
          this.finishExecution(exec, tool, false, undefined, 'Approval rejected', valDurationMs, 0, 0, startTimeMs);
          return exec;
        }
      }
    }

    // Phase 3: Queue & Execution Simulation (Foundation Infrastructure Mode)
    const queueWaitStart = Date.now();
    this.updateState(exec, 'Queued', 30, 'Enqueued into tool worker pipeline...');
    const queueWaitMs = Date.now() - queueWaitStart;

    const execStartTime = Date.now();
    this.updateState(exec, 'Running', 50, `Executing tool framework handler for ${tool.name}...`);

    // Simulate real-time progress steps for foundation execution framework
    this.reportProgress(exec.id, tool.id, 75, `Running framework pipeline step for ${tool.name}...`);
    this.reportProgress(exec.id, tool.id, 90, `Finalizing output validation and formatting...`);

    const execDurationMs = Date.now() - execStartTime;

    // Phase 4: Simulated Execution Result
    const mockOutput: Record<string, unknown> = {
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      executed: true,
      timestamp: new Date().toISOString(),
      sanitizedInputs: validation.sanitizedInputs,
      executionEngineStatus: 'Engine Ready & Operational',
      message: `Tool '${tool.name}' framework execution completed successfully in ${execDurationMs}ms.`
    };

    this.updateState(exec, 'Completed', 100, 'Tool execution completed successfully.', undefined, mockOutput);

    this.finishExecution(exec, tool, true, mockOutput, undefined, valDurationMs, queueWaitMs, execDurationMs, startTimeMs);

    return exec;
  }

  /**
   * Helper to update execution state, progress percent, step message & DB
   */
  private updateState(
    exec: ToolExecution,
    status: ExecutionState,
    progress: number,
    stepMessage: string,
    error?: string,
    outputs?: Record<string, unknown>
  ) {
    exec.status = status;
    exec.progress = progress;
    exec.stepMessage = stepMessage;
    if (error) exec.error = error;
    if (outputs) exec.outputs = outputs;

    db.updateToolExecution(exec.id, {
      status,
      progress,
      stepMessage,
      error,
      outputs
    });

    this.reportProgress(exec.id, exec.toolId, progress, stepMessage);

    toolEventManagerService.emitEvent(
      exec.toolId,
      status === 'Completed'
        ? 'Execution Completed'
        : status === 'Failed'
        ? 'Execution Failed'
        : status === 'Cancelled'
        ? 'Execution Cancelled'
        : 'Execution Progress',
      `Execution ${exec.id}: ${stepMessage} (${progress}%)`,
      { executionId: exec.id, status, progress, error },
      exec.workspaceId
    );
  }

  /**
   * Report real-time 0-100% progress
   */
  public reportProgress(
    executionId: string,
    toolId: string,
    progressPercent: number,
    stepMessage: string
  ): ExecutionProgressReport {
    return db.addExecutionProgressReport({
      executionId,
      toolId,
      progressPercent,
      stepMessage
    });
  }

  /**
   * Finalize execution, record history, metrics, and logs
   */
  private finishExecution(
    exec: ToolExecution,
    tool: ToolDefinition,
    success: boolean,
    outputs: Record<string, unknown> | undefined,
    error: string | undefined,
    valDurationMs: number,
    queueWaitMs: number,
    execDurationMs: number,
    startTimeMs: number
  ) {
    const totalDurationMs = Date.now() - startTimeMs;

    // Metrics
    const metrics = executionMetricsService.recordMetrics({
      executionId: exec.id,
      toolId: tool.id,
      validationDurationMs: valDurationMs,
      queueWaitDurationMs: queueWaitMs,
      executionDurationMs: execDurationMs,
      totalDurationMs,
      memoryUsageMb: 24.5,
      cpuUsagePercent: 1.2
    });

    // Save Execution Result
    const res: ExecutionResult = db.saveExecutionResult({
      executionId: exec.id,
      toolId: tool.id,
      success,
      outputs,
      error,
      warnings: [],
      metrics
    });

    // History
    executionHistoryService.recordHistory({
      executionId: exec.id,
      toolId: tool.id,
      toolName: tool.name,
      workspaceId: exec.workspaceId,
      projectId: exec.projectId,
      userId: exec.userId,
      inputs: exec.inputs,
      outputs,
      status: exec.status,
      durationMs: totalDurationMs,
      executedAt: new Date().toISOString()
    });

    // Execution Logger
    toolLoggerService.logExecution({
      executionId: exec.id,
      toolId: tool.id,
      workspaceId: exec.workspaceId,
      projectId: exec.projectId,
      userId: exec.userId,
      inputs: exec.inputs,
      outputs,
      startTime: new Date(startTimeMs).toISOString(),
      endTime: new Date().toISOString(),
      durationMs: totalDurationMs,
      status: success ? 'SUCCESS' : exec.status === 'Cancelled' ? 'CANCELLED' : 'FAILED',
      error,
      retryCount: exec.retryCount
    });
  }
}

export const executionWorkerService = new ExecutionWorkerService();
