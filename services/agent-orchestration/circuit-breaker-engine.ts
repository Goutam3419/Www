import { CircuitBreakerRecord, CircuitBreakerState } from '@/packages/types/src';
import { getRepositorySuite } from '@/lib/db/repositories';

export interface CircuitBreakerCheckResult {
  allowed: boolean;
  state: CircuitBreakerState;
  reason?: string;
  nextRetryAllowedAt?: string;
}

export class CircuitBreakerEngine {
  private defaultFailureThreshold = 3;
  private defaultCooldownPeriodMs = 30000; // 30 seconds

  /**
   * Checks if an execution request through provider/tool is permitted by the circuit breaker.
   */
  public async checkCircuit(
    workspaceId: string,
    provider: string,
    toolId?: string
  ): Promise<CircuitBreakerCheckResult> {
    const repos = getRepositorySuite();
    const record = await repos.circuitBreakers.get(workspaceId, provider, toolId);

    if (!record || record.state === 'CLOSED') {
      return { allowed: true, state: 'CLOSED' };
    }

    const now = Date.now();
    if (record.state === 'OPEN') {
      const retryTime = record.nextRetryAllowedAt ? new Date(record.nextRetryAllowedAt).getTime() : 0;
      if (now >= retryTime) {
        // Cooldown passed: transition to HALF_OPEN to probe provider
        await repos.circuitBreakers.upsert({
          ...record,
          state: 'HALF_OPEN',
          updatedAt: new Date().toISOString(),
        });
        return {
          allowed: true,
          state: 'HALF_OPEN',
          reason: 'Cooldown elapsed. Permitting single probe request in HALF_OPEN state.',
        };
      }
      return {
        allowed: false,
        state: 'OPEN',
        reason: `Circuit breaker is OPEN for provider '${provider}'. Fast-failing to protect downstream services.`,
        nextRetryAllowedAt: record.nextRetryAllowedAt,
      };
    }

    if (record.state === 'HALF_OPEN') {
      // Allow probe
      return { allowed: true, state: 'HALF_OPEN' };
    }

    return { allowed: true, state: 'CLOSED' };
  }

  /**
   * Records a successful execution. Resets failures and closes circuit.
   */
  public async recordSuccess(
    workspaceId: string,
    provider: string,
    toolId?: string
  ): Promise<CircuitBreakerRecord> {
    const repos = getRepositorySuite();
    const existing = await repos.circuitBreakers.get(workspaceId, provider, toolId);
    const now = new Date().toISOString();

    const record = await repos.circuitBreakers.upsert({
      workspaceId,
      provider,
      toolId,
      state: 'CLOSED',
      failureCount: existing ? existing.failureCount : 0,
      successCount: (existing?.successCount || 0) + 1,
      consecutiveFailures: 0,
      lastSuccessAt: now,
      cooldownPeriodMs: existing?.cooldownPeriodMs || this.defaultCooldownPeriodMs,
      failureThreshold: existing?.failureThreshold || this.defaultFailureThreshold,
      updatedAt: now,
    });

    return record;
  }

  /**
   * Records an execution failure. Trips circuit to OPEN if threshold exceeded.
   */
  public async recordFailure(
    workspaceId: string,
    provider: string,
    toolId?: string,
    cooldownMs?: number
  ): Promise<CircuitBreakerRecord> {
    const repos = getRepositorySuite();
    const existing = await repos.circuitBreakers.get(workspaceId, provider, toolId);
    const now = new Date().toISOString();
    const threshold = existing?.failureThreshold || this.defaultFailureThreshold;
    const cooldown = cooldownMs || existing?.cooldownPeriodMs || this.defaultCooldownPeriodMs;

    const consecutiveFailures = (existing?.consecutiveFailures || 0) + 1;
    const isTripped = consecutiveFailures >= threshold || existing?.state === 'HALF_OPEN';

    const state: CircuitBreakerState = isTripped ? 'OPEN' : 'CLOSED';
    const nextRetryAllowedAt = isTripped ? new Date(Date.now() + cooldown).toISOString() : undefined;

    const record = await repos.circuitBreakers.upsert({
      workspaceId,
      provider,
      toolId,
      state,
      failureCount: (existing?.failureCount || 0) + 1,
      successCount: existing?.successCount || 0,
      consecutiveFailures,
      lastFailureAt: now,
      nextRetryAllowedAt,
      cooldownPeriodMs: cooldown,
      failureThreshold: threshold,
      updatedAt: now,
    });

    return record;
  }
}

export const circuitBreakerEngine = new CircuitBreakerEngine();
