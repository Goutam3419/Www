import { ToolExecutionContext, ToolExecutionResult } from '@/packages/types/src';
import { db } from '@/lib/db/store';
import { repositoryExplorerService } from './repository-explorer';

export interface GitHubToolInput {
  owner?: string;
  repo?: string;
  fullName?: string;
  repository?: string;
  org?: string;
  path?: string;
  content?: string;
  message?: string;
  branch?: string;
  fromBranch?: string;
  sha?: string;
  files?: Array<{ path: string; content: string }>;
  token?: string;
  accessToken?: string;
  [key: string]: unknown;
}

/**
 * Resolves server-side GitHub access token safely.
 * Token priority:
 * 1. Direct input token (if passed in secure context)
 * 2. Process environment variables (GITHUB_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_PAT)
 * 3. Local DB GitHub Connection & OAuth Session
 */
export function resolveGitHubToken(userId?: string, inputToken?: string): string | null {
  if (inputToken && typeof inputToken === 'string' && inputToken.trim().length > 0) {
    return inputToken.trim();
  }

  const envToken =
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_ACCESS_TOKEN ||
    process.env.GITHUB_PAT;

  if (envToken && envToken.trim().length > 0) {
    return envToken.trim();
  }

  if (userId) {
    const connection = db.getGitHubConnection(userId);
    if (connection && connection.oauthSessionId) {
      const session = db.getGitHubOAuthSession(connection.oauthSessionId);
      if (session && session.accessToken) {
        return session.accessToken;
      }
    }
  }

  return null;
}

/**
 * Helper function for parsing owner/repo from parameters
 */
function parseOwnerAndRepo(input: GitHubToolInput): { owner: string; repo: string } | null {
  if (input.owner && input.repo) {
    return { owner: input.owner, repo: input.repo };
  }
  const raw = input.fullName || input.repository;
  if (raw && typeof raw === 'string' && raw.includes('/')) {
    const parts = raw.split('/');
    if (parts[0] && parts[1]) {
      return { owner: parts[0].trim(), repo: parts[1].trim() };
    }
  }
  return null;
}

/**
 * Centralized fetch wrapper for GitHub REST API v3/v4
 */
async function githubFetch<T = unknown>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'AI-Studio-Applet/1.0',
        ...(options.headers || {}),
      },
    });

    if (res.status === 204) {
      return { ok: true, status: 204 };
    }

    const contentType = res.headers.get('content-type') || '';
    let body: unknown = null;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    if (!res.ok) {
      const errObj = body as { message?: string; documentation_url?: string };
      const msg = errObj?.message || `GitHub API error (HTTP ${res.status})`;
      return { ok: false, status: res.status, error: msg, data: body as T };
    }

    return { ok: true, status: res.status, data: body as T };
  } catch (err: unknown) {
    return { ok: false, status: 500, error: err instanceof Error ? err.message : String(err) };
  }
}

