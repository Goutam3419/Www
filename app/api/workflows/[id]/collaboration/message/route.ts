import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/db/repositories';
import { getAuthenticatedUser, verifyWorkspaceAccess } from '@/lib/auth/server-auth';
import { agentCollaborationBus } from '@/services/agent-orchestration/agent-collaboration-bus';
import { AgentMessageType, AgentRole } from '@/packages/types/src';

export async function POST(
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

    const body = await req.json();
    const {
      fromAgentRole = 'CEO_AGENT',
      fromAgentId = user.userId,
      toAgentRole,
      toAgentId,
      messageType = 'REQUEST',
      content,
      payload,
      stepId,
      correlationId,
    } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 });
    }

    const session = agentCollaborationBus.getOrCreateSession(workflow.workspaceId, id);

    const message = await agentCollaborationBus.publishMessage({
      workspaceId: workflow.workspaceId,
      workflowId: id,
      sessionId: session.sessionId,
      stepId,
      fromAgentId,
      fromAgentRole: fromAgentRole as AgentRole,
      toAgentId,
      toAgentRole: toAgentRole as AgentRole,
      messageType: messageType as AgentMessageType,
      content,
      payload,
      correlationId,
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish collaboration message';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
