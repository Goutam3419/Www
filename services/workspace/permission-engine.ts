import {
  WorkspacePermissionCategory,
  WorkspacePermissionKey,
  PermissionEvaluationRequest,
  PermissionEvaluationResult,
  WorkspaceRole
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { workspaceRBACEngine } from './workspace-rbac-engine';
import { workspaceMembershipEngine } from './workspace-membership-engine';

export const PERMISSION_CATEGORIES: Record<WorkspacePermissionCategory, { name: string; permissions: WorkspacePermissionKey[] }> = {
  WORKSPACE: {
    name: 'Workspace Management',
    permissions: ['workspace:manage', 'workspace:view']
  },
  MEMBER: {
    name: 'Member Management',
    permissions: ['member:invite', 'member:manage', 'member:remove']
  },
  PROJECT: {
    name: 'Project Management',
    permissions: ['project:create', 'project:read', 'project:update', 'project:delete']
  },
  AGENT: {
    name: 'Agent Management',
    permissions: ['agent:manage', 'agent:execute']
  },
  TASK: {
    name: 'Task Management',
    permissions: ['task:create', 'task:execute', 'task:approve']
  },
  CHAT: {
    name: 'Chat Engine',
    permissions: ['chat:read', 'chat:write']
  },
  MEMORY: {
    name: 'Project Memory',
    permissions: ['memory:read', 'memory:write']
  },
  KNOWLEDGE: {
    name: 'Knowledge & RAG Base',
    permissions: ['knowledge:read', 'knowledge:manage']
  },
  INTEGRATIONS: {
    name: 'External Integrations',
    permissions: ['integration:manage']
  },
  TOOLS: {
    name: 'Tool Execution',
    permissions: ['tool:execute']
  },
  CODE_ENGINE: {
    name: 'Enterprise Coding Engine',
    permissions: ['code:generate', 'code:refactor']
  },
  DEPLOYMENT: {
    name: 'Deployment & Vercel',
    permissions: ['deployment:trigger', 'deployment:manage']
  },
  ACTIVITY_LOGS: {
    name: 'Activity & Audit Logs',
    permissions: ['logs:read']
  },
  SETTINGS: {
    name: 'Workspace Settings',
    permissions: ['settings:manage']
  }
};

export class PermissionEngine {
  public evaluatePermission(request: PermissionEvaluationRequest): PermissionEvaluationResult {
    const { workspaceId, userId, permission, resourceWorkspaceId } = request;

    // 1. Cross-Workspace Boundary Check (if resourceWorkspaceId provided)
    if (resourceWorkspaceId && resourceWorkspaceId.toLowerCase() !== workspaceId.toLowerCase()) {
      const result: PermissionEvaluationResult = {
        allowed: false,
        role: 'VIEWER',
        permission,
        workspaceId,
        reason: `Access Denied: Cross-workspace boundary violation. Request workspace ${workspaceId} does not match resource workspace ${resourceWorkspaceId}.`,
        evaluatedAt: new Date().toISOString()
      };

      dbStore.recordPermissionAuditEvent({
        workspaceId,
        userId,
        eventType: 'ACCESS_DENIED',
        role: 'VIEWER',
        permission,
        resourceId: request.resourceId,
        details: result.reason
      });

      return result;
    }

    // 2. Member & Role Resolution
    const membership = workspaceMembershipEngine.validateMembership(workspaceId, userId);
    if (!membership.isValid || !membership.role) {
      const result: PermissionEvaluationResult = {
        allowed: false,
        role: 'VIEWER',
        permission,
        workspaceId,
        reason: `Access Denied: User ${userId} is not an active member of workspace ${workspaceId}.`,
        evaluatedAt: new Date().toISOString()
      };

      dbStore.recordPermissionAuditEvent({
        workspaceId,
        userId,
        eventType: 'ACCESS_DENIED',
        role: 'VIEWER',
        permission,
        resourceId: request.resourceId,
        details: result.reason
      });

      return result;
    }

    const userRole: WorkspaceRole = membership.role;

    // 3. RBAC Role Permission Check
    const hasPerm = workspaceRBACEngine.hasPermission(userRole, permission);

    if (hasPerm) {
      const result: PermissionEvaluationResult = {
        allowed: true,
        role: userRole,
        permission,
        workspaceId,
        reason: `Access Granted: Role ${userRole} possesses permission '${permission}' in workspace ${workspaceId}.`,
        evaluatedAt: new Date().toISOString()
      };

      dbStore.recordPermissionAuditEvent({
        workspaceId,
        userId,
        eventType: 'ACCESS_GRANTED',
        role: userRole,
        permission,
        resourceId: request.resourceId,
        details: result.reason
      });

      return result;
    } else {
      const result: PermissionEvaluationResult = {
        allowed: false,
        role: userRole,
        permission,
        workspaceId,
        reason: `Access Denied: Role ${userRole} lacks permission '${permission}' in workspace ${workspaceId}.`,
        evaluatedAt: new Date().toISOString()
      };

      dbStore.recordPermissionAuditEvent({
        workspaceId,
        userId,
        eventType: 'ACCESS_DENIED',
        role: userRole,
        permission,
        resourceId: request.resourceId,
        details: result.reason
      });

      return result;
    }
  }
}

export const permissionEngine = new PermissionEngine();
