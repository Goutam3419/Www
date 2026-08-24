import {
  AutonomousErrorCategory,
  AutonomousRecoveryStrategy,
  ErrorClassification,
} from '@/packages/types/src';

export class ErrorClassificationService {
  /**
   * Autonomously classifies an error string or Error instance into structured taxonomy.
   */
  public classifyError(error: unknown): ErrorClassification {
    const rawMsg = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error || '');
    const lower = rawMsg.toLowerCase();

    // 1. Rate Limit & 429
    if (
      lower.includes('429') ||
      lower.includes('rate limit') ||
      lower.includes('too many requests') ||
      lower.includes('resource_exhausted') ||
      lower.includes('quota exceeded')
    ) {
      let retryAfter = 10;
      const retryAfterMatch = rawMsg.match(/retry[- ]after[:\s]+(\d+)/i);
      if (retryAfterMatch && retryAfterMatch[1]) {
        retryAfter = parseInt(retryAfterMatch[1], 10);
      }
      return {
        category: 'RATE_LIMIT',
        isRetryable: true,
        recommendedStrategy: 'RETRY_WITH_BACKOFF',
        reason: 'Rate limit or resource quota hit by external provider. Backoff with jitter required.',
        suggestedDelayMs: Math.max(retryAfter * 1000, 5000),
        retryAfterSeconds: retryAfter,
        confidence: 0.95,
      };
    }

    // 2. Authentication Errors
    if (
      lower.includes('401') ||
      lower.includes('unauthorized') ||
      lower.includes('invalid_api_key') ||
      lower.includes('invalid api key') ||
      lower.includes('unauthenticated') ||
      lower.includes('invalid token') ||
      lower.includes('jwt expired') ||
      lower.includes('credentials missing') ||
      lower.includes('not configured')
    ) {
      return {
        category: 'AUTHENTICATION_ERROR',
        isRetryable: false,
        recommendedStrategy: 'REQUEST_CREDENTIALS',
        reason: 'Authentication failure or missing provider credentials. Cannot be solved by automated retry.',
        suggestedDelayMs: 0,
        confidence: 0.95,
      };
    }

    // 3. Authorization Errors & Permissions
    if (
      lower.includes('403') ||
      lower.includes('forbidden') ||
      lower.includes('permission denied') ||
      lower.includes('rbac') ||
      lower.includes('insufficient scope') ||
      lower.includes('access denied')
    ) {
      return {
        category: 'AUTHORIZATION_ERROR',
        isRetryable: false,
        recommendedStrategy: 'REQUEST_HUMAN_APPROVAL',
        reason: 'Authorization or permission gate triggered. Requires human approval or scope expansion.',
        suggestedDelayMs: 0,
        confidence: 0.95,
      };
    }

    // 4. Timeouts
    if (
      lower.includes('timeout') ||
      lower.includes('etimedout') ||
      lower.includes('504') ||
      lower.includes('timed out') ||
      lower.includes('deadline exceeded')
    ) {
      return {
        category: 'TIMEOUT',
        isRetryable: true,
        recommendedStrategy: 'RETRY_WITH_BACKOFF',
        reason: 'Operation exceeded deadline. Retry with increased timeout or backoff.',
        suggestedDelayMs: 3000,
        confidence: 0.9,
      };
    }

    // 5. Network & Connection Errors
    if (
      lower.includes('econnreset') ||
      lower.includes('enotfound') ||
      lower.includes('socket hang up') ||
      lower.includes('fetch failed') ||
      lower.includes('network error') ||
      lower.includes('connection refused')
    ) {
      return {
        category: 'NETWORK_ERROR',
        isRetryable: true,
        recommendedStrategy: 'RETRY_WITH_BACKOFF',
        reason: 'Transient network failure. Eligible for automatic retry with jittered backoff.',
        suggestedDelayMs: 2000,
        confidence: 0.9,
      };
    }

