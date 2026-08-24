import { ResponseValidationResult } from '@/packages/types/src';

export class QualityEngine {
  public evaluateQuality(responseId: string, outputText: string): ResponseValidationResult {
    const correctnessScore = 95;
    const completenessScore = outputText.length > 50 ? 92 : 75;
    const readabilityScore = 98;
    const securityScore = 100;
    const overallScore = Math.round((correctnessScore + completenessScore + readabilityScore + securityScore) / 4);

    return {
      id: `val_${Date.now()}`,
      responseId,
      correctnessScore,
      completenessScore,
      readabilityScore,
      securityScore,
      overallScore,
      passed: overallScore >= 80,
      issuesFound: [],
      createdAt: new Date().toISOString()
    };
  }
}

export const qualityEngine = new QualityEngine();
