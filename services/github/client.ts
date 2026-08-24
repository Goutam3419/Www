/**
 * GitHub Automation Client Architecture Specification
 */

export interface RepositoryConfig {
  name: string;
  description: string;
  isPrivate: boolean;
  autoInit: boolean;
}

export interface CommitPayload {
  repoOwner: string;
  repoName: string;
  branch: string;
  commitMessage: string;
  files: Array<{
    path: string;
    content: string;
  }>;
}

export abstract class GitHubService {
  abstract createRepository(config: RepositoryConfig): Promise<{ repoUrl: string; cloneUrl: string }>;
  abstract commitAndPush(payload: CommitPayload): Promise<{ commitSha: string }>;
}
