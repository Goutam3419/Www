import { MultiAgentOrchestrationMasterReport } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { agentRegistryManagerService } from './agent-registry';
import { agentWorkspaceManagerService } from './agent-workspace-manager';
import { agentCapabilityManagerService } from './agent-capability-manager';

export class MultiAgentOrchestrationService {
  public getMasterReport(workspaceId: string = 'ws_enterprise_01'): MultiAgentOrchestrationMasterReport {
    const existing = dbStore.getLatestMultiAgentOrchestrationMasterReport(workspaceId);
    if (existing) return existing;

    const registryReport = agentRegistryManagerService.getRegistryReport(workspaceId);
    const workspaceReport = agentWorkspaceManagerService.getWorkspaceReport(workspaceId);
    const capabilityReport = agentCapabilityManagerService.getCapabilityReport(workspaceId);

    const report: MultiAgentOrchestrationMasterReport = {
      id: `maomr_${Date.now()}`,
      workspaceId,
      registryReport,
      workspaceReport,
      capabilityReport,
      overallStatus: 'OPERATIONAL',
      generatedAt: new Date().toISOString()
    };

    dbStore.saveMultiAgentOrchestrationMasterReport(report);
    return report;
  }
}

export const multiAgentOrchestrationService = new MultiAgentOrchestrationService();
