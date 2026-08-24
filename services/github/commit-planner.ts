import { CommitPlan, CommitValidationAndRisk } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface CreateCommitPlanInput {
  repoFullName: string;
  branchName?: string;
  affectedFiles: string[];
  affectedModules?: string[];
  customMessage?: string;
}

export class CommitPlannerService {
  /**
   * Validates a commit message according to Conventional Commits standards
   */
  public validateCommitMessage(message: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!message || message.trim() === '') {
      errors.push('Commit message cannot be empty.');
      return { valid: false, errors };
    }

    const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9_-]+\))?: .+/;
    if (!conventionalRegex.test(message.trim())) {
      errors.push('Message must follow Conventional Commits format: "type(scope): description".');
    }

    if (message.length > 100) {
      errors.push('Header line exceeds recommended 100 characters.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Analyzes commit risk based on affected files and scope
   */
  public analyzeCommitRisk(affectedFiles: string[], message: string): CommitValidationAndRisk {
    const validation = this.validateCommitMessage(message);
    const risks: string[] = [];
    const recommendations: string[] = [];

    const touchesDatabase = affectedFiles.some(f => f.includes('/db/') || f.includes('/store.ts') || f.includes('schema'));
    const touchesAuth = affectedFiles.some(f => f.includes('oauth') || f.includes('auth') || f.includes('security'));
    const touchesPackageJson = affectedFiles.some(f => f.includes('package.json') || f.includes('lock'));

    if (touchesDatabase) {
      risks.push('Commit modifies data store schemas or database persistence layer.');
      recommendations.push('Ensure backward compatibility and run data migration validation checks.');
    }

    if (touchesAuth) {
      risks.push('Commit impacts security or authentication service modules.');
      recommendations.push('Perform security review before merging into default branch.');
    }

    if (touchesPackageJson) {
      risks.push('Commit alters project package dependencies or locks.');
      recommendations.push('Verify lockfile synchronization and clean build integrity.');
    }

    if (affectedFiles.length > 20) {
      risks.push('Large commit size with over 20 modified files.');
      recommendations.push('Consider splitting into smaller logically isolated commits.');
    }

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (touchesDatabase || touchesAuth || affectedFiles.length > 20) {
      riskLevel = 'HIGH';
    } else if (touchesPackageJson || affectedFiles.length > 5) {
      riskLevel = 'MEDIUM';
    }

    return {
      isValid: validation.valid,
      validationErrors: validation.errors,
      riskLevel,
      risks,
      recommendations
    };
  }

  /**
   * Plans a commit without executing any real git commit or GitHub API operation.
   */
  public planCommit(input: CreateCommitPlanInput): CommitPlan {
    const planId = `commit_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const branchName = input.branchName || 'main';
    const affectedModules = input.affectedModules || this.detectAffectedModules(input.affectedFiles);

    const message = input.customMessage || this.generateCommitMessage(input.affectedFiles, affectedModules);
    const summary = this.generateCommitSummary(input.affectedFiles, affectedModules);

    const plan: CommitPlan = {
      id: planId,
      repoFullName: input.repoFullName,
      branchName,
      message,
      summary,
      affectedFiles: input.affectedFiles,
      affectedModules,
      status: 'Planned',
      createdAt: new Date().toISOString()
    };

    db.saveCommitPlan(plan);
    return plan;
  }

  /**
   * Auto-generates a conventional commit message based on affected files and modules
   */
  public generateCommitMessage(affectedFiles: string[], affectedModules: string[]): string {
    if (affectedFiles.length === 0) {
      return 'chore: update project configuration and settings';
    }

    const scope = affectedModules[0] ? affectedModules[0].toLowerCase().replace(/\s+/g, '-') : 'core';

    const hasTypes = affectedFiles.some(f => f.includes('/types/') || f.endsWith('.d.ts'));
    const hasServices = affectedFiles.some(f => f.includes('/services/'));
    const hasComponents = affectedFiles.some(f => f.includes('/components/'));
    const hasDB = affectedFiles.some(f => f.includes('/db/') || f.includes('/store'));

    if (hasTypes && hasServices) {
      return `feat(${scope}): implement service interfaces and store architecture`;
    }
    if (hasComponents) {
      return `feat(${scope}): add UI preview components and workspace controls`;
    }
    if (hasDB) {
      return `refactor(${scope}): update data store models and query handlers`;
    }

    return `feat(${scope}): update ${affectedFiles.length} project file(s)`;
  }

  /**
   * Generates readable summary preview of planned commit
   */
  public generateCommitSummary(affectedFiles: string[], affectedModules: string[]): string {
    return `Commit plan affecting ${affectedFiles.length} file(s) across module(s): [${affectedModules.join(', ')}]. No remote push queued.`;
  }

  /**
   * Detects affected modules from file paths
   */
  public detectAffectedModules(affectedFiles: string[]): string[] {
    const modules = new Set<string>();

    for (const file of affectedFiles) {
      if (file.includes('/github/')) modules.add('GitHub Integration');
      else if (file.includes('/tools/')) modules.add('Tool Engine');
      else if (file.includes('/db/')) modules.add('Database');
      else if (file.includes('/types/')) modules.add('Types & Definitions');
      else if (file.includes('/components/')) modules.add('UI Component');
      else if (file.includes('/services/')) modules.add('Core Service');
      else modules.add('General Workspace');
    }

    return Array.from(modules);
  }

  /**
   * Gets list of commit plans in queue
   */
  public getCommitQueue(repoFullName?: string): CommitPlan[] {
    return db.getCommitPlans(repoFullName);
  }

  /**
   * Gets specific commit plan for preview
   */
  public getCommitPlan(planId: string): CommitPlan | undefined {
    return db.getCommitPlan(planId);
  }
}

export const commitPlannerService = new CommitPlannerService();
