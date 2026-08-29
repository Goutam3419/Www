import { UniversalToolDefinition, ToolStatus, ToolCategory, ToolExecutionType, ToolDangerLevel, ToolRiskLevel } from '@/packages/types/src';
import { toolRegistryService } from './tool-registry';
import { toolValidatorService } from './tool-validator';
import { toolPermissionManagerService } from './tool-permission-manager';
import { toolQueueService } from './tool-queue';
import { toolEventManagerService } from './tool-event-manager';
import { toolLoggerService } from './tool-logger';
import { toolManifestParserService } from './tool-manifest-parser';
import { executionManagerService } from './execution-manager';
import { executionApprovalService } from './execution-approval';
import { capabilityDiscoveryService } from './capability-discovery';
import { mcpClientEngine } from './mcp-client';
import { providerAdapterRegistry } from './provider-adapters';
import { TOOL_CATEGORIES } from './tool-categories';

export class ToolEngineFacade {
  public registry = toolRegistryService;
  public validator = toolValidatorService;
  public permissions = toolPermissionManagerService;
  public queue = toolQueueService;
  public events = toolEventManagerService;
  public logger = toolLoggerService;
  public manifest = toolManifestParserService;
  public execution = executionManagerService;
  public approval = executionApprovalService;
  public capabilities = capabilityDiscoveryService;
  public mcp = mcpClientEngine;
  public adapters = providerAdapterRegistry;

  public getTool(id: string): UniversalToolDefinition | undefined {
    return this.registry.getTool(id);
  }

  public discoverTools(filter: {
    category?: ToolCategory;
    status?: ToolStatus;
    executionType?: ToolExecutionType;
    dangerLevel?: ToolDangerLevel;
    searchQuery?: string;
  } = {}) {
    let tools = this.registry.getAllTools();

    if (filter.category) {
      tools = tools.filter(t => t.category === filter.category);
    }
    if (filter.dangerLevel) {
      tools = tools.filter(t => t.dangerLevel === filter.dangerLevel);
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      tools = tools.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return tools;
  }

  public registerTool(toolInput: Partial<UniversalToolDefinition> & { name: string; category: ToolCategory }): UniversalToolDefinition {
    const fullTool: UniversalToolDefinition = {
      description: '',
      dangerLevel: 'Safe' as ToolRiskLevel,
      requiredPermissions: [],
      approvalRequired: false,
      version: '1.0.0',
      provider: 'internal',
      source: 'internal',
      enabled: true,
      inputSchema: { type: 'object', properties: {} },
      capabilities: [],
      ...toolInput,
      id: toolInput.id || `tool_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: toolInput.name,
      category: toolInput.category
    };
    this.registry.registerTool(fullTool);
    return fullTool;
  }

  public importManifest(manifestJson: string): UniversalToolDefinition {
    const parsed = this.manifest.parseManifest(manifestJson);
    this.registry.registerTool(parsed as unknown as UniversalToolDefinition);
    return parsed as unknown as UniversalToolDefinition;
  }

  public setToolStatus(id: string, status: ToolStatus): UniversalToolDefinition | null {
    const tool = this.registry.getTool(id);
    if (!tool) return null;
    const updated = { ...tool, status };
    this.registry.registerTool(updated);
    return updated;
  }

  public validateToolRequest(id: string, inputs: Record<string, unknown> = {}, userRole: string = 'ADMIN') {
    const tool = this.getTool(id);
    if (!tool) {
      return { valid: false, error: 'Tool not found', tool: null, inputValidation: { sanitizedInputs: inputs }, permissionCheck: { allowed: false, reason: 'Tool not found' } };
    }
    const validation = this.validator.validateInputs(tool, inputs);
    const permissionCheck = this.permissions.checkPermission(tool, userRole as Parameters<typeof this.permissions.checkPermission>[1]);
    return {
      valid: validation.valid,
      errors: validation.errors,
      tool,
      inputValidation: validation,
      permissionCheck
    };
  }

  public getQueue(workspaceId?: string) {
    const queue = this.queue.getQueue();
    if (workspaceId) {
      return queue.filter(q => q.workspaceId === workspaceId);
    }
    return queue;
  }

  public stageToolExecution(input: {
    toolId: string;
    workspaceId: string;
    projectId: string;
    userId: string;
    inputs?: Record<string, unknown>;
    executionType?: string;
  }) {
    const tool = this.getTool(input.toolId);
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return this.queue.enqueue(
      executionId,
      input.toolId,
      tool?.name || input.toolId,
      input.workspaceId,
      input.projectId,
      input.userId
    );
  }

  public getLogs(toolId?: string) {
    return this.logger.getLogs(toolId);
  }

  public getEvents(toolId?: string) {
    return this.events.getEvents(toolId);
  }

  public getDiscoverySummary() {
    const allTools = this.registry.getAllTools();
    const categories = TOOL_CATEGORIES.map(c => ({
      name: c.category,
      count: allTools.filter(t => t.category === c.category).length
    }));
    return {
      totalTools: allTools.length,
      categories
    };
  }
}

export const toolEngineFacade = new ToolEngineFacade();
