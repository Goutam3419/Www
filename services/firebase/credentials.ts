import { db } from '@/lib/db/store';

export interface FirebaseCredentials {
  projectId: string;
  token: string;
  clientEmail?: string;
  privateKey?: string;
  source: 'environment' | 'workspace_connection' | 'input';
}

/**
 * Server-only credential resolver for Firebase operations.
 * Priority order:
 * 1. Direct input parameters (if server-authorized)
 * 2. Workspace connection settings in store
 * 3. Environment configuration
 */
export function resolveFirebaseCredentials(
  workspaceId?: string,
  _userId?: string,
  inputProjectId?: string,
  inputToken?: string
): FirebaseCredentials | null {
  // 1. Check direct input
  if (inputProjectId && inputProjectId.trim().length > 0 && inputToken && inputToken.trim().length > 0) {
    return {
      projectId: inputProjectId.trim(),
      token: inputToken.trim(),
      source: 'input'
    };
  }

  // 2. Check Workspace connection from store
  if (workspaceId) {
    try {
      const storeWithIntegrations = db as unknown as { getWorkspaceIntegrations?: (id: string) => Array<{ provider: string; status: string; config?: Record<string, string> }> };
      const integrations = storeWithIntegrations.getWorkspaceIntegrations ? storeWithIntegrations.getWorkspaceIntegrations(workspaceId) : [];
      const fbIntegration = integrations.find(i => i.provider === 'firebase' && i.status === 'CONNECTED');
      if (fbIntegration && fbIntegration.config) {
        const config = fbIntegration.config as Record<string, string>;
        const pId = config.projectId || config.FIREBASE_PROJECT_ID;
        const tok = config.token || config.apiKey || config.FIREBASE_TOKEN;
        if (pId && tok) {
          return {
            projectId: pId,
            token: tok,
            clientEmail: config.clientEmail,
            source: 'workspace_connection'
          };
        }
      }
    } catch {
      // Ignore if workspace lookup fails
    }
  }

  // 3. Check environment variables
  const envProjectId =
    inputProjectId ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCP_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const envToken =
    (inputToken && typeof inputToken === 'string' && inputToken.trim().length > 0 ? inputToken.trim() : null) ||
    process.env.FIREBASE_TOKEN ||
    process.env.FIREBASE_API_KEY ||
    process.env.GCP_ACCESS_TOKEN;

  if (envProjectId && envProjectId.trim().length > 0 && envToken && envToken.trim().length > 0) {
    return {
      projectId: envProjectId.trim(),
      token: envToken.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      source: 'environment'
    };
  }

  return null;
}

/**
 * Sanitizes object to ensure secrets, tokens, and keys are never returned in results or audit logs
 */
export function sanitizeOutput<T = unknown>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeOutput) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  const secretKeys = [
    'token',
    'accesstoken',
    'firebasetoken',
    'privatekey',
    'private_key',
    'secret',
    'password',
    'passwordhash',
    'serviceaccount',
    'apikey',
    'api_key'
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
