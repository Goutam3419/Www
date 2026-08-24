import { SupportedLanguage } from '@/packages/types/src';

export interface ValidationResult {
  isValid: boolean;
  valid: boolean;
  score: number;
  syntaxErrors: string[];
  warnings: string[];
}

export class CodeValidationEngine {
  public validateCode(code: string, fileName: string, language: SupportedLanguage): ValidationResult {
    const syntaxErrors: string[] = [];
    const warnings: string[] = [];

    if (!code || code.trim().length === 0) {
      warnings.push(`File ${fileName} is empty.`);
      return { isValid: true, valid: true, score: 100, syntaxErrors, warnings };
    }

    if (language === 'TypeScript' || language === 'JavaScript') {
      // Check for unclosed braces or parentheses
      const openBraces = (code.match(/\{/g) || []).length;
      const closeBraces = (code.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        syntaxErrors.push(`Unmatched curly braces: ${openBraces} open vs ${closeBraces} close.`);
      }

      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        syntaxErrors.push(`Unmatched parentheses: ${openParens} open vs ${closeParens} close.`);
      }

      if (code.includes('console.log(')) {
        warnings.push('Console statement left in production code.');
      }
    } else if (language === 'Python') {
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        syntaxErrors.push(`Unmatched parentheses in Python file: ${openParens} vs ${closeParens}.`);
      }
    }

    const isValid = syntaxErrors.length === 0;
    const score = Math.max(0, 100 - syntaxErrors.length * 20 - warnings.length * 5);

    return {
      isValid,
      valid: isValid,
      score,
      syntaxErrors,
      warnings
    };
  }
}

export const codeValidationEngine = new CodeValidationEngine();
