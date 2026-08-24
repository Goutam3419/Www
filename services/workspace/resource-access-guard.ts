import {
  ResourceAccessGuardRequest,
  ResourceAccessGuardResult
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { permissionEngine } from './permission-engine';
import { workspaceMembershipEngine } from './workspace-membership-engine';

export class ResourceAccessGuard {
  public guardAccess(request: ResourceAccessGuardRequest): ResourceAccessGuardResult {
    const { workspaceId, userId, resourceType, resourceId, resourceWorkspaceId, requiredPermission } = request;

    // 1. Boundary Isolation Guard
    if (workspaceId.toLowerCase() !== resourceWorkspaceId.toLowerCase()) {
      const denialReason = `Security Guard Violation: Cross-workspace access blocked. Request active workspace '${workspaceId}' attempted access to ${resourceType} '${resourceId}' in workspace '${resourceWorkspaceId}'.`;

      dbStore.recordPermissionAuditEvent({
        workspaceId,
        userId,
        eventType: 'ACCESS_DENIED',
        role: 'VIEWER',
        permission: requiredPermission,
        resourceType,
        resourceId,
        details: denialReason
      });

      return {
        granted: false,
        resourceType,
        resourceId,
        workspaceId,
        resourceWorkspaceId,
        userId,
        role: 'VIEWER',
        denialReason,
        timestamp: new Date().toISOString()
      };
    }

    // 2. Member & Role Resolution
    const membership = workspaceMembershipEngine.validateMembership(workspaceId, userId);
    if (!membership.isValid || !membership.role) {
      const denialReason = `Security Guard Violation: User '${userId}' is not an active member of target workspace '${workspaceId}'.`;

      dbStore.recordPermissionAuditEvent({
        workspaceId,
        userId,
        eventType: 'ACCESS_DENIED',
        role: 'VIEWER',
        permission: requiredPermission,
        resourceType,
        resourceId,
        details: denialReason
      });

      return {
        granted: false,
        resourceType,
        resourceId,
        workspaceId,
        resourceWorkspaceId,
        userId,
        role: 'VIEWER',
        denialReason,
        timestamp: new Date().toISOString()
      };
    }

    const userRole = membership.role;

    // 3. Permission Evaluation
    const permResult = permissionEngine.evaluatePermission({
      workspaceId,
      userId,
      permission: requiredPermission,
      resourceId,
      resourceWorkspaceId
    });

    if (!permResult.allowed) {
      return {
        granted: false,
        resourceType,
        resourceId,
        workspaceId,
        resourceWorkspaceId,
        userId,
        role: userRole,
        denialReason: permResult.reason,
        timestamp: new Date().toISOString()
      };
    }

    return {
      granted: true,
      resourceType,
      resourceId,
      workspaceId,
      resourceWorkspaceId,
      userId,
      role: userRole,
      timestamp: new Date().toISOString()
    };
  }
}

export const resourceAccessGuard = new ResourceAccessGuard();