export class GitHubToolExecutorService {
  /**
   * Main entry point for executing real GitHub tools
   */
  public async executeTool(
    toolId: string,
    context: ToolExecutionContext,
    input: GitHubToolInput
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const token = resolveGitHubToken(context.userId, input.token || input.accessToken);

    if (!token) {
      return {
        success: false,
        toolId,
        provider: 'github',
        executionId: context.executionId,
        error: 'GitHub credentials NOT_CONFIGURED. Please provide a GITHUB_TOKEN environment variable or connect your GitHub account.',
        output: {
          status: 'NOT_CONFIGURED',
          message: 'GitHub credentials missing or not configured.',
          toolId
        },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }

    try {
      let resultData: unknown;

      switch (toolId) {
        case 'github_repo_list':
          resultData = await this.listRepos(token, input);
          break;
        case 'github_repo_info':
          resultData = await this.getRepoInfo(token, input);
          break;
        case 'github_repo_tree':
          resultData = await this.getRepoTree(token, input);
          break;
        case 'github_file_read':
          resultData = await this.readFile(token, input);
          break;
        case 'github_file_write':
          resultData = await this.writeFile(token, input);
          break;
        case 'github_branch_create':
          resultData = await this.createBranch(token, input);
          break;
        case 'github_commit':
          resultData = await this.commit(token, input);
          break;
        case 'github_repo_sync':
        case 'mcp_github_repo_sync':
          resultData = await this.syncRepo(token, input);
          break;
        default:
          throw new Error(`Unknown or unsupported GitHub tool ID: '${toolId}'`);
      }

      return {
        success: true,
        toolId,
        provider: 'github',
        executionId: context.executionId,
        output: resultData,
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        toolId,
        provider: 'github',
        executionId: context.executionId,
        error: errorMsg,
        output: {
          status: 'EXECUTION_FAILED',
          error: errorMsg,
          toolId
        },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }
  }

  // 1. Repository List
  private async listRepos(token: string, input: GitHubToolInput) {
    const endpoint = input.org
      ? `/orgs/${encodeURIComponent(input.org)}/repos?sort=updated&per_page=100`
      : `/user/repos?sort=updated&per_page=100`;

    const res = await githubFetch<Array<Record<string, unknown>>>(endpoint, token);
    if (!res.ok) {
      throw new Error(`Failed to list repositories: ${res.error}`);
    }

    const repos = (res.data || []).map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: (r.owner as Record<string, unknown>)?.login,
      isPrivate: r.private,
      defaultBranch: r.default_branch,
      htmlUrl: r.html_url,
      updatedAt: r.updated_at,
      description: r.description
    }));

