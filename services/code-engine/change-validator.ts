import { CodeValidationIssue, SupportedLanguage } from '@/packages/types/src';
import { codeValidationEngine } from './code-validator';

export class ChangeValidatorService {
  public validateEdit(params: {
    filePath: string;
    content: string;
    fileType?: string;
    workspaceId: string;
    projectId: string;
  }): { valid: boolean; issues: CodeValidationIssue[] } {
    const issues: CodeValidationIssue[] = [];

    // 1. Basic path validation
    if (!params.filePath) {
      issues.push({
        id: `val_path_${Date.now()}`,
        type: 'syntax',
        title: 'Empty File Path',
        description: 'File path cannot be empty.',
        severity: 'error'
      });
    }

    // 2. Code syntax validation using existing codeValidationEngine
    const ext = params.filePath.split('.').pop() || '';
    const language = ext === 'py' ? 'Python' : ext === 'dart' ? 'Dart' : 'TypeScript';
    const validation = codeValidationEngine.validateCode(params.content, params.filePath, language);

    if (!validation.isValid) {
      validation.syntaxErrors.forEach(err => {
        issues.push({
          id: `val_syn_${Date.now()}_${Math.random()}`,
          type: 'syntax',
          title: 'Syntax Validation Error',
          description: err,
          severity: 'error'
        });
      });
    }

    // 3. Prevent dangerous destructive operations or malicious injections
    if (params.content.includes('process.exit(') || params.content.includes('rm -rf /')) {
      issues.push({
        id: `val_sec_${Date.now()}`,
        type: 'security',
        title: 'Forbidden Script Injections',
        description: 'Dangerous execution patterns detected.',
        severity: 'error'
      });
    }

    const hasErrors = issues.some(i => i.severity === 'error');
    return {
      valid: !hasErrors,
      issues
    };
  }

  public validateCode(content: string, fileName: string, language: SupportedLanguage) {
    return codeValidationEngine.validateCode(content, fileName, language);
  }
}

export const changeValidatorService = new ChangeValidatorService();
