import { GitHubRepositoryMetadata } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface RegisterRepoMetadataInput {
  fullName: string; // e.g. 'owner/repo'
  description?: string;
  isPrivate?: boolean;
  defaultBranch?: string;
  topics?: string[];
  starsCount?: number;
  forksCount?: number;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export class RepositoryMetadataService {
  /**
   * Registers or updates repository metadata
   */
  public registerMetadata(input: RegisterRepoMetadataInput): GitHubRepositoryMetadata {
    const parts = input.fullName.split('/');
    const owner = parts[0] || 'default-owner';
    const name = parts[1] || parts[0];

    const existing = db.getGitHubRepoMetadata(input.fullName);

    const meta: GitHubRepositoryMetadata = {
      id: existing ? existing.id : `repo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: input.fullName,
      name,
      owner,
      description: input.description || existing?.description || '',
      isPrivate: input.isPrivate !== undefined ? input.isPrivate : (existing?.isPrivate ?? true),
      defaultBranch: input.defaultBranch || existing?.defaultBranch || 'main',
      topics: input.topics || existing?.topics || [],
      starsCount: input.starsCount !== undefined ? input.starsCount : (existing?.starsCount ?? 0),
      forksCount: input.forksCount !== undefined ? input.forksCount : (existing?.forksCount ?? 0),
      permissions: input.permissions || existing?.permissions || { admin: true, push: true, pull: true },
      updatedAt: new Date().toISOString()
    };

    return db.saveGitHubRepoMetadata(meta);
  }

  /**
   * Get metadata for repository by owner/repo name
   */
  public getMetadata(fullName: string): GitHubRepositoryMetadata | undefined {
    return db.getGitHubRepoMetadata(fullName);
  }

  /**
   * Helper to format repository web URL and clone URLs
   */
  public getRepositoryUrls(fullName: string): { webUrl: string; cloneUrl: string; sshUrl: string } {
    return {
      webUrl: `https://github.com/${fullName}`,
      cloneUrl: `https://github.com/${fullName}.git`,
      sshUrl: `git@github.com:${fullName}.git`
    };
  }
}

export const repositoryMetadataService = new RepositoryMetadataService();
