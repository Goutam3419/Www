import { VercelDeploymentReadinessReport } from '@/packages/types/src';
import { db } from '@/lib/db/store';
import { vercelEnvironmentManagerService } from './environment-manager';
import { vercelProjectConfigAnalyzerService } from './config-analyzer';

export class VercelReadinessReporterService {
  /**
   * Generates a comprehensive deployment readiness report.
   */
  public generateReadinessReport(projectId: string): VercelDeploymentReadinessReport {
    const reportId = `rep_read_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const envConfig = vercelEnvironmentManagerService.analyzeEnvironment(projectId);
    const projConfig = vercelProjectConfigAnalyzerService.analyzeProjectConfig(projectId);

    const missingConfigurations: string[] = [];
    if (!projConfig.nextConfig.hasNextConfig) {
      missingConfigurations.push('Missing next.config.ts or next.config.js configuration file.');
    }

    const missingEnvVariables = envConfig.missingVariables;

    let buildReadiness: 'READY' | 'NEEDS_ATTENTION' | 'BLOCKED' = 'READY';
    if (missingEnvVariables.length > 0) {
      buildReadiness = 'BLOCKED';
    } else if (missingConfigurations.length > 0) {
      buildReadiness = 'NEEDS_ATTENTION';
    }

    let readinessScore = 98;
    if (missingEnvVariables.length > 0) readinessScore -= 30;
    if (missingConfigurations.length > 0) readinessScore -= 15;

    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = readinessScore > 85 ? 'LOW' : readinessScore > 65 ? 'MEDIUM' : 'HIGH';

    const recommendations = [
      'Ensure all environment variables are synced in Vercel Project Settings prior to initial deployment.',
      'Verify Next.js 15 route handlers compile cleanly with `npm run build`.',
      'Configure preview branch deployment triggers for automated Pull Request checks.'
    ];

    const report: VercelDeploymentReadinessReport = {
      id: reportId,
      projectId,
      missingConfigurations,
      missingEnvVariables,
      buildReadiness,
      riskLevel,
      readinessScore,
      recommendations,
      generatedAt: new Date().toISOString()
    };

    db.saveVercelDeploymentReadinessReport(report);
    return report;
  }

  /**
   * Retrieves latest readiness report
   */
  public getLatestReadinessReport(projectId: string): VercelDeploymentReadinessReport | undefined {
    return db.getLatestVercelDeploymentReadinessReport(projectId);
  }
}

export const vercelReadinessReporterService = new VercelReadinessReporterService();
