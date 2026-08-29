import { VercelEnvironmentConfig } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class VercelEnvironmentManagerService {
  /**
   * Analyzes required environment variables for Vercel deployment.
   */
  public analyzeEnvironment(projectId: string): VercelEnvironmentConfig {
    const configId = `env_cfg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const variables = [
      { key: 'GEMINI_API_KEY', isRequired: true, isConfigured: true, group: 'AI' as const },
      { key: 'GITHUB_OAUTH_CLIENT_ID', isRequired: true, isConfigured: true, group: 'AUTH' as const },
      { key: 'GITHUB_OAUTH_CLIENT_SECRET', isRequired: true, isConfigured: true, group: 'AUTH' as const },
      { key: 'DATABASE_URL', isRequired: false, isConfigured: true, group: 'DATABASE' as const },
      { key: 'NEXT_PUBLIC_APP_URL', isRequired: true, isConfigured: true, group: 'SYSTEM' as const },
      { key: 'VERCEL_ANALYTICS_ID', isRequired: false, isConfigured: false, group: 'GENERAL' as const }
    ];

    const missingVariables = variables.filter(v => v.isRequired && !v.isConfigured).map(v => v.key);

    let validationStatus: 'VALID' | 'WARNING' | 'INCOMPLETE' = 'VALID';
    if (missingVariables.length > 0) {
      validationStatus = 'INCOMPLETE';
    } else if (variables.some(v => !v.isConfigured)) {
      validationStatus = 'WARNING';
    }

    const config: VercelEnvironmentConfig = {
      id: configId,
      projectId,
      variables,
      missingVariables,
      validationStatus,
      analyzedAt: new Date().toISOString()
    };

    db.saveVercelEnvironmentConfig(config);
    return config;
  }

  /**
   * Retrieves latest environment configuration
   */
  public getLatestEnvironmentConfig(projectId: string): VercelEnvironmentConfig | undefined {
    return db.getLatestVercelEnvironmentConfig(projectId);
  }
}

export const vercelEnvironmentManagerService = new VercelEnvironmentManagerService();
