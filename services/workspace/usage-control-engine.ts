import {
  WorkspaceResourceType,
  QuotaValidationResult
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { workspaceGovernanceEngine } from './workspace-governance-engine';

export class UsageControlEngine {
  public validateQuota(
    workspaceId: string,
    resourceType: WorkspaceResourceType,
    requestedDelta = 1
  ): QuotaValidationResult {
    const policy = workspaceGovernanceEngine.getPolicy(workspaceId);
    const usages = dbStore.getWorkspaceUsages(workspaceId);

    const config = policy.limits[resourceType];
    const currentUsage = usages[resourceType] || 0;
    const projectedUsage = currentUsage + requestedDelta;
    const limit = config ? config.limit : 1000;
    const usagePercent = Math.round((projectedUsage / limit) * 100);

    const warningThreshold = config ? config.warningThresholdPercent : 80;

    if (projectedUsage > limit) {
      const isBlocked = policy.enforceStrictBlocking;
      const status = isBlocked ? 'BLOCKED' : 'EXCEEDED';
      const reason = `Quota Exceeded: Workspace '${workspaceId}' has reached resource limit for ${resourceType} (${currentUsage}/${limit} ${config?.unit || 'units'}). Action requested delta +${requestedDelta} is ${isBlocked ? 'BLOCKED' : 'OVER LIMIT'}.`;

      // Trigger Alert if not already recorded recently
      if (policy.autoAlertOnWarning) {
        dbStore.recordWorkspaceUsageAlert({
          workspaceId,
          resourceType,
          severity: 'CRITICAL',
          usagePercent,
          message: reason
        });
      }

      return {
        allowed: !isBlocked,
        workspaceId,
        resourceType,
        currentUsage,
        limit,
        usagePercent,
        status,
        reason,
        evaluatedAt: new Date().toISOString()
      };
    }

    let status: 'NORMAL' | 'WARNING' = 'NORMAL';
    let reason = `Quota Normal: Workspace '${workspaceId}' usage for ${resourceType} is ${currentUsage}/${limit} (${usagePercent}%).`;

    if (usagePercent >= warningThreshold) {
      status = 'WARNING';
      reason = `Quota Warning: Workspace '${workspaceId}' usage for ${resourceType} reached warning threshold (${usagePercent}% >= ${warningThreshold}%).`;

      if (policy.autoAlertOnWarning) {
        dbStore.recordWorkspaceUsageAlert({
          workspaceId,
          resourceType,
          severity: 'WARNING',
          usagePercent,
          message: reason
        });
      }
    }

    return {
      allowed: true,
      workspaceId,
      resourceType,
      currentUsage,
      limit,
      usagePercent,
      status,
      reason,
      evaluatedAt: new Date().toISOString()
    };
  }

  public recordUsage(
    workspaceId: string,
    resourceType: WorkspaceResourceType,
    delta = 1,
    userId?: string,
    actionContext?: string
  ): { newUsage: number; validation: QuotaValidationResult } {
    const validation = this.validateQuota(workspaceId, resourceType, delta);

    if (!validation.allowed) {
      return {
        newUsage: dbStore.getWorkspaceUsages(workspaceId)[resourceType] || 0,
        validation
      };
    }

    const newUsage = dbStore.incrementWorkspaceUsage(
      workspaceId,
      resourceType,
      delta,
      userId,
      actionContext
    );

    return {
      newUsage,
      validation
    };
  }

  public resetUsage(workspaceId: string, resourceType?: WorkspaceResourceType): void {
    const usages = dbStore.getWorkspaceUsages(workspaceId);
    if (resourceType) {
      usages[resourceType] = 0;
    } else {
      (Object.keys(usages) as WorkspaceResourceType[]).forEach(key => {
        usages[key] = 0;
      });
    }
  }
}

export const usageControlEngine = new UsageControlEngine();
