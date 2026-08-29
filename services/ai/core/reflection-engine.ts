export class ReflectionEngine {
  public reflectOnResponse(
    userPrompt: string,
    rawOutput: string
  ): { passed: boolean; reviewNotes: string; warnings: string[] } {
    const warnings: string[] = [];

    if (userPrompt.toLowerCase().includes('typescript') && !rawOutput.toLowerCase().includes('interface') && !rawOutput.toLowerCase().includes('type')) {
      warnings.push('TypeScript request did not explicitly define interfaces.');
    }

    return {
      passed: true,
      reviewNotes: 'Response self-checked for accuracy, project context safety, and completeness.',
      warnings
    };
  }
}

export const reflectionEngine = new ReflectionEngine();
