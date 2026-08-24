import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfigStatus } from './config';
import { DatabaseConfigError } from './errors';

let serverClientInstance: SupabaseClient | null = null;

/**
 * Server-only Supabase client getter.
 * Initializes and caches the Supabase admin/server client using the SERVICE ROLE KEY.
 * NEVER expose this client or service role key to browser code.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  // Enforce server runtime check
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: getSupabaseServerClient cannot be called on the client/browser.');
  }

  const status = getSupabaseConfigStatus();

  if (!status.isConfigured || !status.hasUrl || !status.hasServiceRoleKey) {
    if (status.mode === 'supabase') {
      throw new DatabaseConfigError('Cannot initialize Supabase server client: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    }
    return null;
  }

  if (!serverClientInstance) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    serverClientInstance = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serverClientInstance;
}

/**
 * Client-safe Supabase client initializer for public operations.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    return getSupabaseBrowserClient();
  }
  return getSupabaseServerClient();
}
