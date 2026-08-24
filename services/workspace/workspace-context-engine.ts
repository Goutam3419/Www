import { ActiveWorkspaceContext, WorkspaceRole } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { workspaceManager } from './workspace-manager';
import { workspaceMembershipEngine } from './workspace-membership-engine';

export class WorkspaceContextEngine {
  public getActiveContext(userId: string = 'usr_ceo_001'): ActiveWorkspaceContext {
    const ctx = dbStore.getActiveWorkspaceContext(userId);
    const membership = workspaceMembershipEngine.validateMembership(ctx.workspaceId, userId);

    if (membership.isValid && membership.role) {
      ctx.activeUser.role = membership.role;
    }

    return ctx;
  }

  public switchWorkspace(
    userId: string = 'usr_ceo_001',
    targetWorkspaceId: string
  ): ActiveWorkspaceContext {
    const ws = workspaceManager.getWorkspace(targetWorkspaceId);
    if (!ws || ws.status !== 'ACTIVE') {
      throw new Error(`Workspace ${targetWorkspaceId} is suspended, archived, or does not exist.`);
    }

    const membership = workspaceMembershipEngine.validateMembership(targetWorkspaceId, userId);
    const role: WorkspaceRole = membership.role || 'OWNER';

    const permissions = this.getPermissionsForRole(role);

    const newCtx: ActiveWorkspaceContext = {
      workspaceId: targetWorkspaceId,
      activeProjectId: `proj_${targetWorkspaceId}`,
      activeUser: {
        userId,
        email: 'ceo@aistudio.io',
        name: 'Goutam (AI CEO Owner)',
        role
      },
      isIsolated: true,
      permissions
    };

    dbStore.setActiveWorkspaceContext(userId, newCtx);
    return newCtx;
  }

  public validateContext(workspaceId: string, userId: string = 'usr_ceo_001'): boolean {
    const currentCtx = this.getActiveContext(userId);
    if (currentCtx.workspaceId.toLowerCase() !== workspaceId.toLowerCase()) {
      return false;
    }
    return currentCtx.isIsolated;
  }

  private getPermissionsForRole(role: WorkspaceRole): string[] {
    switch (role) {
      case 'OWNER':
        return ['ALL_PERMISSIONS', 'MANAGE_WORKSPACE', 'MANAGE_MEMBERS', 'EXECUTE_AGENTS', 'DEPLOY_APPS', 'MANAGE_SETTINGS'];
      case 'ADMIN':
        return ['MANAGE_WORKSPACE', 'MANAGE_MEMBERS', 'EXECUTE_AGENTS', 'DEPLOY_APPS', 'MANAGE_SETTINGS'];
      case 'MANAGER':
        return ['EXECUTE_AGENTS', 'MANAGE_MEMBERS', 'VIEW_ANALYTICS', 'APPROVE_TASKS'];
      case 'MEMBER':
        return ['EXECUTE_AGENTS', 'VIEW_ANALYTICS', 'SUBMIT_TASKS'];
      case 'VIEWER':
        return ['VIEW_ANALYTICS', 'VIEW_WORKSPACE'];
      default:
        return ['VIEW_WORKSPACE'];
    }
  }
}

export const workspaceContextEngine = new WorkspaceContextEngine();
