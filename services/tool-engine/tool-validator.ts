import { ToolDefinition } from '@/packages/types/src';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedInputs: Record<string, unknown>;
}

export class ToolValidatorService {
  public validateInputs(tool: ToolDefinition, inputs: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const sanitizedInputs: Record<string, unknown> = { ...inputs };

    if (tool.inputsSchema && Array.isArray(tool.inputsSchema.required)) {
      for (const reqField of tool.inputsSchema.required as string[]) {
        if (inputs[reqField] === undefined || inputs[reqField] === null || inputs[reqField] === '') {
          errors.push(`Missing required field '${reqField}' for tool '${tool.name}'.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedInputs
    };
  }

  public isToolExecutable(tool: ToolDefinition): { executable: boolean; reason?: string } {
    if (!tool) {
      return { executable: false, reason: 'Tool definition is null or undefined.' };
    }
    return { executable: true };
  }
}

export const toolValidatorService = new ToolValidatorService();
