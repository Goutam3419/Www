import { GitHubRepositoryMetadata } from '@/packages/types/src';
import { db } from '@/lib/db/store';
import { repositoryMetadataService } from './repo-metadata-service';

export interface CreateRepositoryRequestInput {
  fullName: string; // e.g., 'owner/repo-name'
  description?: string;
  isPrivate?: boolean;
  defaultBranch?: string;
  topics?: string[];
  autoInit?: boolean;
}

export interface RepositoryValidationResult {
  valid: boolean;
  fullName: string;
  errors: string[];
  warnings: string[];
}

export class RepositoryManagerService {
  /**
   * Prepares and validates a repository creation request (Architecture Layer - No API calls executed).
   */
  public prepareCreateRequest(input: CreateRepositoryRequestInput): {
    request: CreateRepositoryRequestInput;
    validation: RepositoryValidationResult;
    metadata: GitHubRepositoryMetadata;
  } {
    const validation = this.validateRepositoryName(input.fullName);

    const metadata = repositoryMetadataService.registerMetadata({
      fullName: input.fullName,
      description: input.description,
      isPrivate: input.isPrivate !== undefined ? input.isPrivate : true,
      defaultBranch: input.defaultBranch || 'main',
      topics: input.topics || [],
      permissions: { admin: true, push: true, pull: true }
    });

    return {
      request: input,
      validation,
      metadata
    };
  }

  /**
   * Validates repository full name format (e.g., 'owner/repository')
   */
  public validateRepositoryName(fullName: string): RepositoryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!fullName || fullName.trim() === '') {
      errors.push('Repository full name cannot be empty.');
      return { valid: false, fullName: fullName || '', errors, warnings };
    }

    const parts = fullName.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      errors.push("Repository full name must be in format 'owner/repository'.");
    } else {
      const [owner, repo] = parts;
      if (!/^[a-zA-Z0-9_-]+$/.test(owner)) {
        errors.push('Owner name contains invalid characters.');
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(repo)) {
        errors.push('Repository name contains invalid characters.');
      }
      if (repo.length > 100) {
        warnings.push('Repository name is longer than 100 characters.');
      }
    }

    return {
      valid: errors.length === 0,
      fullName,
      errors,
      warnings
    };
  }

  /**
   * Retrieves repository metadata from local store
   */
  public getRepositoryMetadata(fullName: string): GitHubRepositoryMetadata | undefined {
    return db.getGitHubRepoMetadata(fullName);
  }

  /**
   * Gets architectural repository status overview
   */
  public getRepositoryStatus(fullName: string): {
    configured: boolean;
    metadata?: GitHubRepositoryMetadata;
    status: 'NOT_CONFIGURED' | 'READY' | 'INITIALIZING';
  } {
    const metadata = db.getGitHubRepoMetadata(fullName);
    if (!metadata) {
      return { configured: false, status: 'NOT_CONFIGURED' };
    }
    return {
      configured: true,
      metadata,
      status: 'READY'
    };
  }
}

export const repositoryManagerService = new RepositoryManagerService();
