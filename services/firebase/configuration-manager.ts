import { FirebaseConfigurationManagerReport } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FirebaseConfigurationManagerService {
  public getConfigurationReport(projectId: string = 'proj_enterprise_01'): FirebaseConfigurationManagerReport {
    const existing = dbStore.getLatestFirebaseConfigurationManagerReport(projectId);
    if (existing) return existing;

    const report: FirebaseConfigurationManagerReport = {
      id: `fcmr_${Date.now()}`,
      projectId,
      projectConfigSummary: {
        projectId,
        region: 'asia-southeast1',
        billingPlan: 'Blaze (Pay as you go)',
        servicesEnabled: ['Authentication', 'Firestore Database', 'Cloud Storage', 'App Check']
      },
      authConfig: {
        mfaEnforced: true,
        allowedProviders: ['google.com', 'password'],
        sessionDurationHours: 24
      },
      firestoreConfig: {
        databaseId: '(default)',
        concurrencyMode: 'OPTIMISTIC',
        pitrEnabled: true
      },
      storageConfig: {
        bucketLocation: 'ASIA-SOUTHEAST1',
        corsEnabled: true,
        maxUploadSizeBytes: 104857600 // 100 MB
      },
      securityConfig: {
        appCheckEnforced: true,
        rulesVersion: '2',
        tlsVersion: 'TLS 1.3'
      },
      validationStatus: 'VALID',
      validationErrors: [],
      generatedAt: new Date().toISOString()
    };

    dbStore.saveFirebaseConfigurationManagerReport(report);
    return report;
  }
}

export const firebaseConfigurationManagerService = new FirebaseConfigurationManagerService();
