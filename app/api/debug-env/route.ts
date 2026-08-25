import { NextResponse } from 'next/server';
import { getSupabaseConfigStatus } from '@/lib/db/supabase/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getSupabaseConfigStatus();
  return NextResponse.json({
    mode: status.mode,
    isConfigured: status.isConfigured,
    hasUrl: status.hasUrl,
    hasServiceRoleKey: status.hasServiceRoleKey,
    hasAnonKey: status.hasAnonKey,
    urlHost: status.urlHost,
    rawDatabaseMode: process.env.DATABASE_MODE || 'NOT_SET',
    rawHasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    rawHasNextPublicSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    rawHasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
