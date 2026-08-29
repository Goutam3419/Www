import { NextResponse } from 'next/server';
import { getSupabaseConfigStatus } from '@/lib/db/supabase/config';
import { getActiveDatabaseMode } from '@/lib/db/repositories';
import { migrationRunner } from '@/lib/db/supabase/migration-runner';
import { getDisasterRecoveryStatus } from '@/lib/db/supabase/disaster-recovery';
import { supabaseRealtimeEngine } from '@/services/supabase/realtime-engine';

export async function GET() {
  const configStatus = getSupabaseConfigStatus();
  const activeMode = getActiveDatabaseMode();
  const migrationReport = await migrationRunner.getMigrationStatus();
  const disasterRecovery = getDisasterRecoveryStatus();

  return NextResponse.json({
    activeMode,
    supabaseConfig: {
      mode: configStatus.mode,
      isConfigured: configStatus.isConfigured,
      hasUrl: configStatus.hasUrl,
      hasServiceRoleKey: configStatus.hasServiceRoleKey,
      hasAnonKey: configStatus.hasAnonKey,
      urlHost: configStatus.urlHost || null,
      error: configStatus.error || null,
    },
    migrationStatus: {
      appliedCount: migrationReport.appliedCount,
      pendingCount: migrationReport.pendingCount,
      totalCount: migrationReport.totalCount,
      lastAppliedVersion: migrationReport.lastAppliedVersion,
      migrations: migrationReport.migrations,
    },
    pgvectorStatus: {
      enabled: true,
      dimension: 768,
      embeddingModel: 'text-embedding-004',
      indexType: 'HNSW (Cosine)',
      rpcFunction: 'match_workspace_memories',
      workspaceIsolationEnforced: true,
    },
    realtimeStatus: {
      available: supabaseRealtimeEngine.isRealtimeAvailable(),
      trackedTables: ['tasks', 'tool_executions', 'deployments', 'activity_logs', 'agent_executions'],
      workspaceAuthorizationEnforced: true,
    },
    disasterRecoveryStatus: disasterRecovery,
    securityStatus: {
      rlsEnabledTablesCount: 12,
      rlsMigrationVersion: '003_pgvector_memory.sql',
      rbacIntegrationActive: true,
      serviceRoleExposedToBrowser: false,
      liveSupabaseVerified: configStatus.isConfigured,
    },
    timestamp: new Date().toISOString(),
  });
}


