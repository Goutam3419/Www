import { IdempotencyRecord, IdempotencyStatus } from '@/packages/types/src';
import { sanitizeSecretsInValue } from './workflow-state-manager';
import { getRepositorySuite } from '@/lib/db/repositories';
import crypto from 'crypto';

export interface ReserveOperationOptions {
  workspaceId: string;
  workflowExecutionId: string;
  stepExecutionId: string;
  idempotencyKey: string;
  correlationId: string;
  operationType: IdempotencyRecord['operationType'];
  targetResource?: string;
  requestPayload: Record<string, unknown>;
}

export class IdempotencyManager {
  /**
   * Generates a deterministic hash of the request payload.
   */
  public hashPayload(payload: Record<string, unknown>): string {
    const sorted = Object.keys(payload || {})
      .sort()
      .reduce((acc, k) => {
        acc[k] = payload[k];
        return acc;
      }, {} as Record<string, unknown>);
    return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
  }

  /**
   * Checks if an operation is already completed or in progress.
   */
  public async getExistingOperation(workspaceId: string, idempotencyKey: string): Promise<IdempotencyRecord | null> {
    const repos = getRepositorySuite();
    const existing = await repos.idempotency.get(workspaceId, idempotencyKey);
    if (!existing) return null;
    if (existing.workspaceId !== workspaceId) {
      throw new Error(`Workspace isolation violation: Idempotency key belongs to workspace '${existing.workspaceId}'`);
    }
    return existing;
  }

  /**
   * Reserves an idempotency key before performing side effects.
   * If already completed, returns existing record.
   */
  public async reserveOperation(options: ReserveOperationOptions): Promise<{
    isDuplicate: boolean;
    record: IdempotencyRecord;
  }> {
    const repos = getRepositorySuite();
    const existing = await this.getExistingOperation(options.workspaceId, options.idempotencyKey);

    if (existing) {
      if (existing.status === 'COMPLETED') {
        return { isDuplicate: true, record: existing };
      }
      // If IN_PROGRESS but older than 5 minutes, allow retrying/re-reserving
      const ageMs = Date.now() - new Date(existing.createdAt).getTime();
      if (existing.status === 'IN_PROGRESS' && ageMs < 300000) {
        return { isDuplicate: true, record: existing };
      }
    }

    const payloadHash = this.hashPayload(options.requestPayload);
    const created = await repos.idempotency.create({
      workspaceId: options.workspaceId,
      workflowExecutionId: options.workflowExecutionId,
      stepExecutionId: options.stepExecutionId,
      idempotencyKey: options.idempotencyKey,
      correlationId: options.correlationId,
      operationType: options.operationType,
      targetResource: options.targetResource,
      requestPayloadHash: payloadHash,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
    });

    return { isDuplicate: false, record: created };
  }

  /**
   * Records successful completion of an idempotent side effect.
   */
  public async completeOperation(
    workspaceId: string,
    idempotencyKey: string,
    result: Record<string, unknown>
  ): Promise<IdempotencyRecord | null> {
    const repos = getRepositorySuite();
    const sanitizedResult = sanitizeSecretsInValue(result) as Record<string, unknown>;
    return repos.idempotency.update(workspaceId, idempotencyKey, {
      status: 'COMPLETED',
      result: sanitizedResult,
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Records failure of an idempotent operation.
   */
  public async failOperation(
    workspaceId: string,
    idempotencyKey: string,
    error: string
  ): Promise<IdempotencyRecord | null> {
    const repos = getRepositorySuite();
    const sanitizedError = sanitizeSecretsInValue(error) as string;
    return repos.idempotency.update(workspaceId, idempotencyKey, {
      status: 'FAILED',
      error: sanitizedError,
      completedAt: new Date().toISOString(),
    });
  }
}

export const idempotencyManager = new IdempotencyManager();
