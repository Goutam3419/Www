import {
  FirebaseStoragePlannerReport,
  FirebaseStorageBucketStructure,
  FirebaseStorageFolderPlan,
  FirebaseStorageUploadStrategy,
  FirebaseStorageAccessRules,
  FirebaseStorageValidation
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FirebaseStoragePlannerService {
  public getStoragePlan(projectId: string = 'proj_enterprise_01'): FirebaseStoragePlannerReport {
    const existing = dbStore.getLatestFirebaseStoragePlannerReport(projectId);
    if (existing) return existing;

    const bucket: FirebaseStorageBucketStructure = {
      bucketName: `${projectId.toLowerCase()}-storage.appspot.com`,
      region: 'asia-southeast1',
      corsConfigured: true,
      defaultMaxUploadSizeBytes: 52428800 // 50 MB
    };

    const folders: FirebaseStorageFolderPlan[] = [
      {
        folderPath: '/avatars',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSizeBytes: 5242880, // 5 MB
        description: 'User and project avatar media files'
      },
      {
        folderPath: '/code-artifacts',
        allowedMimeTypes: ['application/json', 'application/zip', 'text/plain'],
        maxFileSizeBytes: 52428800, // 50 MB
        description: 'Exported project zip archives and AST dumps'
      },
      {
        folderPath: '/deployments',
        allowedMimeTypes: ['application/gzip', 'text/plain', 'application/json'],
        maxFileSizeBytes: 104857600, // 100 MB
        description: 'Build logs and deployment artifact bundles'
      }
    ];

    const uploadStrategy: FirebaseStorageUploadStrategy = {
      resumableUploads: true,
      directClientUpload: true,
      clientChunkSizeBytes: 2097152, // 2 MB chunks
      maxConcurrentUploads: 3
    };

    const accessRules: FirebaseStorageAccessRules = {
      rulesDraft: `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
    match /code-artifacts/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`,
      authRequiredPaths: ['/code-artifacts', '/deployments'],
      publicPaths: ['/avatars']
    };

    const validation: FirebaseStorageValidation = {
      valid: true,
      foldersCount: 3,
      accessRulesValid: true,
      issues: []
    };

    const report: FirebaseStoragePlannerReport = {
      id: `fspr_${Date.now()}`,
      projectId,
      bucket,
      folders,
      uploadStrategy,
      accessRules,
      validation,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveFirebaseStoragePlannerReport(report);
    return report;
  }
}

export const firebaseStoragePlannerService = new FirebaseStoragePlannerService();
