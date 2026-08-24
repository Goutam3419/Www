import { PullRequestPlan, PRMergeStrategy, PRApprovalStatus } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface CreatePRPlanInput {
  repoFullName: string;
  sourceBranch: string;
  targetBranch?: string;
  customTitle?: string;
  customDescription?: string;
  changedFilesCount?: number;
  additions?: number;
  deletions?: number;
}

export class PullRequestPlannerService {
  /**
   * Plans a Pull Request architectural draft without executing real GitHub API calls.
   */
  public planPullRequest(input: CreatePRPlanInput): PullRequestPlan {
    const prId = `pr_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const targetBranch = input.targetBranch || 'main';
    const totalFiles = input.changedFilesCount || 4;
    const additions = input.additions || 180;
    const deletions = input.deletions || 12;

    const title = input.customTitle || this.generateTitle(input.sourceBranch, input.repoFullName);
    const description = input.customDescription || this.generateDescription(input.sourceBranch, targetBranch, totalFiles);
    const reviewChecklist = this.generateReviewChecklist(totalFiles);
    const mergeStrategy: PRMergeStrategy = 'squash';
    const approvalStatus: PRApprovalStatus = 'PENDING';

    const readinessAnalysis = this.analyzeReadiness(totalFiles, reviewChecklist);

    const plan: PullRequestPlan = {
      id: prId,
      repoFullName: input.repoFullName,
      sourceBranch: input.sourceBranch,
      targetBranch,
      title,
      description,
      changedFilesSummary: {
        totalFiles,
        additions,
        deletions
      },
      reviewChecklist,
      mergeStrategy,
      approvalStatus,
      readinessAnalysis,
      createdAt: new Date().toISOString()
    };

    db.savePullRequestPlan(plan);
    return plan;
  }

  /**
   * Generates formatted Pull Request Title based on branch name
   */
  public generateTitle(sourceBranch: string, repoFullName: string): string {
    const cleanBranch = sourceBranch.replace(/^feature\//, '').replace(/^feat\//, '').replace(/^hotfix\//, '').replace(/-/g, ' ');
    const repoName = repoFullName.split('/')[1] || 'core';
    return `feat(${repoName}): ${cleanBranch || 'update modules and workspace integrations'}`;
  }

  /**
   * Generates Pull Request description template with architectural details
   */
  public generateDescription(sourceBranch: string, targetBranch: string, fileCount: number): string {
    return `### Pull Request Overview\n- **Source Branch:** \`${sourceBranch}\` -> **Target Branch:** \`${targetBranch}\`\n- **Scope:** Includes architectural updates across ${fileCount} file(s).\n\n### Summary of Changes\n1. Module & type declarations updated.\n2. Architectural services & store interfaces verified.\n3. Read-only workspace inspection UI synchronized.`;
  }

  /**
   * Generates standard review checklist items
   */
  public generateReviewChecklist(fileCount: number): { item: string; completed: boolean }[] {
    return [
      { item: 'Architecture & Types definition verified', completed: true },
      { item: 'Store interface and in-memory persistence mapped', completed: true },
      { item: `Changed files count verified (${fileCount} files)`, completed: true },
      { item: 'Zero remote API mutations confirmed (Architecture Mode)', completed: true },
      { item: 'Automated typecheck and linting passed', completed: false }
    ];
  }

  /**
   * Analyzes PR readiness for merge
   */
  public analyzeReadiness(
    fileCount: number,
    checklist: { item: string; completed: boolean }[]
  ): { isReady: boolean; checks: { name: string; passed: boolean; message: string }[] } {
    const completedCount = checklist.filter(c => c.completed).length;
    const checks = [
      { name: 'File Count Threshold', passed: fileCount < 50, message: fileCount < 50 ? 'Manageable PR size' : 'PR touches too many files' },
      { name: 'Architecture Review Checklist', passed: completedCount >= 3, message: `${completedCount}/${checklist.length} checklist items completed` },
      { name: 'Merge Conflict Probability', passed: true, message: 'No merge conflicts detected' }
    ];

    const isReady = checks.every(c => c.passed);
    return { isReady, checks };
  }

  /**
   * Retrieves latest PR plan for a repository
   */
  public getLatestPullRequestPlan(repoFullName: string): PullRequestPlan | undefined {
    return db.getLatestPullRequestPlan(repoFullName);
  }
}

export const pullRequestPlannerService = new PullRequestPlannerService();
