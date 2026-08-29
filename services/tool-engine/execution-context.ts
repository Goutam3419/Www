import { db } from '@/lib/db/store';
import { ToolExecutionContext, ToolDefinition, UserRole, ToolRiskLevel } from '@/packages/types/src';

export interface BuildContextInput {
  executionId: string;
  tool: ToolDefinition;
  workspaceId: string;
  projectId: string;
  userId: string;
  userRole?: UserRole;
  inputs: Record<string, unknown>;
  conversationId?: string;
  aiSessionId?: string;
  currentGoal?: string;
}

export class ExecutionContextService {
  /**
   * Build & store execution context for a tool execution session
   */
  public buildContext(input: BuildContextInput): ToolExecutionContext {
    const ctx: ToolExecutionContext = {
      executionId: input.executionId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      conversationId: input.conversationId,
      aiSessionId: input.aiSessionId,
      userId: input.userId,
      userRole: input.userRole || 'ADMIN',
      currentGoal: input.currentGoal || 'Execute Tool Request',
      toolId: input.tool.id,
      toolInputs: input.inputs,
      permissions: input.tool.requiredPermissions || [],
      dangerLevel: input.tool.dangerLevel,
      riskLevel: (input.tool.dangerLevel as unknown as ToolRiskLevel) || 'Safe',
      environment: process.env.NODE_ENV || 'development'
    };

    return db.saveToolExecutionContext(ctx);
  }

  /**
   * Get stored context
   */
  public getContext(executionId: string): ToolExecutionContext | undefined {
    return db.getToolExecutionContext(executionId);
  }
}

export const executionContextService = new ExecutionContextService();
