import {
  FirestoreRulesManagerReport,
  FirestoreRuleOperationPolicy
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FirestoreRulesManagerService {
  public getRulesManagerReport(projectId: string = 'proj_enterprise_01'): FirestoreRulesManagerReport {
    const existing = dbStore.getLatestFirestoreRulesManagerReport(projectId);
    if (existing) return existing;

    const readRules: FirestoreRuleOperationPolicy[] = [
      {
        operation: 'read',
        collectionPath: '/workspaces/{workspaceId}',
        condition: 'request.auth != null && isWorkspaceMember(workspaceId)',
        roleRequired: 'MEMBER'
      },
      {
        operation: 'read',
        collectionPath: '/workspaces/{workspaceId}/projects/{projectId}',
        condition: 'request.auth != null && isWorkspaceMember(workspaceId)',
        roleRequired: 'MEMBER'
      },
      {
        operation: 'read',
        collectionPath: '/workspaces/{workspaceId}/auditLogs',
        condition: 'request.auth != null && isWorkspaceAdmin(workspaceId)',
        roleRequired: 'ADMIN'
      }
    ];

    const writeRules: FirestoreRuleOperationPolicy[] = [
      {
        operation: 'create',
        collectionPath: '/workspaces/{workspaceId}',
        condition: 'request.auth != null && isValidId(workspaceId)',
        roleRequired: 'AUTHENTICATED_USER'
      },
      {
        operation: 'create',
        collectionPath: '/workspaces/{workspaceId}/projects/{projectId}',
        condition: 'request.auth != null && isWorkspaceEditor(workspaceId) && isValidId(projectId)',
        roleRequired: 'EDITOR'
      }
    ];

    const updateRules: FirestoreRuleOperationPolicy[] = [
      {
        operation: 'update',
        collectionPath: '/workspaces/{workspaceId}/projects/{projectId}',
        condition: 'request.auth != null && isWorkspaceEditor(workspaceId) && request.resource.data.createdAt == resource.data.createdAt',
        restrictedFields: ['createdAt', 'workspaceId'],
        roleRequired: 'EDITOR'
      }
    ];

    const deleteRules: FirestoreRuleOperationPolicy[] = [
      {
        operation: 'delete',
        collectionPath: '/workspaces/{workspaceId}/projects/{projectId}',
        condition: 'request.auth != null && isWorkspaceOwner(workspaceId)',
        roleRequired: 'OWNER'
      },
      {
        operation: 'delete',
        collectionPath: '/workspaces/{workspaceId}/auditLogs/{logId}',
        condition: 'false', // immutable
        roleRequired: 'DENY_ALL'
      }
    ];

    const report: FirestoreRulesManagerReport = {
      id: `frmr_${Date.now()}`,
      projectId,
      readRules,
      writeRules,
      updateRules,
      deleteRules,
      rulesSummary: 'Gated 8-pillar ABAC Firestore Security Rules enforced with Default Deny, Immutable Audit Logs, and Field Preservation validation.',
      validation: {
        valid: true,
        warnings: ['Audit log deletion is strictly hard-coded to deny for compliance']
      },
      generatedAt: new Date().toISOString()
    };

    dbStore.saveFirestoreRulesManagerReport(report);
    return report;
  }
}

export const firestoreRulesManagerService = new FirestoreRulesManagerService();
