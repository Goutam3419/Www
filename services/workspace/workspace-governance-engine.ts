import {
  WorkspaceGovernancePolicy,
  WorkspaceResourceType,
  ResourceQuotaLimit,
  WorkspaceGovernanceOverview,
  WorkspaceResourceUsage,
  QuotaStatus
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class WorkspaceGovernanceEngine {
  public getPolicy(workspaceId: string): WorkspaceGovernancePolicy {
    return dbStore.getWorkspaceGovernancePolicy(workspaceId);
  }

  public updatePolicy(
    workspaceId: string,
    updates: Partial<Omit<WorkspaceGovernancePolicy, 'limits'>> & {
      limits?: Partial<Record<WorkspaceResourceType, Partial<ResourceQuotaLimit>>>;
    }
  ): WorkspaceGovernancePolicy {
    const current = this.getPolicy(workspaceId);
    const mergedLimits = { ...current.limits };

    if (updates.limits) {
      for (const [resKey, customLimit] of Object.entries(updates.limits)) {
        const k = resKey as WorkspaceResourceType;
        if (mergedLimits[k] && customLimit) {
          mergedLimits[k] = {
            ...mergedLimits[k],
            ...customLimit,
          } as ResourceQuotaLimit;
        }
      }
    }

    const updated: WorkspaceGovernancePolicy = {
      ...current,
      ...updates,
      limits: mergedLimits,
      updatedAt: new Date().toISOString(),
    };
    dbStore.saveWorkspaceGovernancePolicy(updated);
    return updated;
  }

  public updateResourceLimit(
    workspaceId: string,
    resourceType: WorkspaceResourceType,
    newLimit: number,
    warningThresholdPercent?: number
  ): WorkspaceGovernancePolicy {
    const policy = this.getPolicy(workspaceId);
    const existingConfig = policy.limits[resourceType];

    const updatedLimit: ResourceQuotaLimit = {
      ...existingConfig,
      limit: Math.max(1, newLimit),
      warningThresholdPercent: warningThresholdPercent ?? existingConfig.warningThresholdPercent
    };

    policy.limits[resourceType] = updatedLimit;
    policy.updatedAt = new Date().toISOString();
    dbStore.saveWorkspaceGovernancePolicy(policy);
    return policy;
  }

  public getGovernanceOverview(workspaceId: string): WorkspaceGovernanceOverview {
    const policy = this.getPolicy(workspaceId);
    const usagesMap = dbStore.getWorkspaceUsages(workspaceId);
    const alerts = dbStore.getWorkspaceUsageAlerts(workspaceId);
    const history = dbStore.getWorkspaceUsageHistory(workspaceId);

    const resourceUsages: WorkspaceResourceUsage[] = (
      Object.keys(policy.limits) as WorkspaceResourceType[]
    ).map(resourceType => {
      const config = policy.limits[resourceType];
      const currentUsage = usagesMap[resourceType] || 0;
      const usagePercent = config.limit > 0 ? Math.round((currentUsage / config.limit) * 100) : 0;

      let status: QuotaStatus = 'NORMAL';
      if (currentUsage >= config.limit) {
        status = policy.enforceStrictBlocking ? 'BLOCKED' : 'EXCEEDED';
      } else if (usagePercent >= config.warningThresholdPercent) {
        status = 'WARNING';
      }

      return {
        resourceType,
        currentUsage,
        limit: config.limit,
        usagePercent,
        status,
        lastUpdated: new Date().toISOString()
      };
    });

    const resourcesInWarning = resourceUsages.filter(u => u.status === 'WARNING').length;
    const resourcesExceeded = resourceUsages.filter(u => u.status === 'EXCEEDED' || u.status === 'BLOCKED').length;

    let overallStatus: QuotaStatus = 'NORMAL';
    if (resourcesExceeded > 0) {
      overallStatus = policy.enforceStrictBlocking ? 'BLOCKED' : 'EXCEEDED';
    } else if (resourcesInWarning > 0) {
      overallStatus = 'WARNING';
    }

    return {
      workspaceId,
      policy,
      resourceUsages,
      quotaSummary: {
        totalResourcesTracked: resourceUsages.length,
        resourcesInWarning,
        resourcesExceeded,
        overallStatus
      },
      activeAlerts: alerts,
      recentHistory: history.slice(0, 20),
      generatedAt: new Date().toISOString()
    };
  }
}

export const workspaceGovernanceEngine = new WorkspaceGovernanceEngine();
