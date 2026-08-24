import { WorkflowRetryPolicy, WorkflowStep } from '@/packages/types/src';
import { errorClassificationService } from './error-classification-service';

export interface RetryEvaluationResult {
  shouldRetry: boolean;
  attempt: number;
  maxAttempts: number;
  backoffMs: number;
  reason: string;
  category?: string;
  isPermanentFailure?: boolean;
}

export class RetryPolicyEngine {
  public static DEFAULT_POLICY: WorkflowRetryPolicy = {
    maxAttempts: 3,
    backoff: 'exponential',
    retryableErrors: ['RATE_LIMIT', 'TIMEOUT', 'NETWORK_ERROR', 'SERVICE_UNAVAILABLE', 'TRANSIENT_FAILURE', 'PROVIDER_ERROR', 'DATABASE_ERROR'],
  };

  /**
   * Evaluates if a failed step execution should be retried based on retry policy and error classification.
   */
  public static evaluateRetry(
    step: WorkflowStep,
    attempt: number,
    error: Error | string,
    customPolicy?: WorkflowRetryPolicy
  ): RetryEvaluationResult {
    const policy = step.retryPolicy || customPolicy || this.DEFAULT_POLICY;
    const errorMsg = typeof error === 'string' ? error : error.message || '';
    const classification = errorClassificationService.classifyError(error);

    if (attempt >= policy.maxAttempts) {
      return {
        shouldRetry: false,
        attempt,
        maxAttempts: policy.maxAttempts,
        backoffMs: 0,
        reason: `Exceeded max attempts limit (${attempt}/${policy.maxAttempts})`,
        category: classification.category,
        isPermanentFailure: true,
      };
    }

    // Permanent errors (AUTH, PERMISSIONS, VALIDATION, NON-TRANSIENT) should NEVER retry blindly
    if (!classification.isRetryable) {
      return {
        shouldRetry: false,
        attempt,
        maxAttempts: policy.maxAttempts,
        backoffMs: 0,
        reason: `Permanent non-retryable error [${classification.category}]: ${classification.reason}`,
        category: classification.category,
        isPermanentFailure: true,
      };
    }

    // Check if error matches retryable patterns or category
    const isRetryable =
      policy.retryableErrors.includes('*') ||
      policy.retryableErrors.includes(classification.category) ||
      policy.retryableErrors.some((pattern) =>
        errorMsg.toUpperCase().includes(pattern.toUpperCase())
      );

    if (!isRetryable) {
      return {
        shouldRetry: false,
        attempt,
        maxAttempts: policy.maxAttempts,
        backoffMs: 0,
        reason: `Error '${errorMsg}' is non-retryable per step retry policy`,
        category: classification.category,
        isPermanentFailure: true,
      };
    }

    // Calculate backoff delay with jitter
    const baseDelayMs = classification.suggestedDelayMs > 0 ? classification.suggestedDelayMs : 1000;
    let backoffMs = baseDelayMs;

    if (policy.backoff === 'linear') {
      backoffMs = baseDelayMs * attempt;
    } else if (policy.backoff === 'exponential') {
      backoffMs = baseDelayMs * Math.pow(2, attempt - 1);
    }

    // Cap backoff at 60 seconds and add up to 20% random jitter to avoid thundering herd
    const jitter = Math.floor(Math.random() * (backoffMs * 0.2));
    const finalBackoff = Math.min(backoffMs + jitter, 60000);

    return {
      shouldRetry: true,
      attempt,
      maxAttempts: policy.maxAttempts,
      backoffMs: finalBackoff,
      reason: `Error [${classification.category}] is retryable (attempt ${attempt + 1}/${policy.maxAttempts}). Strategy: ${classification.recommendedStrategy}`,
      category: classification.category,
      isPermanentFailure: false,
    };
  }
}

