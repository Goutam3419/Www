import { NextRequest, NextResponse } from 'next/server';
import { getRepositories, getActiveDatabaseMode } from '@/lib/db/repositories';
import { db } from '@/lib/db/store';
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
    const projects = await repos.projects.listByWorkspace(workspaceId);
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: projects
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects';
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
    const { name, workspaceId, description, framework = 'Next.js 15', language = 'TypeScript', status = 'Planning' } = body;
    if (!name || !workspaceId) {
      return NextResponse.json({ success: false, error: 'Project name and workspaceId are required' }, { status: 400 });
    }

    const access = await verifyWorkspaceAccess(user.userId, workspaceId, 'MEMBER');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const repos = getRepositories();
    const project = await repos.projects.create({
      name,
      workspaceId,
      description: description || '',
      framework,
      language,
      status,
      createdAt: new Date().toISOString()
    });

    db.addLog(project.id, 'INFO', 'ProjectManager', `Project "${project.name}" created successfully.`);
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: project
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


