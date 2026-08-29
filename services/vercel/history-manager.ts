import { VercelDeploymentHistoryEntry } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class DeploymentHistoryManagerService {
  /**
   * Generates or retrieves simulated deployment version history for a project.
   */
  public getDeploymentHistory(projectId: string): VercelDeploymentHistoryEntry[] {
    const existing = db.getVercelDeploymentHistory(projectId);
    if (existing && existing.length > 0) {
      return existing;
    }

    const mockHistory: VercelDeploymentHistoryEntry[] = [
      {
        id: `dep_hist_101_${projectId}`,
        projectId,
        version: 'v1.4.0-build.82',
        commitHash: '8f3a1b2',
        branch: 'main',
        status: 'SUCCESS',
        environment: 'production',
        durationMs: 8750,
        timeline: [
          { step: 'Validation', timestamp: '2026-08-06T08:30:00Z', status: 'SUCCESS' },
          { step: 'Build Generation', timestamp: '2026-08-06T08:31:15Z', status: 'SUCCESS' },
          { step: 'Edge Deployment', timestamp: '2026-08-06T08:32:00Z', status: 'SUCCESS' }
        ],
        metadata: {
          creator: 'AI CEO Agent',
          framework: 'Next.js 15 App Router',
          nodeVersion: 'v20.x'
        },
        createdAt: '2026-08-06T08:32:00Z'
      },
      {
        id: `dep_hist_100_${projectId}`,
        projectId,
        version: 'v1.3.9-build.79',
        commitHash: '4c2d9e1',
        branch: 'main',
        status: 'SUCCESS',
        environment: 'production',
        durationMs: 9120,
        timeline: [
          { step: 'Validation', timestamp: '2026-08-05T14:10:00Z', status: 'SUCCESS' },
          { step: 'Build Generation', timestamp: '2026-08-05T14:11:30Z', status: 'SUCCESS' },
          { step: 'Edge Deployment', timestamp: '2026-08-05T14:12:15Z', status: 'SUCCESS' }
        ],
        metadata: {
          creator: 'AI CEO Agent',
          framework: 'Next.js 15 App Router',
          nodeVersion: 'v20.x'
        },
        createdAt: '2026-08-05T14:12:15Z'
      },
      {
        id: `dep_hist_099_${projectId}`,
        projectId,
        version: 'v1.3.8-build.76',
        commitHash: '1a9e3f7',
        branch: 'feature/pipeline-test',
        status: 'FAILED',
        environment: 'preview',
        durationMs: 4300,
        timeline: [
          { step: 'Validation', timestamp: '2026-08-04T10:00:00Z', status: 'SUCCESS' },
          { step: 'Build Generation', timestamp: '2026-08-04T10:01:00Z', status: 'FAILED' }
        ],
        metadata: {
          creator: 'AI CEO Agent',
          framework: 'Next.js 15 App Router',
          nodeVersion: 'v20.x'
        },
        createdAt: '2026-08-04T10:01:00Z'
      }
    ];

    db.saveVercelDeploymentHistory(projectId, mockHistory);
    return mockHistory;
  }
}

export const deploymentHistoryManagerService = new DeploymentHistoryManagerService();
