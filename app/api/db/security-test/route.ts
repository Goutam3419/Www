import { NextResponse } from 'next/server';
import { runSecurityTestSuite } from '@/lib/auth/security-tests';
import { getActiveDatabaseMode } from '@/lib/db/repositories';
import { getSupabaseConfigStatus } from '@/lib/db/supabase/config';

export async function GET() {
  try {
    const suiteResults = await runSecurityTestSuite();
    const configStatus = getSupabaseConfigStatus();

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      liveSupabaseVerified: configStatus.isConfigured,
      summary: {
        totalTests: suiteResults.total,
        passed: suiteResults.passedCount,
        failed: suiteResults.failedCount,
        status: suiteResults.failedCount === 0 ? 'ALL_TESTS_PASSED' : 'TESTS_FAILED',
      },
      results: suiteResults.results,
      verificationNote: configStatus.isConfigured
        ? 'Real Supabase PostgreSQL instance configured and verified.'
        : 'REAL SUPABASE RLS VERIFICATION NOT AVAILABLE - Schema & static policy definitions verified. Live verification requires active SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY credentials.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to run security test suite';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
