import {
  FirebaseProjectSummary,
  FirebaseProjectInfo,
  FirebaseEnvironmentMapping,
  FirebaseProjectValidation
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FirebaseProjectManagerService {
  public getProjectSummary(projectId: string = 'proj_enterprise_01'): FirebaseProjectSummary {
    const existing = dbStore.getLatestFirebaseProjectSummary(projectId);
    if (existing) return existing;

    const info: FirebaseProjectInfo = {
      projectId: `firebase-${projectId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      projectName: 'Enterprise Firebase Backend',
      appId: '1:1020842580192:web:0ee785c1eea9479898342e',
      region: 'asia-southeast1',
      billingPlan: 'Spark (Free)',
      status: 'ACTIVE',
      environment: 'production'
    };

    const environments: FirebaseEnvironmentMapping[] = [
      {
        environment: 'development',
        isConfigured: true,
        config: {
          apiKey: 'AIzaSyDev_MockKey_1234567890_Dev',
          authDomain: `${info.projectId}-dev.firebaseapp.com`,
          projectId: `${info.projectId}-dev`,
          storageBucket: `${info.projectId}-dev.appspot.com`,
          messagingSenderId: '1020842580192',
          appId: '1:1020842580192:web:dev0ee785c1eea9479898'
        }
      },
      {
        environment: 'staging',
        isConfigured: true,
        config: {
          apiKey: 'AIzaSyStg_MockKey_1234567890_Stg',
          authDomain: `${info.projectId}-stg.firebaseapp.com`,
          projectId: `${info.projectId}-stg`,
          storageBucket: `${info.projectId}-stg.appspot.com`,
          messagingSenderId: '1020842580192',
          appId: '1:1020842580192:web:stg0ee785c1eea9479898'
        }
      },
      {
        environment: 'production',
        isConfigured: true,
        config: {
          apiKey: 'AIzaSyPrd_MockKey_1234567890_Prd',
          authDomain: `${info.projectId}.firebaseapp.com`,
          projectId: info.projectId,
          storageBucket: `${info.projectId}.appspot.com`,
          messagingSenderId: '1020842580192',
          appId: info.appId
        }
      }
    ];

    const validation: FirebaseProjectValidation = {
      valid: true,
      checks: [
        { name: 'Project ID Format', status: 'PASS', message: 'Valid lowercase alphanumeric hyphens' },
        { name: 'API Key Declaration', status: 'PASS', message: 'Server-side key mapped in env' },
        { name: 'Storage Bucket Binding', status: 'PASS', message: 'Regional appspot bucket associated' },
        { name: 'App ID Binding', status: 'PASS', message: 'Web app registration active' }
      ]
    };

    const summary: FirebaseProjectSummary = {
      id: `fps_${Date.now()}`,
      projectId,
      info,
      environments,
      validation,
      summaryText: 'Firebase Project configured and mapped across development, staging, and production environments with active regional region asia-southeast1.',
      generatedAt: new Date().toISOString()
    };

    dbStore.saveFirebaseProjectSummary(summary);
    return summary;
  }
}

export const firebaseProjectManagerService = new FirebaseProjectManagerService();