    return {
      status: 'SUCCESS',
      count: repos.length,
      repositories: repos
    };
  }

  // 2. Repository Info
  private async getRepoInfo(token: string, input: GitHubToolInput) {
    const target = parseOwnerAndRepo(input);
    if (!target) {
      throw new Error("Parameters 'owner' and 'repo' (or 'fullName') are required.");
    }

    const res = await githubFetch<Record<string, unknown>>(`/repos/${target.owner}/${target.repo}`, token);
    if (!res.ok) {
      throw new Error(`Failed to fetch repo info for '${target.owner}/${target.repo}': ${res.error}`);
    }

    const r = res.data!;
    const metadata = {
      id: String(r.id),
      fullName: r.full_name as string,
      name: r.name as string,
      owner: (r.owner as Record<string, unknown>)?.login as string,
      description: (r.description as string) || '',
      isPrivate: Boolean(r.private),
      defaultBranch: (r.default_branch as string) || 'main',
      topics: (r.topics as string[]) || [],
      starsCount: Number(r.stargazers_count || 0),
      forksCount: Number(r.forks_count || 0),
      openIssuesCount: Number(r.open_issues_count || 0),
      htmlUrl: r.html_url as string,
      cloneUrl: r.clone_url as string
    };

    db.saveGitHubRepoMetadata({
      ...metadata,
      permissions: { admin: true, push: true, pull: true }
    });

    return {
      status: 'SUCCESS',
      repository: metadata
    };
  }

  // 3. Repository Tree
  private async getRepoTree(token: string, input: GitHubToolInput) {
    const target = parseOwnerAndRepo(input);
    if (!target) {
      throw new Error("Parameters 'owner' and 'repo' (or 'fullName') are required.");
    }

    if (input.path) {
      const res = await githubFetch<Array<Record<string, unknown>>>(
        `/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(input.path)}${input.branch ? `?ref=${encodeURIComponent(input.branch)}` : ''}`,
        token
      );
      if (!res.ok) {
        throw new Error(`Failed to list tree at path '${input.path}': ${res.error}`);
      }
      const items = Array.isArray(res.data) ? res.data : [res.data];
      return {
        status: 'SUCCESS',
        path: input.path,
        tree: items.map((i: Record<string, unknown>) => ({
          path: i.path,
          name: i.name,
          type: i.type,
          size: i.size,
          sha: i.sha
        }))
      };
    }

    const branch = input.branch || 'main';
    const res = await githubFetch<{ tree: Array<Record<string, unknown>>; truncated: boolean }>(
      `/repos/${target.owner}/${target.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      token
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch git tree for '${target.owner}/${target.repo}' on branch '${branch}': ${res.error}`);
    }

    const items = (res.data?.tree || []).map(i => ({
      path: i.path,
      type: i.type === 'blob' ? 'file' : i.type === 'tree' ? 'directory' : i.type,
      size: i.size,
      sha: i.sha
    }));

    return {
      status: 'SUCCESS',
      repoFullName: `${target.owner}/${target.repo}`,
      branch,
      truncated: res.data?.truncated || false,
      totalItems: items.length,
      tree: items
    };
  }

  // 4. File Read
  private async readFile(token: string, input: GitHubToolInput) {
    const target = parseOwnerAndRepo(input);
    if (!target) {
      throw new Error("Parameters 'owner' and 'repo' (or 'fullName') are required.");
    }
    if (!input.path) {
      throw new Error("Parameter 'path' is required for file read.");
    }

    const endpoint = `/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(input.path)}${
      input.branch ? `?ref=${encodeURIComponent(input.branch)}` : ''
    }`;

    const res = await githubFetch<Record<string, unknown>>(endpoint, token);
    if (!res.ok) {
      throw new Error(`File read failed for '${input.path}' in '${target.owner}/${target.repo}': ${res.error}`);
    }

    const data = res.data!;
    let contentText = '';

    if (data.encoding === 'base64' && typeof data.content === 'string') {
      const cleanContent = data.content.replace(/\n/g, '');
      contentText = Buffer.from(cleanContent, 'base64').toString('utf-8');
    } else if (typeof data.content === 'string') {
      contentText = data.content;
    }

    return {
      status: 'SUCCESS',
      repoFullName: `${target.owner}/${target.repo}`,
      path: data.path,
      name: data.name,
      sha: data.sha,
      size: data.size,
      encoding: data.encoding,
      content: contentText
    };
  }

  // 5. File Write
  private async writeFile(token: string, input: GitHubToolInput) {
    const target = parseOwnerAndRepo(input);
    if (!target) {
      throw new Error("Parameters 'owner' and 'repo' (or 'fullName') are required.");
    }
    if (!input.path || input.content === undefined) {
      throw new Error("Parameters 'path' and 'content' are required for file write.");
    }

    const branch = input.branch || 'main';
    const message = input.message || `Update ${input.path}`;
    let sha = input.sha;

    // Fetch existing file SHA if not provided
    if (!sha) {
      const checkRes = await githubFetch<Record<string, unknown>>(
        `/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(input.path)}?ref=${encodeURIComponent(branch)}`,
        token
      );
      if (checkRes.ok && checkRes.data?.sha) {
        sha = checkRes.data.sha as string;
      }
    }

    const base64Content = Buffer.from(input.content, 'utf-8').toString('base64');
    const bodyPayload: Record<string, unknown> = {
      message,
      content: base64Content,
      branch
    };
    if (sha) {
      bodyPayload.sha = sha;
    }

    const res = await githubFetch<{ commit: { sha: string; html_url: string }; content: { sha: string; path: string } }>(
      `/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(input.path)}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify(bodyPayload)
      }
    );

    if (!res.ok) {
      throw new Error(`File write failed for '${input.path}' in '${target.owner}/${target.repo}': ${res.error}`);
    }

    return {
      status: 'SUCCESS',
      repoFullName: `${target.owner}/${target.repo}`,
      path: res.data?.content?.path || input.path,
      sha: res.data?.content?.sha,
      commitSha: res.data?.commit?.sha,
      commitUrl: res.data?.commit?.html_url,
      branch,
      message
    };
  }

  // 6. Branch Create
  private async createBranch(token: string, input: GitHubToolInput) {
    const target = parseOwnerAndRepo(input);
    if (!target) {
      throw new Error("Parameters 'owner' and 'repo' (or 'fullName') are required.");
    }
    if (!input.branch) {
      throw new Error("Parameter 'branch' is required for branch creation.");
    }

    const fromBranch = input.fromBranch || 'main';

    // Get source branch commit sha
    const sourceRefRes = await githubFetch<{ object: { sha: string } }>(
      `/repos/${target.owner}/${target.repo}/git/ref/heads/${encodeURIComponent(fromBranch)}`,
      token
    );

    if (!sourceRefRes.ok || !sourceRefRes.data?.object?.sha) {
      throw new Error(`Could not locate source branch '${fromBranch}' on '${target.owner}/${target.repo}': ${sourceRefRes.error}`);
    }

    const sourceSha = sourceRefRes.data.object.sha;

    // Create ref
    const createRes = await githubFetch<{ ref: string; object: { sha: string } }>(
      `/repos/${target.owner}/${target.repo}/git/refs`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          ref: `refs/heads/${input.branch}`,
          sha: sourceSha
        })
      }
    );

    if (!createRes.ok) {
      throw new Error(`Failed to create branch '${input.branch}' on '${target.owner}/${target.repo}': ${createRes.error}`);
    }

    return {
      status: 'SUCCESS',
      repoFullName: `${target.owner}/${target.repo}`,
      branch: input.branch,
      ref: createRes.data?.ref,
      sha: createRes.data?.object?.sha || sourceSha
    };
  }

  // 7. Commit (Single or Multiple Files)
  private async commit(token: string, input: GitHubToolInput) {
    const target = parseOwnerAndRepo(input);
    if (!target) {
      throw new Error("Parameters 'owner' and 'repo' (or 'fullName') are required.");
    }

    const files = input.files || [];
    if (files.length === 0 && input.path && input.content !== undefined) {
      files.push({ path: input.path, content: input.content });
    }

    if (files.length === 0) {
      throw new Error("At least one file in 'files' array or 'path' and 'content' must be provided for commit.");
    }

    const branch = input.branch || 'main';
    const message = input.message || 'Commit via AI Tool Engine';

    const commitResults = [];
    for (const f of files) {
      const res = await this.writeFile(token, {
        owner: target.owner,
        repo: target.repo,
        path: f.path,
        content: f.content,
        message,
        branch
      });
      commitResults.push(res);
    }

    return {
      status: 'SUCCESS',
      repoFullName: `${target.owner}/${target.repo}`,
      branch,
      message,
      filesCount: files.length,
      commitResults
    };
  }

  // 8. Repository Sync
  private async syncRepo(token: string, input: GitHubToolInput) {
    const target = parseOwnerAndRepo(input);
    if (!target) {
      throw new Error("Parameters 'owner' and 'repo' (or 'fullName' or 'repository') are required.");
    }

    const repoFullName = `${target.owner}/${target.repo}`;

    // Fetch repo details, branches, and commits
    const [infoRes, branchesRes, commitsRes] = await Promise.all([
      githubFetch<Record<string, unknown>>(`/repos/${target.owner}/${target.repo}`, token),
      githubFetch<Array<{ name: string }>>(`/repos/${target.owner}/${target.repo}/branches`, token),
      githubFetch<Array<{ sha: string; commit: { message: string } }>>(`/repos/${target.owner}/${target.repo}/commits?per_page=5`, token)
    ]);

    if (!infoRes.ok) {
      throw new Error(`Failed to sync repository '${repoFullName}': ${infoRes.error}`);
    }

    const r = infoRes.data!;
    const branches = (branchesRes.data || []).map(b => b.name);
    const commits = (commitsRes.data || []).map(c => ({ sha: c.sha, message: c.commit?.message }));

    db.saveGitHubRepoMetadata({
      id: String(r.id),
      fullName: r.full_name as string,
      name: r.name as string,
      owner: (r.owner as Record<string, unknown>)?.login as string,
      description: (r.description as string) || '',
      isPrivate: Boolean(r.private),
      defaultBranch: (r.default_branch as string) || 'main',
      permissions: { admin: true, push: true, pull: true }
    });

    repositoryExplorerService.exploreRepository(repoFullName);

    return {
      status: 'SUCCESS',
      repoFullName,
      branchesCount: branches.length,
      branches,
      recentCommits: commits,
      syncedAt: new Date().toISOString()
    };
  }
}

export const gitHubToolExecutorService = new GitHubToolExecutorService();
