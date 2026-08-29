import { GitBranchInfo, GitBranchType, BranchOperationPlan } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface CreateBranchInput {
  repoFullName: string;
  name: string;
  type?: GitBranchType;
  fromBranch?: string;
}

export interface BranchValidationResult {
  valid: boolean;
  branchName: string;
  suggestedType: GitBranchType;
  errors: string[];
  warnings: string[];
}

export class BranchManagerService {
  /**
   * Plans a branch operation (CREATE, RENAME, DELETE) without executing real remote API calls.
   */
  public planBranchOperation(input: {
    action: 'CREATE' | 'RENAME' | 'DELETE';
    repoFullName: string;
    branchName: string;
    newBranchName?: string;
  }): BranchOperationPlan {
    const opId = `br_op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const mergeTargetValidation = this.validateMergeTarget(input.branchName, 'main');
    const protectionAnalysis = this.analyzeBranchProtection(input.branchName);

    const plan: BranchOperationPlan = {
      id: opId,
      repoFullName: input.repoFullName,
      action: input.action,
      branchName: input.branchName,
      newBranchName: input.newBranchName,
      mergeTargetValidation,
      protectionAnalysis,
      plannedAt: new Date().toISOString()
    };

    db.saveBranchOperationPlan(plan);
    return plan;
  }

  /**
   * Validates target merge branch compatibility and potential conflict risks
   */
  public validateMergeTarget(sourceBranch: string, targetBranch: string): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    if (sourceBranch === targetBranch) {
      return { valid: false, warnings: ['Source and target branch cannot be identical.'] };
    }

    if (targetBranch === 'main' && sourceBranch.startsWith('hotfix/')) {
      warnings.push('Hotfix branches should also be backported into development branch.');
    }

    if (sourceBranch === 'development' && targetBranch !== 'main' && !targetBranch.startsWith('release/')) {
      warnings.push("Development branch is typically merged only into 'main' or 'release/*'.");
    }

    return {
      valid: true,
      warnings
    };
  }

  /**
   * Analyzes protection rules applied to a branch
   */
  public analyzeBranchProtection(branchName: string): { isProtected: boolean; rules: string[] } {
    const isProtected = branchName === 'main' || branchName === 'master' || branchName === 'development' || branchName.startsWith('release/');
    const rules: string[] = [];

    if (isProtected) {
      rules.push('Require at least 1 pull request review before merging');
      rules.push('Require status checks to pass before merging');
      rules.push('Enforce linear history on commit squashing');
      rules.push('Restrict direct force pushes');
    }

    return {
      isProtected,
      rules
    };
  }

  /**
   * Registers a branch structure in memory architecture (NO real GitHub branch API call).
   */
  public prepareBranch(input: CreateBranchInput): {
    branch: GitBranchInfo;
    validation: BranchValidationResult;
  } {
    const validation = this.validateBranchName(input.name);
    const branchType = input.type || validation.suggestedType;

    const branch: GitBranchInfo = {
      id: `br_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      repoFullName: input.repoFullName,
      name: input.name,
      type: branchType,
      isDefault: branchType === 'main',
      isProtected: branchType === 'main' || branchType === 'release',
      createdAt: new Date().toISOString()
    };

    db.saveGitBranch(branch);

    return {
      branch,
      validation
    };
  }

  /**
   * Categorizes and validates branch naming patterns (main, development, feature/*, release/*, hotfix/*)
   */
  public validateBranchName(branchName: string): BranchValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let suggestedType: GitBranchType = 'feature';

    if (!branchName || branchName.trim() === '') {
      errors.push('Branch name cannot be empty.');
      return { valid: false, branchName: branchName || '', suggestedType: 'feature', errors, warnings };
    }

    const clean = branchName.trim().toLowerCase();

    if (clean === 'main' || clean === 'master') {
      suggestedType = 'main';
    } else if (clean === 'dev' || clean === 'development') {
      suggestedType = 'development';
    } else if (clean.startsWith('feat/') || clean.startsWith('feature/')) {
      suggestedType = 'feature';
    } else if (clean.startsWith('release/') || clean.startsWith('rel/')) {
      suggestedType = 'release';
    } else if (clean.startsWith('hotfix/') || clean.startsWith('fix/')) {
      suggestedType = 'hotfix';
    } else {
      suggestedType = 'feature';
      warnings.push("Standard prefix recommendation: 'feature/', 'release/', 'hotfix/', or 'dev'.");
    }

    if (/\s/.test(branchName)) {
      errors.push('Branch name cannot contain spaces.');
    }

    if (/[~^:?*\[\\\]]/.test(branchName)) {
      errors.push('Branch name contains invalid git ref characters.');
    }

    return {
      valid: errors.length === 0,
      branchName,
      suggestedType,
      errors,
      warnings
    };
  }

  /**
   * Returns list of configured branches for repository
   */
  public getBranches(repoFullName: string): GitBranchInfo[] {
    const branches = db.getGitBranches(repoFullName);
    if (branches.length === 0) {
      // Return default architecture branches if none created yet
      return [
        {
          id: `br_default_main`,
          repoFullName,
          name: 'main',
          type: 'main',
          isDefault: true,
          isProtected: true,
          createdAt: new Date().toISOString()
        },
        {
          id: `br_default_dev`,
          repoFullName,
          name: 'development',
          type: 'development',
          isDefault: false,
          isProtected: false,
          createdAt: new Date().toISOString()
        }
      ];
    }
    return branches;
  }
}

export const branchManagerService = new BranchManagerService();
