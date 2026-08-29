import { NextRequest, NextResponse } from 'next/server';
import { getRepositories, getActiveDatabaseMode } from '@/lib/db/repositories';
import { getAuthenticatedUser, verifyWorkspaceAccess } from '@/lib/auth/server-auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const access = await verifyWorkspaceAccess(user.userId, workspaceId);
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const repos = getRepositories();
    const policy = await repos.governance.getPolicy(workspaceId);
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: policy
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch governance policy';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId = 'ws_enterprise_01', ...policyUpdates } = body;

    const access = await verifyWorkspaceAccess(user.userId, workspaceId, 'ADMIN');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const repos = getRepositories();
    const updated = await repos.governance.updatePolicy(workspaceId, policyUpdates);
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: updated
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update governance policy';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

