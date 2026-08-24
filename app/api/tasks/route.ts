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
    const tasks = await repos.tasks.listByWorkspace(workspaceId);
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: tasks
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
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
    const { workspaceId = 'ws_enterprise_01', projectId, title, description, priority = 'MEDIUM', assignedAgentId } = body;
    if (!title) {
      return NextResponse.json({ success: false, error: 'Task title is required' }, { status: 400 });
    }

    const access = await verifyWorkspaceAccess(user.userId, workspaceId, 'MEMBER');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const repos = getRepositories();
    const task = await repos.tasks.create({
      workspaceId,
      projectId,
      title,
      description,
      status: 'PENDING',
      priority,
      assignedAgentId
    });
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: task
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

