import {
  FirebaseAuthReadinessReport,
  FirebaseAuthAuthProvider,
  FirebaseAuthValidation
} from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FirebaseAuthPlannerService {
  public getAuthReadinessReport(projectId: string = 'proj_enterprise_01'): FirebaseAuthReadinessReport {
    const existing = dbStore.getLatestFirebaseAuthReadinessReport(projectId);
    if (existing) return existing;

    const providers: FirebaseAuthAuthProvider[] = [
      {
        id: 'prov_email',
        name: 'Email / Password',
        type: 'email',
        enabled: true,
        configRequirement: 'Email Verification Enforced'
      },
      {
        id: 'prov_google',
        name: 'Google OAuth',
        type: 'google',
        enabled: true,
        scopes: ['email', 'profile', 'openid'],
        configRequirement: 'OAuth Client Credentials Configured'
      },
      {
        id: 'prov_github',
        name: 'GitHub OAuth',
        type: 'github',
        enabled: true,
        scopes: ['user:email', 'read:user'],
        configRequirement: 'GitHub Client Secret Saved'
      },
      {
        id: 'prov_anonymous',
        name: 'Anonymous Authentication',
        type: 'anonymous',
        enabled: false,
        configRequirement: 'Disabled for Security Policy'
      }
    ];

    const validation: FirebaseAuthValidation = {
      valid: true,
      providerCount: 3,
      issues: [
        'Anonymous auth is disabled as per enterprise security policy',
        'Google OAuth popup domain allowlist verified'
      ]
    };

    const report: FirebaseAuthReadinessReport = {
      id: `farr_${Date.now()}`,
      projectId,
      readinessScore: 95,
      providers,
      validation,
      domainAllowlist: ['localhost', 'ai.studio', 'cloud.run', 'firebaseapp.com'],
      mfaEnforced: true,
      readinessStatus: 'READY',
      generatedAt: new Date().toISOString()
    };

    dbStore.saveFirebaseAuthReadinessReport(report);
    return report;
  }
}

export const firebaseAuthPlannerService = new FirebaseAuthPlannerService();
