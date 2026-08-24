import {
  ToolProviderType,
  ToolReliabilityRecord,
  ToolReliabilityReport,
} from '@/packages/types/src';
import { getRepositories } from '@/lib/db/repositories';

export class ToolReliabilityEngine {
  /**
   * Infers the provider category from a tool identifier or name.
   */
  public inferProviderFromToolId(toolId: string): ToolProviderType {
    const lower = toolId.toLowerCase();
    if (lower.startsWith('github_') || lower.includes('git')) return 'GITHUB';
    if (lower.startsWith('vercel_') || lower.includes('vercel')) return 'VERCEL';
    if (lower.startsWith('firebase_') || lower.includes('firebase')) return 'FIREBASE';
    if (lower.startsWith('supabase_') || lower.includes('supabase') || lower.includes('postgres') || lower.includes('sql')) return 'SUPABASE';
    if (lower.startsWith('google_') || lower.includes('gemini') || lower.includes('gcp')) return 'GOOGLE';
    if (lower.startsWith('anthropic_') || lower.includes('claude')) return 'ANTHROPIC';
    if (lower.startsWith('openai_') || lower.includes('gpt')) return 'OPENAI';
    if (lower.startsWith('openrouter_')) return 'OPENROUTER';
    if (lower.startsWith('mcp_') || lower.includes('mcp')) return 'MCP_TOOLS';
    return 'CUSTOM';
  }

  /**
   * Records execution outcome, duration, and error category for a tool.
   */
  public async recordToolExecution(
    workspaceId: string,
    toolId: string,
    toolName: string,
    success: boolean,
    latencyMs: number,
    errorCategory?: string,
    explicitProvider?: ToolProviderType
  ): Promise<ToolReliabilityRecord> {
    const provider = explicitProvider || this.inferProviderFromToolId(toolId);
    const repos = getRepositories();

    return repos.toolReliability.recordExecution(
      workspaceId,
      toolId,
      toolName,
      provider,
      success,
      latencyMs,
      errorCategory
    );
  }

  /**
   * Retrieves reliability metrics for a specific tool in a workspace.
   */
  public async getToolReliability(workspaceId: string, toolId: string): Promise<ToolReliabilityRecord | null> {
    const repos = getRepositories();
    return repos.toolReliability.get(workspaceId, toolId);
  }

  public async getToolRecord(workspaceId: string, toolId: string): Promise<ToolReliabilityRecord | null> {
    return this.getToolReliability(workspaceId, toolId);
  }

  /**
   * Checks whether a tool is currently in a healthy status.
   */
  public async isToolHealthy(workspaceId: string, toolId: string): Promise<boolean> {
    const record = await this.getToolReliability(workspaceId, toolId);
    if (!record) return true; // Default to healthy if no failure history
    return record.recentHealth === 'HEALTHY' || record.recentHealth === 'DEGRADED';
  }

  /**
   * Returns a normalized health score (0.0 to 1.0) for a tool.
   */
  public async getToolHealthScore(workspaceId: string, toolId: string): Promise<number> {
    const record = await this.getToolReliability(workspaceId, toolId);
    if (!record) return 0.95; // Default high reliability if no past failures
    if (record.recentHealth === 'HEALTHY') return 1.0;
    if (record.recentHealth === 'DEGRADED') return 0.75;
    if (record.recentHealth === 'CRITICAL') return 0.35;
    return 0.1;
  }

  /**
   * Generates a comprehensive workspace reliability report across all providers and tools.
   */
  public async getReliabilityReport(workspaceId: string): Promise<ToolReliabilityReport> {
    const repos = getRepositories();
    const tools = await repos.toolReliability.listByWorkspace(workspaceId);

    const defaultProviders: ToolProviderType[] = [
      'GITHUB',
      'VERCEL',
      'FIREBASE',
      'SUPABASE',
      'GOOGLE',
      'ANTHROPIC',
      'OPENAI',
      'OPENROUTER',
      'MCP_TOOLS',
      'CUSTOM',
    ];

    const providerMetrics: ToolReliabilityReport['providerMetrics'] = {} as ToolReliabilityReport['providerMetrics'];
    for (const p of defaultProviders) {
      providerMetrics[p] = {
        totalCalls: 0,
        successRate: 1.0,
        avgLatencyMs: 0,
        health: 'HEALTHY',
      };
    }

    let overallCriticalCount = 0;
    let overallDegradedCount = 0;

    for (const t of tools) {
      const p = t.provider;
      if (!providerMetrics[p]) {
        providerMetrics[p] = {
          totalCalls: 0,
          successRate: 1.0,
          avgLatencyMs: 0,
          health: 'HEALTHY',
        };
      }

      const m = providerMetrics[p];
      const totalCalls = t.successCount + t.failureCount;
      const combinedCalls = m.totalCalls + totalCalls;

      if (combinedCalls > 0) {
        m.successRate = (m.successRate * m.totalCalls + t.successRate * totalCalls) / combinedCalls;
        m.avgLatencyMs = (m.avgLatencyMs * m.totalCalls + t.avgLatencyMs * totalCalls) / combinedCalls;
        m.totalCalls = combinedCalls;
      }

      if (t.recentHealth === 'CRITICAL') overallCriticalCount++;
      if (t.recentHealth === 'DEGRADED') overallDegradedCount++;
    }

    // Determine provider health levels
    for (const p of Object.keys(providerMetrics) as ToolProviderType[]) {
      const m = providerMetrics[p];
      if (m.totalCalls > 0) {
        if (m.successRate < 0.5) m.health = 'CRITICAL';
        else if (m.successRate < 0.8) m.health = 'DEGRADED';
        else m.health = 'HEALTHY';
      }
    }

    let overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    if (overallCriticalCount > 0) overallHealth = 'CRITICAL';
    else if (overallDegradedCount > 0) overallHealth = 'DEGRADED';

    const topFailingTools = tools
      .filter((t) => t.failureCount > 0)
      .map((t) => ({
        toolId: t.toolId,
        failureRate: 1 - t.successRate,
        failureCount: t.failureCount,
      }))
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 5);

    return {
      workspaceId,
      overallHealth,
      providerMetrics,
      topFailingTools,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const toolReliabilityEngine = new ToolReliabilityEngine();
