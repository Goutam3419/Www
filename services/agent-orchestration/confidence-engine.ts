import {
  ConfidenceAssessment,
  ConfidenceFactors,
  AgentRole,
} from '@/packages/types/src';
import { agentPerformanceMemory } from './agent-performance-memory';
import { toolReliabilityEngine } from './tool-reliability-engine';

export interface ConfidenceInput {
  workspaceId: string;
  agentRole?: AgentRole;
  agentId?: string;
  toolIds?: string[];
  experienceCount?: number;
  experienceAvgScore?: number;
  requirementsCount?: number;
  hasMissingRequirements?: boolean;
  predictedRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reviewAgreements?: number;
  totalReviewers?: number;
  isHighImpact?: boolean;
}

export class ConfidenceEngine {
  /**
   * Deterministically calculates a multi-factor confidence score for decisions and workflows.
   */
  public async calculateConfidence(input: ConfidenceInput): Promise<ConfidenceAssessment> {
    const {
      workspaceId,
      agentId,
      toolIds = [],
      experienceCount = 0,
      experienceAvgScore = 0.8,
      requirementsCount = 3,
      hasMissingRequirements = false,
      predictedRisk = 'LOW',
      reviewAgreements = 1,
      totalReviewers = 1,
      isHighImpact = false,
    } = input;

    // 1. Experience Similarity Factor (0.0 to 1.0)
    let experienceSimilarity = 0.75;
    if (experienceCount > 0) {
      // Scale based on evidence volume & average score
      const volumeBonus = Math.min(experienceCount / 5, 0.2);
      experienceSimilarity = Math.min(1.0, experienceAvgScore * 0.8 + volumeBonus);
    }

    // 2. Historical Success Rate / Agent Performance Factor
    let agentPerformance = experienceCount > 0 ? (experienceAvgScore || 0.85) : 0.6;
    let historicalSuccessRate = experienceAvgScore !== undefined ? experienceAvgScore : (experienceCount > 0 ? 0.85 : 0.6);
    if (agentId) {
      try {
        const perf = await agentPerformanceMemory.getAgentScore(agentId, workspaceId);
        agentPerformance = perf;
        historicalSuccessRate = perf;
      } catch {
        agentPerformance = 0.7;
        historicalSuccessRate = 0.7;
      }
    }

    // 3. Tool Reliability Factor
    let toolReliability = 0.85;
    if (toolIds.length > 0) {
      try {
        let totalToolScore = 0;
        for (const toolId of toolIds) {
          const score = await toolReliabilityEngine.getToolHealthScore(workspaceId, toolId);
          totalToolScore += score;
        }
        toolReliability = totalToolScore / toolIds.length;
      } catch {
        toolReliability = 0.75;
      }
    } else if (predictedRisk === 'CRITICAL' || predictedRisk === 'HIGH') {
      toolReliability = 0.5;
    }

    // 4. Strategy Agreement Factor
    const strategyAgreement = totalReviewers > 0 ? Math.min(1.0, reviewAgreements / totalReviewers) : 0.75;

    // 5. Failure Prediction Certainty (Inverted risk score)
    let failurePredictionCertainty = 0.9;
    if (predictedRisk === 'CRITICAL') {
      failurePredictionCertainty = 0.2;
    } else if (predictedRisk === 'HIGH') {
      failurePredictionCertainty = 0.45;
    } else if (predictedRisk === 'MEDIUM') {
      failurePredictionCertainty = 0.7;
    } else {
      failurePredictionCertainty = 0.95;
    }

    // 6. Data Completeness Factor
    let dataCompleteness = 0.9;
    if (hasMissingRequirements) {
      dataCompleteness = 0.4;
    } else if (requirementsCount < 2) {
      dataCompleteness = 0.65;
    } else {
      dataCompleteness = Math.min(1.0, 0.7 + (requirementsCount * 0.05));
    }

    const confidenceFactors: ConfidenceFactors = {
      experienceSimilarity: Math.round(experienceSimilarity * 100) / 100,
      historicalSuccessRate: Math.round(historicalSuccessRate * 100) / 100,
      toolReliability: Math.round(toolReliability * 100) / 100,
      agentPerformance: Math.round(agentPerformance * 100) / 100,
      strategyAgreement: Math.round(strategyAgreement * 100) / 100,
      failurePredictionCertainty: Math.round(failurePredictionCertainty * 100) / 100,
      dataCompleteness: Math.round(dataCompleteness * 100) / 100,
    };

    // Deterministic Weighted Sum
    const weights = {
      experience: 0.20,
      successRate: 0.15,
      tool: 0.15,
      performance: 0.15,
      agreement: 0.10,
      prediction: 0.15,
      completeness: 0.10,
    };

    const weightedScore =
      confidenceFactors.experienceSimilarity * weights.experience +
      confidenceFactors.historicalSuccessRate * weights.successRate +
      confidenceFactors.toolReliability * weights.tool +
      confidenceFactors.agentPerformance * weights.performance +
      confidenceFactors.strategyAgreement * weights.agreement +
      confidenceFactors.failurePredictionCertainty * weights.prediction +
      confidenceFactors.dataCompleteness * weights.completeness;

    const overallConfidence = Math.round(Math.max(0.05, Math.min(0.99, weightedScore)) * 100) / 100;

    // Determine Risk Level based on confidence and inverted risk
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (overallConfidence < 0.45 || predictedRisk === 'CRITICAL') {
      riskLevel = 'CRITICAL';
    } else if (overallConfidence < 0.65 || predictedRisk === 'HIGH') {
      riskLevel = 'HIGH';
    } else if (overallConfidence < 0.80 || predictedRisk === 'MEDIUM') {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    const evidenceCount = experienceCount + toolIds.length + (agentId ? 1 : 0) + requirementsCount;
    const requiresAdditionalReview = overallConfidence < 0.70 || riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
    const requiresHumanApproval = (riskLevel === 'CRITICAL' || (isHighImpact && overallConfidence < 0.60));

    const explanation = `Confidence assessed at ${Math.round(overallConfidence * 100)}% based on ${evidenceCount} evidence indicators (Tool Health: ${Math.round(confidenceFactors.toolReliability * 100)}%, Agent Reliability: ${Math.round(confidenceFactors.agentPerformance * 100)}%, Experience Match: ${Math.round(confidenceFactors.experienceSimilarity * 100)}%). Risk level evaluated as [${riskLevel}].`;

    return {
      overallConfidence,
      riskLevel,
      evidenceCount,
      confidenceFactors,
      requiresAdditionalReview,
      requiresHumanApproval,
      explanation,
    };
  }
}

export const confidenceEngine = new ConfidenceEngine();
