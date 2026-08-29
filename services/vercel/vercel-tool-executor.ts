import { ToolExecutionContext, ToolExecutionResult } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface VercelToolInput {
  projectId?: string;
  projectName?: string;
  name?: string;
  deploymentId?: string;
  repo?: string;
  repository?: string;
  branch?: string;
  target?: 'production' | 'preview';
  domain?: string;
  gitBranch?: string;
  teamId?: string;
  limit?: number;
  framework?: string;
  files?: Array<{ file: string; data: string }>;
  token?: string;
  accessToken?: string;
  vercelToken?: string;
  [key: string]: unknown;
}

/**
 * Resolves server-side Vercel access token safely.
 * Token priority:
 * 1. Direct input token (if passed in secure context)
 * 2. Process environment variables (VERCEL_TOKEN, VERCEL_ACCESS_TOKEN, VERCEL_BEARER_TOKEN)
 */
export function resolveVercelToken(_userId?: string, inputToken?: string): string | null {
  if (inputToken && typeof inputToken === 'string' && inputToken.trim().length > 0) {
    return inputToken.trim();
  }

  const envToken =
    process.env.VERCEL_TOKEN ||
    process.env.VERCEL_ACCESS_TOKEN ||
    process.env.VERCEL_BEARER_TOKEN;

  if (envToken && envToken.trim().length > 0) {
    return envToken.trim();
  }

  return null;
}

/**
 * Centralized fetch wrapper for Vercel REST API
 */
async function vercelFetch<T = unknown>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.vercel.com${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
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
      const errObj = body as { error?: { message?: string; code?: string }; message?: string };
      const msg = errObj?.error?.message || errObj?.message || `Vercel API error (HTTP ${res.status})`;
      return { ok: false, status: res.status, error: msg, data: body as T };
    }

    return { ok: true, status: res.status, data: body as T };
  } catch (err: unknown) {
    return { ok: false, status: 500, error: err instanceof Error ? err.message : String(err) };
  }
}

