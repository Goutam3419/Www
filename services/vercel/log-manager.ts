import { VercelDeploymentLog } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class DeploymentLogManagerService {
  /**
   * Generates or retrieves simulated deployment logs with level/source filtering support.
   */
  public getDeploymentLogs(
    projectId: string,
    filterLevel?: string,
    filterSource?: string
  ): VercelDeploymentLog[] {
    let logs = db.getVercelDeploymentLogs(projectId);

    if (!logs || logs.length === 0) {
      logs = [
        {
          id: `log_101_${Date.now()}`,
          deploymentId: `dep_hist_101_${projectId}`,
          projectId,
          level: 'VALIDATION',
          source: 'VALIDATION',
          message: 'Validating Next.js 15 App Router configuration and route structure...',
          timestamp: '2026-08-06T08:30:02Z'
        },
        {
          id: `log_102_${Date.now()}`,
          deploymentId: `dep_hist_101_${projectId}`,
          projectId,
          level: 'INFO',
          source: 'VALIDATION',
          message: 'TypeScript strict checking passed cleanly with 0 type errors.',
          timestamp: '2026-08-06T08:30:15Z'
        },
        {
          id: `log_103_${Date.now()}`,
          deploymentId: `dep_hist_101_${projectId}`,
          projectId,
          level: 'BUILD',
          source: 'BUILD',
          message: 'Executing build script: next build --standalone',
          timestamp: '2026-08-06T08:31:00Z'
        },
        {
          id: `log_104_${Date.now()}`,
          deploymentId: `dep_hist_101_${projectId}`,
          projectId,
          level: 'INFO',
          source: 'BUILD',
          message: 'Creating an optimized production build...',
          timestamp: '2026-08-06T08:31:20Z'
        },
        {
          id: `log_105_${Date.now()}`,
          deploymentId: `dep_hist_101_${projectId}`,
          projectId,
          level: 'INFO',
          source: 'BUILD',
          message: '✓ Compiled 48 static pages and 12 API routes cleanly.',
          timestamp: '2026-08-06T08:31:45Z'
        },
        {
          id: `log_106_${Date.now()}`,
          deploymentId: `dep_hist_101_${projectId}`,
          projectId,
          level: 'DEPLOY',
          source: 'DEPLOYMENT',
          message: 'Deploying serverless functions and static assets to Edge CDN...',
          timestamp: '2026-08-06T08:32:00Z'
        },
        {
          id: `log_107_${Date.now()}`,
          deploymentId: `dep_hist_101_${projectId}`,
          projectId,
          level: 'INFO',
          source: 'DEPLOYMENT',
          message: 'Deployment ready and live at https://ai-ceo-platform.vercel.app',
          timestamp: '2026-08-06T08:32:05Z'
        },
        {
          id: `log_108_${Date.now()}`,
          deploymentId: `dep_hist_099_${projectId}`,
          projectId,
          level: 'WARN',
          source: 'BUILD',
          message: 'Warning: Deprecated dependency package found in package.json.',
          timestamp: '2026-08-04T10:00:30Z'
        },
        {
          id: `log_109_${Date.now()}`,
          deploymentId: `dep_hist_099_${projectId}`,
          projectId,
          level: 'ERROR',
          source: 'BUILD',
          message: 'Build Error: Module not found: Cannot resolve "@/lib/missing-file"',
          timestamp: '2026-08-04T10:01:00Z'
        }
      ];

      db.saveVercelDeploymentLogs(projectId, logs);
    }

    let filtered = logs;
    if (filterLevel && filterLevel !== 'ALL') {
      filtered = filtered.filter(l => l.level === filterLevel);
    }
    if (filterSource && filterSource !== 'ALL') {
      filtered = filtered.filter(l => l.source === filterSource);
    }

    return filtered;
  }
}

export const deploymentLogManagerService = new DeploymentLogManagerService();