    // 6. Upstream Provider Errors (500, 502, 503)
    if (
      lower.includes('502') ||
      lower.includes('503') ||
      lower.includes('bad gateway') ||
      lower.includes('service unavailable') ||
      lower.includes('upstream') ||
      lower.includes('internal server error')
    ) {
      return {
        category: 'PROVIDER_ERROR',
        isRetryable: true,
        recommendedStrategy: 'FALLBACK_TOOL',
        reason: 'Upstream provider service degradation. Try alternative provider/tool or backoff.',
        suggestedDelayMs: 4000,
        confidence: 0.88,
      };
    }

    // 7. Validation Errors
    if (
      lower.includes('400') ||
      lower.includes('bad request') ||
      lower.includes('invalid argument') ||
      lower.includes('schema mismatch') ||
      lower.includes('validation error') ||
      lower.includes('zod')
    ) {
      return {
        category: 'VALIDATION_ERROR',
        isRetryable: false,
        recommendedStrategy: 'REPLAN_WORKFLOW',
        reason: 'Input parameter or schema validation mismatch. Requires agent re-planning with correct arguments.',
        suggestedDelayMs: 0,
        confidence: 0.92,
      };
    }

    // 8. Database Errors
    if (
      lower.includes('postgres') ||
      lower.includes('database query error') ||
      lower.includes('duplicate key') ||
      lower.includes('foreign key constraint') ||
      lower.includes('pool exhausted') ||
      lower.includes('supabase')
    ) {
      const isTransientDb = lower.includes('pool exhausted') || lower.includes('connection');
      return {
        category: 'DATABASE_ERROR',
        isRetryable: isTransientDb,
        recommendedStrategy: isTransientDb ? 'RETRY_WITH_BACKOFF' : 'REPLAN_WORKFLOW',
        reason: `Database error: ${rawMsg.substring(0, 100)}`,
        suggestedDelayMs: isTransientDb ? 2500 : 0,
        confidence: 0.88,
      };
    }

    // 9. Build / Compilation Errors
    if (
      lower.includes('build error') ||
      lower.includes('syntaxerror') ||
      lower.includes('typeerror') ||
      lower.includes('compile error') ||
      lower.includes('cannot find module') ||
      lower.includes('vite') ||
      lower.includes('webpack')
    ) {
      return {
        category: 'BUILD_ERROR',
        isRetryable: false,
        recommendedStrategy: 'REPLAN_WORKFLOW',
        reason: 'Source code build or syntax error. Requires code correction/re-planning.',
        suggestedDelayMs: 0,
        confidence: 0.92,
      };
    }

    // 10. Test Assertions / Failures
    if (
      lower.includes('test failed') ||
      lower.includes('assertion') ||
      lower.includes('expect(') ||
      lower.includes('jest') ||
      lower.includes('vitest')
    ) {
      return {
        category: 'TEST_FAILURE',
        isRetryable: false,
        recommendedStrategy: 'REPLAN_WORKFLOW',
        reason: 'Automated test suite assertion failed. Requires bug diagnosis and fix.',
        suggestedDelayMs: 0,
        confidence: 0.92,
      };
    }

    // 11. Deployment Failures
    if (
      lower.includes('deployment') ||
      lower.includes('vercel deploy failed') ||
      lower.includes('container crash')
    ) {
      return {
        category: 'DEPLOYMENT_FAILURE',
        isRetryable: false,
        recommendedStrategy: 'REPLAN_WORKFLOW',
        reason: 'Deployment target returned fatal build/deploy failure.',
        suggestedDelayMs: 0,
        confidence: 0.88,
      };
    }

    // 12. General Tool Errors
    if (lower.includes('tool') || lower.includes('command failed') || lower.includes('exit code')) {
      return {
        category: 'TOOL_ERROR',
        isRetryable: false,
        recommendedStrategy: 'FALLBACK_TOOL',
        reason: 'Tool execution returned non-zero or error state.',
        suggestedDelayMs: 0,
        confidence: 0.85,
      };
    }

    // 13. Unknown Fallback
    return {
      category: 'UNKNOWN_ERROR',
      isRetryable: false,
      recommendedStrategy: 'ABORT_SAFE',
      reason: 'Unclassified error occurred. Safe abort and diagnostic report.',
      suggestedDelayMs: 0,
      confidence: 0.5,
    };
  }
}

export const errorClassificationService = new ErrorClassificationService();
