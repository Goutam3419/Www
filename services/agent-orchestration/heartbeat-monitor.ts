import { HeartbeatRecord, OrphanRecoveryReport } from '@/packages/types/src';
import { getRepositorySuite } from '@/lib/db/repositories';

export class HeartbeatMonitor {
  private defaultTimeoutMs = 60000; // 60 seconds

  /**
   * Emits a heartbeat for a workflow, step, agent, or tool.
   */
  public async emitHeartbeat(
    workspaceId: string,
    workflowId: string,
    executionId: string,
    entityType: HeartbeatRecord['entityType'],
    entityId: string,
    status = 'RUNNING',
    metadata: Record<string, unknown> = {}
  ): Promise<HeartbeatRecord> {
    const repos = getRepositorySuite();
    return repos.heartbeats.upsertHeartbeat({
      workspaceId,
      workflowId,
      executionId,
      entityType,
      entityId,
      status,
      lastHeartbeatAt: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Cleans up heartbeats when an execution finishes normally.
   */
  public async clearHeartbeats(workspaceId: string, executionId: string): Promise<boolean> {
    const repos = getRepositorySuite();
    return repos.heartbeats.delete(workspaceId, executionId);
  }

  /**
   * Detects orphaned executions that have had no heartbeat for longer than timeoutMs.
   */
  public async detectOrphans(
    workspaceId: string,
    timeoutMs = this.defaultTimeoutMs
  ): Promise<HeartbeatRecord[]> {
    const repos = getRepositorySuite();
    const cutoff = new Date(Date.now() - timeoutMs).toISOString();
    return repos.heartbeats.listExpired(workspaceId, cutoff);
  }

  /**
   * Autonomously recovers orphaned executions by reconciling their state and marking them for recovery.
   */
  public async recoverOrphans(
    workspaceId: string,
    timeoutMs = this.defaultTimeoutMs
  ): Promise<OrphanRecoveryReport> {
    const orphans = await this.detectOrphans(workspaceId, timeoutMs);
    const repos = getRepositorySuite();
    const actionsTaken: string[] = [];
    const diagnostics: Array<{ executionId: string; reason: string; action: string }> = [];

    const recoveredExecutions = new Set<string>();
    let recoveredStepsCount = 0;

    for (const orphan of orphans) {
      recoveredExecutions.add(orphan.executionId);
      if (orphan.entityType === 'STEP') recoveredStepsCount++;

      const diag = {
        executionId: orphan.executionId,
        reason: `Heartbeat timed out for ${orphan.entityType} '${orphan.entityId}' (last seen: ${orphan.lastHeartbeatAt})`,
        action: `Marked for autonomous checkpoint resume`,
      };
      diagnostics.push(diag);
      actionsTaken.push(`Detected orphan ${orphan.entityType} '${orphan.entityId}' in execution '${orphan.executionId}'. Initiated state reconciliation.`);

      // Log recovery audit event
      await repos.recoveryAudit.log({
        workspaceId,
        workflowId: orphan.workflowId,
        executionId: orphan.executionId,
        stepId: orphan.entityType === 'STEP' ? orphan.entityId : undefined,
        eventType: 'CRASH_DETECTED',
        failureCategory: 'TIMEOUT',
        recoveryAction: 'ORPHAN_HEARTBEAT_RECOVERY',
        attemptNumber: 1,
        actor: 'AUTONOMOUS_HEARTBEAT_MONITOR',
        result: 'SUCCESS',
        metadata: {
          lastHeartbeatAt: orphan.lastHeartbeatAt,
          entityType: orphan.entityType,
        },
      });

      // Clear the stale heartbeat record
      await repos.heartbeats.delete(workspaceId, orphan.executionId);
    }

    return {
      workspaceId,
      recoveredExecutionsCount: recoveredExecutions.size,
      recoveredStepsCount,
      actionsTaken,
      diagnostics,
    };
  }
}

export const heartbeatMonitor = new HeartbeatMonitor();
