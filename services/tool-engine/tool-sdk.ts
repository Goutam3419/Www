import { UniversalToolDefinition, ToolExecution, ExecutionState } from '@/packages/types/src';
import { toolRegistryService } from './tool-registry';
import { toolValidatorService } from './tool-validator';
import { executionManagerService } from './execution-manager';
import { executionWorkerService } from './execution-worker';
import { toolEventManagerService } from './tool-event-manager';
import { toolLoggerService } from './tool-logger';

export interface IToolSDKContract {
  Register(): void;
  Validate(inputs: Record<string, unknown>): { valid: boolean; errors: string[] };
  Execute(executionId: string, inputs: Record<string, unknown>): Promise<ToolExecution>;
  Cancel(executionId: string): Promise<ToolExecution | undefined>;
  Retry(executionId: string): Promise<ToolExecution>;
  Status(executionId: string): ExecutionState | undefined;
  Logs(executionId: string): unknown[];
  Cleanup(executionId: string): Promise<void>;
}

export abstract class BaseToolSDK implements IToolSDKContract {
  public abstract definition: UniversalToolDefinition;

  public Register(): void {
    toolRegistryService.registerTool(this.definition);
  }

  public Validate(inputs: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const res = toolValidatorService.validateInputs(this.definition, inputs);
    return { valid: res.valid, errors: res.errors };
  }

  public async Execute(executionId: string, inputs: Record<string, unknown>): Promise<ToolExecution> {
    toolEventManagerService.emitEvent(
      this.definition.id,
      'EXECUTION_STARTED',
      `Tool '${this.definition.name}' execution started.`,
      { executionId, inputs }
    );
    return await executionWorkerService.processExecution(executionId);
  }

  public async Cancel(executionId: string): Promise<ToolExecution | undefined> {
    const cancelled = executionManagerService.cancelExecution(executionId);
    if (cancelled) {
      toolEventManagerService.emitEvent(
        this.definition.id,
        'EXECUTION_CANCELLED',
        `Tool '${this.definition.name}' execution cancelled.`,
        { executionId }
      );
    }
    return cancelled;
  }

  public async Retry(executionId: string): Promise<ToolExecution> {
    const retried = await executionManagerService.retryExecution(executionId);
    toolEventManagerService.emitEvent(
      this.definition.id,
      'EXECUTION_RETRIED',
      `Tool '${this.definition.name}' execution retried.`,
      { executionId }
    );
    return retried;
  }

  public Status(executionId: string): ExecutionState | undefined {
    const exec = executionManagerService.getExecution(executionId);
    return exec?.status;
  }

  public Logs(executionId: string): unknown[] {
    return toolLoggerService.getLogs().filter(l => l.executionId === executionId);
  }

  public async Cleanup(executionId: string): Promise<void> {
    toolEventManagerService.emitEvent(
      this.definition.id,
      'EXECUTION_CLEANUP',
      `Tool '${this.definition.name}' context cleaned up.`,
      { executionId }
    );
  }
}
