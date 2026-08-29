import { db } from '@/lib/db/store';
import { modelManager } from './model-manager';

export class TokenManager {
  public estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  public calculateCost(modelName: string, inputTokens: number, outputTokens: number): number {
    const caps = modelManager.getModel(modelName);
    if (!caps) return 0;
    const inputCost = (inputTokens / 1000000) * caps.inputTokenCostPerM;
    const outputCost = (outputTokens / 1000000) * caps.outputTokenCostPerM;
    return Number((inputCost + outputCost).toFixed(6));
  }
}

export class UsageTracker {
  private tokenManager = new TokenManager();

  public trackUsage(
    workspaceId: string,
    projectId: string,
    sessionId: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    latencyMs: number
  ) {
    const totalTokens = inputTokens + outputTokens;
    const estimatedCostUsd = this.tokenManager.calculateCost(model, inputTokens, outputTokens);

    db.recordAIUsage({
      workspaceId,
      projectId,
      sessionId,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      latencyMs,
      estimatedCostUsd
    });
  }
}

export const tokenManager = new TokenManager();
export const usageTracker = new UsageTracker();
