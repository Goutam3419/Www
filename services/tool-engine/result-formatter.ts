import { ExecutionResult, FormattedExecutionResult, ToolDefinition } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class ExecutionResultFormatterService {
  /**
   * Formats a raw ExecutionResult into a standardized FormattedExecutionResult.
   */
  public format(
    executionId: string,
    tool: ToolDefinition,
    result: ExecutionResult,
    durationMs: number = 0,
    affectedFiles: string[] = [],
    affectedModules: string[] = []
  ): FormattedExecutionResult {
    const warnings: string[] = result.warnings || [];

    if (durationMs > 5000) {
      warnings.push(`Execution duration (${durationMs}ms) exceeded standard response threshold.`);
    }

    const toolCategory = tool.category || 'Utility';
    if (!affectedModules.includes(toolCategory)) {
      affectedModules.push(toolCategory);
    }

    const summary = result.success
      ? `Successfully executed '${tool.name}' in ${durationMs}ms. ${affectedFiles.length} file(s) affected.`
      : `Execution of '${tool.name}' failed: ${result.error || 'Unknown execution error'}.`;

    const formatted: FormattedExecutionResult = {
      executionId,
      toolId: tool.id,
      toolName: tool.name,
      success: result.success,
      outputs: result.outputs,
      error: result.error,
      warnings,
      executionTimeMs: durationMs,
      affectedModules,
      affectedFiles,
      summary,
      formattedAt: new Date().toISOString()
    };

    db.saveFormattedResult(formatted);
    return formatted;
  }

  public getFormattedResult(executionId: string): FormattedExecutionResult | undefined {
    return db.getFormattedResult(executionId);
  }
}

export const executionResultFormatterService = new ExecutionResultFormatterService();
