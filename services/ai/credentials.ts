import { db } from '@/lib/db/store';

export interface AIProviderCredentials {
  apiKey?: string;
  source: 'workspace_connection' | 'environment' | 'input';
}

/**
 * Server-only credential resolver for AI Model Providers (Anthropic, OpenAI, OpenRouter).
 * Priority order:
 * 1. Direct input parameters (if provided)
 * 2. Workspace connection settings in store
 * 3. Environment variables
 */
export function resolveAIProviderCredentials(
  provider: 'anthropic' | 'openai' | 'openrouter',
  workspaceId?: string,
  _userId?: string,
  inputApiKey?: string
): AIProviderCredentials | null {
  // 1. Direct input override
  if (inputApiKey && typeof inputApiKey === 'string' && inputApiKey.trim().length > 0) {
    return {
      apiKey: inputApiKey.trim(),
      source: 'input'
    };
  }

  // 2. Workspace connection settings
  if (workspaceId) {
    try {
      const storeWithIntegrations = db as unknown as {
        getWorkspaceIntegrations?: (id: string) => Array<{ provider: string; status: string; config?: Record<string, string> }>;
      };
      const integrations = storeWithIntegrations.getWorkspaceIntegrations ? storeWithIntegrations.getWorkspaceIntegrations(workspaceId) : [];
      const match = integrations.find(
        i => i.provider === provider && i.status === 'CONNECTED'
      );
      if (match && match.config) {
        const config = match.config as Record<string, string>;
        const key = config.apiKey || config.api_key || config.token || config.secret;
        if (key && typeof key === 'string' && key.trim().length > 0) {
          return {
            apiKey: key.trim(),
            source: 'workspace_connection'
          };
        }
      }
    } catch {
      // Ignore lookup error
    }
  }

  // 3. Environment variables
  let envKey: string | undefined;
  if (provider === 'anthropic') {
    envKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  } else if (provider === 'openai') {
    envKey = process.env.OPENAI_API_KEY;
  } else if (provider === 'openrouter') {
    envKey = process.env.OPENROUTER_API_KEY;
  }

  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return {
      apiKey: envKey.trim(),
      source: 'environment'
    };
  }

  return null;
}

/**
 * Sanitizes output data so API keys, tokens, and authorization headers never appear in results or logs.
 */
export function sanitizeOutput<T = unknown>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeOutput) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  const secretKeys = [
    'accesstoken',
    'access_token',
    'refreshtoken',
    'refresh_token',
    'token',
    'apikey',
    'api_key',
    'secret',
    'client_secret',
    'private_key',
    'privatekey',
    'authorization',
    'auth',
    'password',
    'x-api-key'
  ];

  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (secretKeys.some(s => lowerKey.includes(s))) {
      sanitized[k] = '[REDACTED_SECRET]';
    } else if (v && typeof v === 'object') {
      sanitized[k] = sanitizeOutput(v);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized as T;
}
