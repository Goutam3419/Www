import {
  FirestorePlannerReport,
  FirestoreCollectionPlan,
  FirestoreDocumentStructure,
  FirestoreIndexPlan,
  FirestoreRulesPlan,
  FirestoreCollectionValidation
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FirestorePlannerService {
  public getFirestorePlan(projectId: string = 'proj_enterprise_01'): FirestorePlannerReport {
    const existing = dbStore.getLatestFirestorePlannerReport(projectId);
    if (existing) return existing;

    const collections: FirestoreCollectionPlan[] = [
      {
        name: 'Workspaces',
        path: '/workspaces/{workspaceId}',
        description: 'Primary workspace metadata and organization container',
        entitySchema: 'WorkspaceEntity',
        estimatedDocumentCount: 50
      },
      {
        name: 'Projects',
        path: '/workspaces/{workspaceId}/projects/{projectId}',
        description: 'Enterprise projects belonging to workspace',
        entitySchema: 'ProjectEntity',
        estimatedDocumentCount: 250
      },
      {
        name: 'Code Files',
        path: '/workspaces/{workspaceId}/projects/{projectId}/codeFiles/{fileId}',
        description: 'Generated source code files and AST representations',
        entitySchema: 'CodeFileEntity',
        estimatedDocumentCount: 5000
      },
      {
        name: 'Audit Logs',
        path: '/workspaces/{workspaceId}/auditLogs/{logId}',
        description: 'Immutable security and execution audit events',
        entitySchema: 'AuditLogEntity',
        estimatedDocumentCount: 15000
      }
    ];

    const structures: FirestoreDocumentStructure[] = [
      {
        entityName: 'ProjectEntity',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Unique project identifier', pattern: '^[a-zA-Z0-9_\\-]+$' },
          { name: 'name', type: 'string', required: true, description: 'Project title', maxLength: 120 },
          { name: 'workspaceId', type: 'string', required: true, description: 'Parent workspace ID', pattern: '^[a-zA-Z0-9_\\-]+$' },
          { name: 'framework', type: 'string', required: true, description: 'Framework technology stack' },
          { name: 'status', type: 'string', required: true, description: 'Current project lifecycle state' },
          { name: 'createdAt', type: 'timestamp', required: true, description: 'Server timestamp of creation' }
        ]
      },
      {
        entityName: 'CodeFileEntity',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Unique file record identifier' },
          { name: 'path', type: 'string', required: true, description: 'Relative path in codebase', maxLength: 300 },
          { name: 'fileType', type: 'string', required: true, description: 'Component / Service / Page type' },
          { name: 'content', type: 'string', required: true, description: 'Source code content', maxLength: 500000 },
          { name: 'updatedAt', type: 'timestamp', required: true, description: 'Last modification server timestamp' }
        ]
      }
    ];

    const indexes: FirestoreIndexPlan[] = [
      {
        collectionPath: '/workspaces/{workspaceId}/projects',
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ],
        queryScope: 'COLLECTION'
      },
      {
        collectionPath: '/workspaces/{workspaceId}/projects/{projectId}/codeFiles',
        fields: [
          { fieldPath: 'fileType', order: 'ASCENDING' },
          { fieldPath: 'path', order: 'ASCENDING' }
        ],
        queryScope: 'COLLECTION'
      }
    ];

    const rulesPlan: FirestoreRulesPlan = {
      masterGateEnabled: true,
      isValidHelperPresent: true,
      allowListRestricted: true,
      defaultDenyEnabled: true,
      rulesDraft: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    
    function isSignedIn() { return request.auth != null; }
    function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$'); }
    
    match /workspaces/{workspaceId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && isValidId(workspaceId);
    }
  }
}`
    };

    const validation: FirestoreCollectionValidation = {
      valid: true,
      collectionCount: 4,
      indexCount: 2,
      missingIndexWarnings: []
    };

    const report: FirestorePlannerReport = {
      id: `fpr_${Date.now()}`,
      projectId,
      collections,
      structures,
      indexes,
      rulesPlan,
      validation,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveFirestorePlannerReport(report);
    return report;
  }
}

export const firestorePlannerService = new FirestorePlannerService();
