import {
  FirebaseActivityManagerReport,
  FirebaseActivityEvent
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FirebaseActivityManagerService {
  public getActivityReport(projectId: string = 'proj_enterprise_01'): FirebaseActivityManagerReport {
    const existing = dbStore.getLatestFirebaseActivityManagerReport(projectId);
    if (existing) return existing;

    const activities: FirebaseActivityEvent[] = [
      {
        id: 'act_01',
        category: 'AUTH',
        operation: 'User OAuth Login (Google)',
        status: 'SUCCESS',
        actor: 'user_dev_01@enterprise.org',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        details: 'Signed JWT issued via OAuth popup handler'
      },
      {
        id: 'act_02',
        category: 'FIRESTORE',
        operation: 'Batch Write (/projects)',
        status: 'SUCCESS',
        actor: 'service_account_builder',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        details: 'Inserted 12 document records across active project collections'
      },
      {
        id: 'act_03',
        category: 'STORAGE',
        operation: 'Resumable Upload (/code-artifacts)',
        status: 'SUCCESS',
        actor: 'dev_lead@enterprise.org',
        timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        details: 'Uploaded project_bundle_v2.zip (14.2 MB)'
      },
      {
        id: 'act_04',
        category: 'PROJECT',
        operation: 'Security Rules Evaluation',
        status: 'WARNING',
        actor: 'master_gate_evaluator',
        timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
        details: 'Gated unauthorized write attempt on /auditLogs'
      },
      {
        id: 'act_05',
        category: 'AUTH',
        operation: 'MFA Token Verification',
        status: 'SUCCESS',
        actor: 'admin_security@enterprise.org',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        details: 'TOPT MFA verified for admin session elevation'
      }
    ];

    const timeline = [
      { timestamp: '00:00', eventCount: 14 },
      { timestamp: '04:00', eventCount: 8 },
      { timestamp: '08:00', eventCount: 45 },
      { timestamp: '12:00', eventCount: 82 },
      { timestamp: '16:00', eventCount: 61 },
      { timestamp: '20:00', eventCount: 29 }
    ];

    const categories = ['AUTH', 'FIRESTORE', 'STORAGE', 'PROJECT'];

    const report: FirebaseActivityManagerReport = {
      id: `famr_${Date.now()}`,
      projectId,
      activities,
      timeline,
      categories,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveFirebaseActivityManagerReport(report);
    return report;
  }
}

export const firebaseActivityManagerService = new FirebaseActivityManagerService();
