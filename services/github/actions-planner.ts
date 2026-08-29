import { GitHubActionsPlan, WorkflowPlanItem } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class GitHubActionsPlannerService {
  /**
   * Plans GitHub Actions CI/CD workflows (Architecture & Planning layer).
   */
  public planWorkflows(repoFullName: string): GitHubActionsPlan {
    const planId = `actions_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const workflows: WorkflowPlanItem[] = [
      {
        name: 'Build Workflow',
        type: 'build',
        status: 'ENABLED',
        trigger: 'push, pull_request',
        steps: ['Checkout code', 'Setup Node.js 20', 'Install dependencies', 'Run npm run build']
      },
      {
        name: 'Lint & Typecheck Workflow',
        type: 'lint',
        status: 'ENABLED',
        trigger: 'pull_request',
        steps: ['Checkout code', 'Setup Node.js 20', 'Install dependencies', 'Run npm run lint', 'Run tsc --noEmit']
      },
      {
        name: 'Test Workflow',
        type: 'test',
        status: 'ENABLED',
        trigger: 'pull_request, push (main)',
        steps: ['Checkout code', 'Setup Node.js 20', 'Install dependencies', 'Run unit tests']
      },
      {
        name: 'Deploy Workflow',
        type: 'deploy',
        status: 'ENABLED',
        trigger: 'push (main)',
        steps: ['Checkout code', 'Authenticate GCP / Cloud Run', 'Build container image', 'Deploy to Staging Environment']
      }
    ];

    const executionOrder = ['Lint & Typecheck Workflow', 'Build Workflow', 'Test Workflow', 'Deploy Workflow'];

    const validation = {
      valid: true,
      errors: [],
      warnings: ['Deploy workflow requires authenticated GCP service account key secret configured in GitHub Secrets.']
    };

    const failureRiskDetection = {
      riskLevel: 'LOW' as const,
      risks: [
        'Dependency cache miss could add 1-2 minutes to build step.',
        'Secret variable setup required prior to initial deployment run.'
      ],
      mitigation: [
        'Utilize actions/cache for node_modules.',
        'Validate secrets setup using Repository Security Analyzer.'
      ]
    };

    const plan: GitHubActionsPlan = {
      id: planId,
      repoFullName,
      workflows,
      executionOrder,
      validation,
      failureRiskDetection,
      plannedAt: new Date().toISOString()
    };

    db.saveGitHubActionsPlan(plan);
    return plan;
  }

  /**
   * Retrieves latest Actions plan for repository
   */
  public getLatestActionsPlan(repoFullName: string): GitHubActionsPlan | undefined {
    return db.getLatestGitHubActionsPlan(repoFullName);
  }
}

export const gitHubActionsPlannerService = new GitHubActionsPlannerService();
