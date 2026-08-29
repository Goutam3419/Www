import { AuditEvent, AuditActionType } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class AuditService {
  public log(
    action: AuditActionType,
    details: Record<string, unknown>,
    workspaceId: string = 'ws_default_01',
    userId: string = 'user_ceo_01',
    projectId?: string
  ): AuditEvent {
    return db.logAuditEvent({
      workspaceId,
      projectId,
      userId,
      action,
      details
    });
  }

  public getEvents(workspaceId: string = 'ws_default_01'): AuditEvent[] {
    return db.getAuditEvents(workspaceId);
  }
}

export const auditService = new AuditService();
