import { DatabaseConfigError } from './errors';

export type DatabaseMode = 'in-memory' | 'supabase';

export interface SupabaseConfigStatus {
  mode: DatabaseMode;
  isConfigured: boolean;
  hasUrl: boolean;
  hasServiceRoleKey: boolean;
  hasAnonKey: boolean;
  urlHost?: string;
  error?: string;
}

export function getDatabaseMode(): DatabaseMode {
  const mode = process.env.DATABASE_MODE?.toLowerCase();
  if (mode === 'supabase') return 'supabase';
  return 'in-memory';
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const mode = getDatabaseMode();

  const hasUrl = Boolean(url && url.trim().length > 0);
  const hasServiceRoleKey = Boolean(serviceRoleKey && serviceRoleKey.trim().length > 0);
  const hasAnonKey = Boolean(anonKey && anonKey.trim().length > 0);

  const isConfigured = hasUrl && (hasServiceRoleKey || hasAnonKey);

  let urlHost: string | undefined = undefined;
  if (hasUrl) {
    try {
      urlHost = new URL(url).hostname;
    } catch {
      urlHost = 'invalid-url';
    }
  }

  let error: string | undefined = undefined;
  if (mode === 'supabase' && !isConfigured) {
    error = 'DATABASE_MODE is set to "supabase", but required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing.';
  }

  return {
    mode,
    isConfigured,
    hasUrl,
    hasServiceRoleKey,
    hasAnonKey,
    urlHost,
    error,
  };
}

export function validateSupabaseConfig(): void {
  const status = getSupabaseConfigStatus();
  if (status.mode === 'supabase' && !status.isConfigured) {
    throw new DatabaseConfigError(status.error || 'Supabase is not configured properly.');
  }
}
