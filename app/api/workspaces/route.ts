import { NextRequest, NextResponse } from 'next/server';
import { getRepositories, getActiveDatabaseMode } from '@/lib/db/repositories';
import { db } from '@/lib/db/store';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const repos = getRepositories();
    const allWorkspaces = await repos.workspaces.list();
    
    // Filter workspaces user is a member/owner of
    const userWorkspaces = [];
    for (const ws of allWorkspaces) {
      const members = await repos.workspaceMembers.getByWorkspace(ws.id);
      if (ws.ownerUserId === user.userId || members.some(m => m.userId.toLowerCase() === user.userId.toLowerCase())) {
        userWorkspaces.push(ws);
      }
    }

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      user: { userId: user.userId, email: user.email },
      data: userWorkspaces
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch workspaces';
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
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Workspace name is required' }, { status: 400 });
    }
    const repos = getRepositories();
    const workspace = await repos.workspaces.create({
      name: body.name,
      description: body.description || '',
      ownerUserId: user.userId,
      status: body.status || 'ACTIVE'
    });

    // Auto-add creator as OWNER
    await repos.workspaceMembers.addMember(workspace.id, {
      workspaceId: workspace.id,
      userId: user.userId,
      email: user.email,
      name: user.email.split('@')[0] || user.userId,
      role: 'OWNER',
      status: 'ACTIVE'
    });


    db.saveWorkspaceProfile(workspace);

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: workspace
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create workspace';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


