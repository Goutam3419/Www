import { db } from '@/lib/db/store';

export interface GoogleCredentials {
  accessToken?: string;
  apiKey?: string;
  source: 'workspace_connection' | 'environment' | 'input';
}

/**
 * Server-only credential resolver for Google / Google Workspace operations.
 * Priority order:
 * 1. Direct input parameters (if server-authorized)
 * 2. Workspace connection settings in store
 * 3. Environment configuration
 */
export function resolveGoogleCredentials(
  workspaceId?: string,
  _userId?: string,
  inputAccessToken?: string,
  inputApiKey?: string
): GoogleCredentials | null {
  // 1. Direct input override
  if (inputAccessToken && typeof inputAccessToken === 'string' && inputAccessToken.trim().length > 0) {
    return {
      accessToken: inputAccessToken.trim(),
      apiKey: inputApiKey?.trim(),
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
      const googleIntegration = integrations.find(
        i => (i.provider === 'google' || i.provider === 'google_workspace') && i.status === 'CONNECTED'
      );
      if (googleIntegration && googleIntegration.config) {
        const config = googleIntegration.config as Record<string, string>;
        const token = config.accessToken || config.access_token || config.GOOGLE_ACCESS_TOKEN || config.token;
        const key = config.apiKey || config.api_key || config.GOOGLE_API_KEY;
        if (token || key) {
          return {
            accessToken: token,
            apiKey: key,
            source: 'workspace_connection'
          };
        }
      }
    } catch {
      // Ignore lookup error
    }
  }

  // 3. Environment variables
  const envToken =
    process.env.GOOGLE_ACCESS_TOKEN ||
    process.env.GOOGLE_WORKSPACE_TOKEN ||
    process.env.GCP_ACCESS_TOKEN;

  const envApiKey =
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_WORKSPACE_API_KEY;

  if (envToken || envApiKey) {
    return {
      accessToken: envToken,
      apiKey: envApiKey,
      source: 'environment'
    };
  }

  return null;
}

/**
 * Sanitizes output data so OAuth tokens, API keys, and credentials never appear in results or logs.
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
    'password'
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
