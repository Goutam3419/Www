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
    const agents = await repos.agents.listByWorkspace(workspaceId);
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: agents
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch agents';
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
    const { workspaceId = 'ws_enterprise_01', name, role, type = 'SPECIALIST', capabilities = [], systemPrompt } = body;
    if (!name || !role) {
      return NextResponse.json({ success: false, error: 'Agent name and role are required' }, { status: 400 });
    }

    const access = await verifyWorkspaceAccess(user.userId, workspaceId, 'MEMBER');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const repos = getRepositories();
    const agent = await repos.agents.create({
      workspaceId,
      name,
      role,
      type,
      status: 'IDLE',
      capabilities,
      systemPrompt
    });
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: agent
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create agent';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

