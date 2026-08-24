import { ToolExecutionContext, ToolExecutionResult, WorkspaceRole } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { toolRegistryService } from '@/services/tool-engine/tool-registry';
import { usageControlEngine } from '@/services/workspace/usage-control-engine';
import { resolveAIProviderCredentials, sanitizeOutput } from './credentials';

export class AIProviderToolExecutorService {
  public async executeTool(
    toolId: string,
    context: ToolExecutionContext,
    input: Record<string, unknown> = {}
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // Determine provider from toolId prefix or input
    let provider: 'anthropic' | 'openai' | 'openrouter' = 'anthropic';
    if (toolId.startsWith('openai_')) {
      provider = 'openai';
    } else if (toolId.startsWith('openrouter_')) {
      provider = 'openrouter';
    } else if (toolId.startsWith('anthropic_')) {
      provider = 'anthropic';
    }

    // 1. Cross-Workspace Protection
    if (input.resourceWorkspaceId && input.resourceWorkspaceId !== context.workspaceId) {
      return {
        success: false,
        toolId,
        provider,
        executionId: context.executionId,
        error: 'Cross-workspace access blocked: target resource workspace does not match execution workspace context.',
        output: { status: 'BLOCKED_CROSS_WORKSPACE' },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }

    // 2. Fetch Tool Definition for Security Checks
    const toolDef = toolRegistryService.getTool(toolId);

    // 3. Role & Permission Verification
    if (toolDef) {
      if (context.userRole === 'VIEWER' && toolDef.dangerLevel !== 'Safe') {
        dbStore.recordPermissionAuditEvent({
          workspaceId: context.workspaceId,
          userId: context.userId,
          eventType: 'ACCESS_DENIED',
          role: (context.userRole as WorkspaceRole) || 'MEMBER',
          permission: toolDef.requiredPermissions[0] || 'ai:execute',
          resourceType: 'ai_resource',
          resourceId: toolId,
          details: 'Role VIEWER insufficient for AI execution operation'
        });

        return {
          success: false,
          toolId,
          provider,
          executionId: context.executionId,
          error: 'Permission denied: VIEWER role cannot perform non-SAFE operations.',
          output: { status: 'PERMISSION_DENIED' },
          durationMs: Date.now() - startTime,
          retryCount: 0
        };
      }

      // 4. Approval Enforcement for High Risk Operations
      if (toolDef.approvalRequired || toolDef.dangerLevel === 'High') {
        if (!input.approvalGranted && context.userRole !== 'ADMIN' && context.userRole !== 'OWNER') {
          return {
            success: false,
            toolId,
            provider,
            executionId: context.executionId,
            error: `Administrative approval required for high-risk operation: ${toolId}`,
            metadata: { approvalRequired: true, dangerLevel: toolDef.dangerLevel },
            output: { status: 'APPROVAL_REQUIRED', toolId },
            durationMs: Date.now() - startTime,
            retryCount: 0
          };
        }
      }
    }

    // 5. Credential Resolution
    const creds = resolveAIProviderCredentials(
      provider,
      context.workspaceId,
      context.userId,
      input.inputApiKey as string || input.apiKey as string
    );

    if (!creds || !creds.apiKey) {
      return {
        success: false,
        toolId,
        provider,
        executionId: context.executionId,
        error: `AI_PROVIDER_NOT_CONFIGURED: API credentials are not configured for ${provider}.`,
        output: { status: 'NOT_CONFIGURED', provider, message: `Missing API key for ${provider}` },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }

    // 6. Quota Validation
    const quotaResult = usageControlEngine.validateQuota(context.workspaceId, 'TOOL_EXECUTIONS', 1);
    if (!quotaResult.allowed) {
      return {
        success: false,
        toolId,
        provider,
        executionId: context.executionId,
        error: `AI_PROVIDER_QUOTA_EXCEEDED: Workspace quota exceeded for ${provider}.`,
        output: { status: 'QUOTA_EXCEEDED', reason: quotaResult.reason },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }

    // 7. Execution Routing
    try {
      let rawResult: Record<string, unknown> = {};

      switch (toolId) {
        // --- ANTHROPIC ---
        case 'anthropic_model_list':
          rawResult = await this.anthropicModelList(creds.apiKey);
          break;
        case 'anthropic_message_create':
          rawResult = await this.anthropicMessageCreate(creds.apiKey, input);
          break;
        case 'anthropic_stream_message':
          rawResult = await this.anthropicMessageCreate(creds.apiKey, { ...input, stream: true });
          break;

        // --- OPENAI ---
        case 'openai_model_list':
          rawResult = await this.openaiModelList(creds.apiKey);
          break;
        case 'openai_chat_completion':
          rawResult = await this.openaiChatCompletion(creds.apiKey, input);
          break;
        case 'openai_stream_completion':
          rawResult = await this.openaiChatCompletion(creds.apiKey, { ...input, stream: true });
          break;
        case 'openai_embedding':
          rawResult = await this.openaiEmbedding(creds.apiKey, input);
          break;

        // --- OPENROUTER ---
        case 'openrouter_model_list':
          rawResult = await this.openrouterModelList(creds.apiKey);
          break;
        case 'openrouter_chat_completion':
          rawResult = await this.openrouterChatCompletion(creds.apiKey, input);
          break;
        case 'openrouter_stream_completion':
          rawResult = await this.openrouterChatCompletion(creds.apiKey, { ...input, stream: true });
          break;

        default:
          return {
            success: false,
            toolId,
            provider,
            executionId: context.executionId,
            error: `AI_PROVIDER_INVALID_REQUEST: Unknown tool ID ${toolId}`,
            output: { status: 'UNKNOWN_TOOL' },
            durationMs: Date.now() - startTime,
            retryCount: 0
          };
      }

      // Check if error response from REST wrapper
      if (rawResult.status && typeof rawResult.status === 'string' && rawResult.status.startsWith('AI_PROVIDER_')) {
        return {
          success: false,
          toolId,
          provider,
          executionId: context.executionId,
          error: String(rawResult.error || rawResult.status),
          output: rawResult,
          durationMs: Date.now() - startTime,
          retryCount: 0
        };
      }

      // 8. Record Usage & Audit
      usageControlEngine.recordUsage(context.workspaceId, 'TOOL_EXECUTIONS', 1, context.userId, toolId);

      if (toolDef && toolDef.dangerLevel !== 'Safe') {
        dbStore.recordPermissionAuditEvent({
          workspaceId: context.workspaceId,
          userId: context.userId,
          eventType: 'ACCESS_GRANTED',
          role: (context.userRole as WorkspaceRole) || 'MEMBER',
          permission: toolDef.requiredPermissions[0] || 'ai:execute',
          resourceType: 'ai_resource',
          resourceId: toolId,
          details: `Executed AI provider operation ${toolId} on ${provider}`
        });
      }

      // 9. Sanitize Output
      const cleanOutput = sanitizeOutput(rawResult);

      return {
        success: true,
        toolId,
        provider,
        executionId: context.executionId,
        output: cleanOutput as Record<string, unknown>,
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    } catch (error: unknown) {
      return {
        success: false,
        toolId,
        provider,
        executionId: context.executionId,
        error: error instanceof Error ? error.message : 'AI_PROVIDER_EXECUTION_FAILED',
        output: { status: 'EXECUTION_ERROR' },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }
  }

  // --- REST WRAPPERS ---

  private async fetchApi(
    url: string,
    headers: Record<string, string>,
    options: RequestInit = {}
  ): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...(options.headers as Record<string, string> || {})
        }
      });

      const contentType = response.headers.get('content-type');
      let data: unknown = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { text: await response.text() };
      }

      if (!response.ok) {
        let errCode = 'AI_PROVIDER_EXECUTION_FAILED';
        if (response.status === 401 || response.status === 403) errCode = 'AI_PROVIDER_AUTH_FAILED';
        if (response.status === 429) errCode = 'AI_PROVIDER_RATE_LIMITED';
        if (response.status === 400) errCode = 'AI_PROVIDER_INVALID_REQUEST';
        if (response.status === 404) errCode = 'AI_PROVIDER_MODEL_NOT_FOUND';

        return {
          status: errCode,
          statusCode: response.status,
          error: `${errCode}: HTTP ${response.status}`,
          details: data
        };
      }

      return {
        status: 'SUCCESS',
        data
      };
    } catch (err: unknown) {
      return {
        status: 'AI_PROVIDER_EXECUTION_FAILED',
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  // --- ANTHROPIC IMPLEMENTATION ---

  private async anthropicModelList(apiKey: string): Promise<Record<string, unknown>> {
    const res = await this.fetchApi(
      'https://api.anthropic.com/v1/models',
      {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    );

    if (res.status === 'SUCCESS') return res;

    // Default fallback structured list if endpoint is 404 or restricted
    return {
      status: 'SUCCESS',
      data: {
        object: 'list',
        data: [
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' }
        ]
      }
    };
  }

  private async anthropicMessageCreate(apiKey: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const model = String(input.model || 'claude-3-5-sonnet-20241022');
    const messages = input.messages || [{ role: 'user', content: String(input.prompt || 'Hello') }];
    const maxTokens = Number(input.maxTokens || input.max_tokens || 1024);
    const stream = Boolean(input.stream);

    return this.fetchApi(
      'https://api.anthropic.com/v1/messages',
      {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      {
        method: 'POST',
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          stream
        })
      }
    );
  }

  // --- OPENAI IMPLEMENTATION ---

  private async openaiModelList(apiKey: string): Promise<Record<string, unknown>> {
    const res = await this.fetchApi(
      'https://api.openai.com/v1/models',
      { Authorization: `Bearer ${apiKey}` }
    );

    if (res.status === 'SUCCESS') return res;

    return {
      status: 'SUCCESS',
      data: {
        object: 'list',
        data: [
          { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
          { id: 'o1-preview', name: 'o1 Preview', provider: 'openai' },
          { id: 'text-embedding-3-small', name: 'Text Embedding 3 Small', provider: 'openai' }
        ]
      }
    };
  }

  private async openaiChatCompletion(apiKey: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const model = String(input.model || 'gpt-4o-mini');
    const messages = input.messages || [{ role: 'user', content: String(input.prompt || 'Hello') }];
    const stream = Boolean(input.stream);

    return this.fetchApi(
      'https://api.openai.com/v1/chat/completions',
      { Authorization: `Bearer ${apiKey}` },
      {
        method: 'POST',
        body: JSON.stringify({
          model,
          messages,
          stream
        })
      }
    );
  }

  private async openaiEmbedding(apiKey: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const model = String(input.model || 'text-embedding-3-small');
    const inputContent = input.input || input.text || 'Hello world';

    return this.fetchApi(
      'https://api.openai.com/v1/embeddings',
      { Authorization: `Bearer ${apiKey}` },
      {
        method: 'POST',
        body: JSON.stringify({
          model,
          input: inputContent
        })
      }
    );
  }

  // --- OPENROUTER IMPLEMENTATION ---

  private async openrouterModelList(apiKey: string): Promise<Record<string, unknown>> {
    const res = await this.fetchApi(
      'https://openrouter.ai/api/v1/models',
      { Authorization: `Bearer ${apiKey}` }
    );

    if (res.status === 'SUCCESS') return res;

    return {
      status: 'SUCCESS',
      data: {
        data: [
          { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)', provider: 'openrouter' },
          { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)', provider: 'openrouter' },
          { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5 (OpenRouter)', provider: 'openrouter' }
        ]
      }
    };
  }

  private async openrouterChatCompletion(apiKey: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const model = String(input.model || 'openai/gpt-4o-mini');
    const messages = input.messages || [{ role: 'user', content: String(input.prompt || 'Hello') }];
    const stream = Boolean(input.stream);

    return this.fetchApi(
      'https://openrouter.ai/api/v1/chat/completions',
      { Authorization: `Bearer ${apiKey}` },
      {
        method: 'POST',
        body: JSON.stringify({
          model,
          messages,
          stream
        })
      }
    );
  }
}

export const aiProviderToolExecutorService = new AIProviderToolExecutorService();
