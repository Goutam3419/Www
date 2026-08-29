import { NextRequest, NextResponse } from 'next/server';
import { getRepositories, getActiveDatabaseMode } from '@/lib/db/repositories';
import { getAuthenticatedUser, verifyWorkspaceAccess } from '@/lib/auth/server-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const { id } = await params;
    const repos = getRepositories();
    const workflow = await repos.workflows.get(id);

    if (!workflow) {
      return NextResponse.json({ success: false, error: `Workflow '${id}' not found` }, { status: 404 });
    }

    const access = await verifyWorkspaceAccess(user.userId, workflow.workspaceId);
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const events = await repos.workflows.listEvents(id);

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: {
        workflow,
        events,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch workflow';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
