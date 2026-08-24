import {
  PermissionAuditEvent,
  PermissionAuditSummary,
  PermissionAuditEventType,
  WorkspaceRole,
  WorkspacePermissionKey
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class PermissionAuditEngine {
  public logEvent(
    workspaceId: string,
    userId: string,
    eventType: PermissionAuditEventType,
    role: WorkspaceRole,
    details: string,
    permission?: WorkspacePermissionKey | string,
    resourceType?: string,
    resourceId?: string
  ): PermissionAuditEvent {
    return dbStore.recordPermissionAuditEvent({
      workspaceId,
      userId,
      eventType,
      role,
      permission,
      resourceType,
      resourceId,
      details
    });
  }

  public getEvents(workspaceId: string): PermissionAuditEvent[] {
    return dbStore.getPermissionAuditEvents(workspaceId);
  }

  public getSummary(workspaceId: string): PermissionAuditSummary {
    return dbStore.getPermissionAuditSummary(workspaceId);
  }
}

export const permissionAuditEngine = new PermissionAuditEngine();
