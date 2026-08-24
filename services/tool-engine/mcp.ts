/**
 * Tool Engine & Model Context Protocol (MCP) Architecture Specification
 */

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  category: 'FS' | 'GIT' | 'DEPLOY' | 'DATABASE' | 'SYSTEM';
}

export interface MCPExecutionRequest {
  toolName: string;
  projectId: string;
  arguments: Record<string, unknown>;
}

export interface MCPExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  executionTimeMs: number;
}

export abstract class MCPToolEngineService {
  abstract registerTool(tool: MCPToolDefinition): void;
  abstract executeTool(request: MCPExecutionRequest): Promise<MCPExecutionResult>;
}
