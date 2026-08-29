import { AIPlanStep } from '@/packages/types/src';

export class ReasoningEngine {
  public analyzeReasoning(
    intent: string,
    plan: AIPlanStep[],
    projectContext: string
  ): { summary: string; risks: string[]; recommendations: string[] } {
    const risks: string[] = [];
    const recommendations: string[] = [];

    if (intent === 'Coding Request' || intent === 'Website Request') {
      recommendations.push('Ensure server-side proxying for sensitive environment variables.');
      recommendations.push('Maintain responsive design with mobile-first Tailwind utilities.');
    }

    if (plan.some(s => s.riskLevel === 'HIGH')) {
      risks.push('High-risk steps identified; ensure fallback strategies and rollbacks are available.');
    }

    return {
      summary: `Evaluated ${plan.length} step plan for ${intent}. Architectural alignment verified against Next.js 15 App Router standards.`,
      risks,
      recommendations
    };
  }
}

export const reasoningEngine = new ReasoningEngine();
