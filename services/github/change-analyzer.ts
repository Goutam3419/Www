import { GitChangeAnalysis, GitFileChange } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface RawFileChangeInput {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
  additions?: number;
  deletions?: number;
}

export interface DependencyChangeInput {
  package: string;
  oldVersion?: string;
  newVersion: string;
  changeType: 'ADDED' | 'UPDATED' | 'REMOVED';
}

export class GitChangeAnalyzerService {
  /**
   * Performs analysis on workspace changes without interacting with remote APIs or executing real git operations.
   */
  public analyzeChanges(
    repoFullName: string,
    rawChanges: RawFileChangeInput[],
    dependencyChanges: DependencyChangeInput[] = []
  ): GitChangeAnalysis {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const createdFiles: string[] = [];
    const modifiedFiles: string[] = [];
    const deletedFiles: string[] = [];
    const renamedFiles: { oldPath: string; newPath: string }[] = [];

    const changes: GitFileChange[] = rawChanges.map(rc => {
      let changeType: GitFileChange['changeType'] = 'MODIFIED';

      if (rc.status === 'added') {
        changeType = 'CREATED';
        createdFiles.push(rc.path);
      } else if (rc.status === 'deleted') {
        changeType = 'DELETED';
        deletedFiles.push(rc.path);
      } else if (rc.status === 'renamed' && rc.oldPath) {
        changeType = 'RENAMED';
        renamedFiles.push({ oldPath: rc.oldPath, newPath: rc.path });
      } else {
        changeType = 'MODIFIED';
        modifiedFiles.push(rc.path);
      }

      return {
        path: rc.path,
        changeType,
        additions: rc.additions || 0,
        deletions: rc.deletions || 0,
        oldPath: rc.oldPath
      };
    });

    const analysis: GitChangeAnalysis = {
      id: analysisId,
      repoFullName,
      totalFilesChanged: rawChanges.length,
      createdFiles,
      modifiedFiles,
      deletedFiles,
      renamedFiles,
      dependencyChanges,
      changes,
      analyzedAt: new Date().toISOString()
    };

    db.saveGitChangeAnalysis(analysis);
    return analysis;
  }

  /**
   * Retrieves the latest change analysis report for a repository
   */
  public getLatestAnalysis(repoFullName: string): GitChangeAnalysis | undefined {
    return db.getLatestGitChangeAnalysis(repoFullName);
  }
}

export const gitChangeAnalyzerService = new GitChangeAnalyzerService();