export class VercelToolExecutorService {
  /**
   * Main entry point for executing real Vercel tools
   */
  public async executeTool(
    toolId: string,
    context: ToolExecutionContext,
    input: VercelToolInput
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const token = resolveVercelToken(context.userId, input.token || input.accessToken || input.vercelToken);

    if (!token) {
      return {
        success: false,
        toolId,
        provider: 'vercel',
        executionId: context.executionId,
        error: 'Vercel credentials NOT_CONFIGURED. Please provide a VERCEL_TOKEN environment variable or access token.',
        output: {
          status: 'NOT_CONFIGURED',
          message: 'Vercel credentials missing or not configured.',
          toolId
        },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }

    try {
      let resultData: unknown;

      switch (toolId) {
        case 'vercel_project_list':
          resultData = await this.listProjects(token, input);
          break;
        case 'vercel_project_info':
          resultData = await this.getProjectInfo(token, input);
          break;
        case 'vercel_project_create':
          resultData = await this.createProject(token, input);
          break;
        case 'vercel_deployment_create':
        case 'tool_vercel_deploy':
        case 'mcp_vercel_deploy_trigger':
          resultData = await this.createDeployment(token, input, context);
          break;
        case 'vercel_deployment_status':
          resultData = await this.getDeploymentStatus(token, input);
          break;
        case 'vercel_deployment_logs':
          resultData = await this.getDeploymentLogs(token, input);
          break;
        case 'vercel_domain_list':
          resultData = await this.listDomains(token, input);
          break;
        case 'vercel_domain_attach':
          resultData = await this.attachDomain(token, input);
          break;
        default:
          throw new Error(`Unknown or unsupported Vercel tool ID: '${toolId}'`);
      }

      return {
        success: true,
        toolId,
        provider: 'vercel',
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
        provider: 'vercel',
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

  // 1. List Projects
  private async listProjects(token: string, input: VercelToolInput) {
    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';
    const res = await vercelFetch<{ projects: Array<Record<string, unknown>> }>(
      `/v9/projects${teamParam}`,
      token
    );

    if (!res.ok) {
      throw new Error(`Failed to list Vercel projects: ${res.error}`);
    }

    const projects = (res.data?.projects || []).map(p => ({
      id: p.id,
      name: p.name,
      framework: p.framework,
      updatedAt: p.updatedAt,
      link: p.link
    }));

    return {
      status: 'SUCCESS',
      count: projects.length,
      projects
    };
  }

  // 2. Project Info
  private async getProjectInfo(token: string, input: VercelToolInput) {
    const projectIdOrName = input.projectId || input.projectName || input.name;
    if (!projectIdOrName) {
      throw new Error("Parameter 'projectId' or 'projectName' is required.");
    }

    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';
    const res = await vercelFetch<Record<string, unknown>>(
      `/v9/projects/${encodeURIComponent(projectIdOrName)}${teamParam}`,
      token
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch Vercel project info for '${projectIdOrName}': ${res.error}`);
    }

    const p = res.data!;
    return {
      status: 'SUCCESS',
      project: {
        id: p.id,
        name: p.name,
        framework: p.framework,
        nodeVersion: p.nodeVersion,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        targets: p.targets,
        link: p.link
      }
    };
  }

  // 3. Create Project
  private async createProject(token: string, input: VercelToolInput) {
    const name = input.projectName || input.name;
    if (!name) {
      throw new Error("Parameter 'name' or 'projectName' is required for project creation.");
    }

    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';
    const payload: Record<string, unknown> = {
      name,
      framework: input.framework || 'nextjs'
    };

    if (input.repo || input.repository) {
      const repoStr = input.repo || input.repository;
      payload.gitRepository = {
        type: 'github',
        repo: repoStr
      };
    }

    const res = await vercelFetch<Record<string, unknown>>(
      `/v10/projects${teamParam}`,
      token,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to create Vercel project '${name}': ${res.error}`);
    }

    const p = res.data!;
    return {
      status: 'SUCCESS',
      project: {
        id: p.id,
        name: p.name,
        framework: p.framework,
        createdAt: p.createdAt
      }
    };
  }

  // 4. Create Deployment
  private async createDeployment(
    token: string,
    input: VercelToolInput,
    context: ToolExecutionContext
  ) {
    const projectName = input.projectName || input.name || 'applet-deployment';
    const target = input.target || 'production';
    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';

    const payload: Record<string, unknown> = {
      name: projectName,
      target,
    };

    if (input.repo || input.repository) {
      const repoStr = (input.repo || input.repository) as string;
      const parts = repoStr.split('/');
      payload.gitSource = {
        type: 'github',
        org: parts[0] || 'applet-org',
        repo: parts[1] || parts[0],
        ref: input.branch || 'main'
      };
    } else if (input.files && Array.isArray(input.files)) {
      payload.files = input.files;
    }

    const res = await vercelFetch<Record<string, unknown>>(
      `/v13/deployments${teamParam}`,
      token,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      throw new Error(`Vercel deployment creation failed: ${res.error}`);
    }

    const d = res.data!;
    const deploymentId = String(d.id || d.uid);
    const url = d.url ? `https://${d.url}` : undefined;
    const rawState = String(d.readyState || d.status || 'BUILDING').toUpperCase();

    let historyStatus: 'SUCCESS' | 'FAILED' | 'BUILDING' | 'CANCELLED' = 'BUILDING';
    if (rawState === 'READY') historyStatus = 'SUCCESS';
    else if (rawState === 'ERROR' || rawState === 'FAILED') historyStatus = 'FAILED';
    else if (rawState === 'CANCELED' || rawState === 'CANCELLED') historyStatus = 'CANCELLED';

    // Save DB deployment history entry
    db.saveVercelDeploymentHistory(projectName, [
      {
        id: deploymentId,
        projectId: projectName,
        version: '1.0.0',
        commitHash: input.branch || 'main',
        branch: input.branch || 'main',
        status: historyStatus,
        environment: target === 'production' ? 'production' : 'preview',
        durationMs: 0,
        timeline: [{ step: 'CREATE_DEPLOYMENT', timestamp: new Date().toISOString(), status: 'SUCCESS' }],
        metadata: { creator: context.userId || 'system', framework: input.framework || 'nextjs', nodeVersion: '20.x' },
        createdAt: new Date().toISOString()
      }
    ]);

    return {
      status: 'SUCCESS',
      deploymentId,
      url,
      inspectorUrl: d.inspectorUrl,
      projectId: projectName,
      state: rawState,
      target,
      workspaceId: context.workspaceId,
      createdAt: d.createdAt || new Date().toISOString()
    };
  }

  // 5. Get Deployment Status
  private async getDeploymentStatus(token: string, input: VercelToolInput) {
    if (!input.deploymentId) {
      throw new Error("Parameter 'deploymentId' is required.");
    }

    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';
    const res = await vercelFetch<Record<string, unknown>>(
      `/v13/deployments/${encodeURIComponent(input.deploymentId)}${teamParam}`,
      token
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch status for deployment '${input.deploymentId}': ${res.error}`);
    }

    const d = res.data!;
    const state = String(d.readyState || d.status || 'UNKNOWN');
    const url = d.url ? `https://${d.url}` : undefined;

    return {
      status: 'SUCCESS',
      deploymentId: d.id || input.deploymentId,
      state,
      url,
      inspectorUrl: d.inspectorUrl,
      buildingAt: d.buildingAt,
      ready: d.ready,
      createdAt: d.createdAt
    };
  }

  // 6. Get Deployment Logs
  private async getDeploymentLogs(token: string, input: VercelToolInput) {
    if (!input.deploymentId) {
      throw new Error("Parameter 'deploymentId' is required.");
    }

    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';
    const limit = input.limit || 100;
    const res = await vercelFetch<Array<Record<string, unknown>>>(
      `/v2/deployments/${encodeURIComponent(input.deploymentId)}/events?limit=${limit}${teamParam.replace('?', '&')}`,
      token
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch logs for deployment '${input.deploymentId}': ${res.error}`);
    }

    const logs = (Array.isArray(res.data) ? res.data : []).map(e => ({
      id: e.id,
      text: e.text || e.message,
      type: e.type,
      timestamp: e.created || e.timestamp
    }));

    return {
      status: 'SUCCESS',
      deploymentId: input.deploymentId,
      count: logs.length,
      logs
    };
  }

  // 7. List Domains
  private async listDomains(token: string, input: VercelToolInput) {
    const projectIdOrName = input.projectId || input.projectName || input.name;
    if (!projectIdOrName) {
      throw new Error("Parameter 'projectId' or 'projectName' is required.");
    }

    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';
    const res = await vercelFetch<{ domains: Array<Record<string, unknown>> }>(
      `/v9/projects/${encodeURIComponent(projectIdOrName)}/domains${teamParam}`,
      token
    );

    if (!res.ok) {
      throw new Error(`Failed to list domains for project '${projectIdOrName}': ${res.error}`);
    }

    const domains = (res.data?.domains || []).map(d => ({
      name: d.name,
      apexName: d.apexName,
      verified: d.verified,
      gitBranch: d.gitBranch,
      createdAt: d.createdAt
    }));

    return {
      status: 'SUCCESS',
      projectId: projectIdOrName,
      count: domains.length,
      domains
    };
  }

  // 8. Attach Domain
  private async attachDomain(token: string, input: VercelToolInput) {
    const projectIdOrName = input.projectId || input.projectName;
    if (!projectIdOrName || !input.domain) {
      throw new Error("Parameters 'projectId' (or 'projectName') and 'domain' are required.");
    }

    const teamParam = input.teamId ? `?teamId=${encodeURIComponent(input.teamId)}` : '';
    const payload: Record<string, unknown> = {
      name: input.domain
    };
    if (input.gitBranch) {
      payload.gitBranch = input.gitBranch;
    }

    const res = await vercelFetch<Record<string, unknown>>(
      `/v10/projects/${encodeURIComponent(projectIdOrName)}/domains${teamParam}`,
      token,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to attach domain '${input.domain}' to project '${projectIdOrName}': ${res.error}`);
    }

    const d = res.data!;
    return {
      status: 'SUCCESS',
      projectId: projectIdOrName,
      domain: d.name || input.domain,
      verified: d.verified,
      createdAt: d.createdAt
    };
  }
}

export const vercelToolExecutorService = new VercelToolExecutorService();
