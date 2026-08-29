import { RepositorySuite } from './contracts';
import { createInMemoryRepositorySuite } from './in-memory-adapter';
import { createSupabaseRepositorySuite } from './supabase-adapter';
import { getSupabaseConfigStatus, DatabaseMode } from '../supabase/config';

let activeSuite: RepositorySuite | null = null;

export function getRepositories(): RepositorySuite {
  if (activeSuite) return activeSuite;

  const status = getSupabaseConfigStatus();

  if (status.mode === 'supabase') {
    if (!status.isConfigured) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL DATABASE CONFIGURATION ERROR: DATABASE_MODE=supabase requested in production but Supabase is not properly configured. Failing closed.');
      }
      console.warn('DATABASE_MODE=supabase requested but credentials missing in dev. Using In-Memory fallback.');
    } else {
      try {
        activeSuite = createSupabaseRepositorySuite();
        return activeSuite;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`FATAL DATABASE INITIALIZATION ERROR in production: ${err instanceof Error ? err.message : String(err)}. Failing closed.`);
        }
        console.warn('Failed to initialize Supabase repositories in dev, falling back to In-Memory repository suite:', err);
      }
    }
  }

  activeSuite = createInMemoryRepositorySuite();
  return activeSuite;
}

export const getRepositorySuite = getRepositories;

export function getActiveDatabaseMode(): DatabaseMode {
  const status = getSupabaseConfigStatus();
  if (status.mode === 'supabase' && status.isConfigured) {
    return 'supabase';
  }
  return 'in-memory';
}

export function resetRepositorySuiteCache(): void {
  activeSuite = null;
}

export * from './contracts';
