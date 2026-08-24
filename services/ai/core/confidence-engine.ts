export class ConfidenceEngine {
  public calculateConfidence(
    intent: string,
    promptLength: number,
    hasMissingInfo: boolean
  ): { level: 'High' | 'Medium' | 'Low'; score: number } {
    if (hasMissingInfo || promptLength < 5) {
      return { level: 'Low', score: 0.55 };
    }
    if (intent === 'Unknown') {
      return { level: 'Medium', score: 0.75 };
    }
    return { level: 'High', score: 0.96 };
  }
}

export const confidenceEngine = new ConfidenceEngine();
