import { ReleasePlan } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface CreateReleasePlanInput {
  repoFullName: string;
  targetBranch?: string;
  currentVersion?: string;
  versionType?: 'major' | 'minor' | 'patch';
  customNotes?: string;
}

export class ReleasePlannerService {
  /**
   * Plans a Semantic Release draft without invoking real GitHub release APIs.
   */
  public planRelease(input: CreateReleasePlanInput): ReleasePlan {
    const releaseId = `rel_plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const currentVersion = input.currentVersion || 'v1.2.0';
    const versionType = input.versionType || 'minor';
    const targetBranch = input.targetBranch || 'main';

    const plannedVersion = this.calculateNextVersion(currentVersion, versionType);
    const tagName = plannedVersion;

    const changelog = [
      {
        category: 'Features' as const,
        entries: [
          'GitHub Integration Engine: PR Planner, Actions Planner, and Release Planner modules',
          'Repository Security Analyzer with score calculation and permission risk detection'
        ]
      },
      {
        category: 'Fixes' as const,
        entries: [
          'Resolved next build worker module resolution issue and routing checks',
          'Standardized type imports and store mapping for GitHub workspace components'
        ]
      },
      {
        category: 'Chore' as const,
        entries: [
          'Updated DB Store interfaces with Prompt 5.3 memory structures',
          'Added read-only inspection panels for GitHub workspace overview'
        ]
      }
    ];

    const releaseNotes = input.customNotes || this.generateReleaseNotes(plannedVersion, targetBranch, changelog);
    const releaseSummary = `Release ${plannedVersion} targeting branch '${targetBranch}'. Contains ${changelog.reduce((acc, c) => acc + c.entries.length, 0)} total updates across ${changelog.length} categories.`;

    const validation = {
      valid: true,
      errors: []
    };

    const plan: ReleasePlan = {
      id: releaseId,
      repoFullName: input.repoFullName,
      targetBranch,
      currentVersion,
      plannedVersion,
      versionType,
      tagName,
      releaseNotes,
      changelog,
      releaseSummary,
      validation,
      plannedAt: new Date().toISOString()
    };

    db.saveReleasePlan(plan);
    return plan;
  }

  /**
   * Calculates next semantic version string (e.g. v1.2.0 -> v1.3.0)
   */
  public calculateNextVersion(current: string, type: 'major' | 'minor' | 'patch'): string {
    const clean = current.replace(/^v/, '');
    const parts = clean.split('.').map(n => parseInt(n, 10) || 0);

    let [major = 1, minor = 0, patch = 0] = parts;

    if (type === 'major') {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (type === 'minor') {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }

    return `v${major}.${minor}.${patch}`;
  }

  /**
   * Generates release notes markdown
   */
  public generateReleaseNotes(
    version: string,
    targetBranch: string,
    changelog: { category: string; entries: string[] }[]
  ): string {
    let notes = `## Release Notes (${version})\nTarget Branch: \`${targetBranch}\`\n\n`;
    for (const group of changelog) {
      notes += `### ${group.category}\n`;
      for (const entry of group.entries) {
        notes += `- ${entry}\n`;
      }
      notes += '\n';
    }
    return notes.trim();
  }

  /**
   * Retrieves latest release plan for a repository
   */
  public getLatestReleasePlan(repoFullName: string): ReleasePlan | undefined {
    return db.getLatestReleasePlan(repoFullName);
  }
}

export const releasePlannerService = new ReleasePlannerService();
