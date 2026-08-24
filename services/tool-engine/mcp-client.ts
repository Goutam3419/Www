import { UniversalToolDefinition, ToolExecutionContext, ToolExecutionResult, MCPServerConfig } from '@/packages/types/src';
import { gitHubToolExecutorService } from '@/services/github/github-tool-executor';
import { vercelToolExecutorService } from '@/services/vercel/vercel-tool-executor';
import { firebaseToolExecutorService } from '@/services/firebase/firebase-tool-executor';

export class MCPClientEngine {
  private servers: Map<string, MCPServerConfig> = new Map();

  constructor() {
    this.registerServer({
      id: 'mcp_default_server',
      name: 'Default System MCP Server',
      version: '1.0.0',
      provider: 'mcp',
      transport: 'adapter',
      status: 'CONNECTED',
      enabled: true,
      capabilities: ['repo_sync', 'db_query', 'deploy_trigger', 'quota_check']
    });
  }

  public getServer(serverId: string): MCPServerConfig | undefined {
    return this.servers.get(serverId);
  }

  public listServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  public registerServer(config: MCPServerConfig): { success: boolean; error?: string; server?: MCPServerConfig } {
    if (!config.id || !config.name) {
      return { success: false, error: 'Server id and name are required.' };
    }
    const fullServer: MCPServerConfig = {
      version: '1.0.0',
      transport: 'adapter',
      status: 'DISCONNECTED',
      enabled: true,
      capabilities: [],
      ...config,
    };
    this.servers.set(fullServer.id, fullServer);
    return { success: true, server: fullServer };
  }

  public async connectServer(serverId: string): Promise<{ success: boolean; error?: string; capabilities?: string[] }> {
    const server = this.servers.get(serverId);
    if (!server) {
      return { success: false, error: `MCP Server '${serverId}' not found.` };
    }
    server.status = 'CONNECTED';
    server.lastConnectedAt = new Date().toISOString();
    return {
      success: true,
      capabilities: server.capabilities || ['default_capability']
    };
  }

  public async disconnectServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) return false;
    server.status = 'DISCONNECTED';
    return true;
  }

  public async unregisterServer(serverId: string): Promise<boolean> {
    return this.servers.delete(serverId);
  }

  public async executeMCPTool(
    tool: UniversalToolDefinition,
    context: ToolExecutionContext,
    input: Record<string, unknown>
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    if (tool.provider === 'github' || tool.id === 'mcp_github_repo_sync') {
      return gitHubToolExecutorService.executeTool(tool.id, context, input);
    }

    if (tool.provider === 'vercel' || tool.id === 'mcp_vercel_deploy_trigger') {
      return vercelToolExecutorService.executeTool(tool.id, context, input);
    }

    if (tool.provider === 'firebase' || tool.id === 'mcp_firebase_db_query') {
      return firebaseToolExecutorService.executeTool(tool.id, context, input);
    }

    return {
      success: true,
      toolId: tool.id,
      provider: tool.provider || 'mcp',
      executionId: context.executionId,
      output: {
        status: 'MCP_EXECUTED',
        toolId: tool.id,
        workspaceId: context.workspaceId,
        input
      },
      durationMs: Date.now() - startTime,
      retryCount: 0
    };
  }
}

export const mcpClientEngine = new MCPClientEngine();
