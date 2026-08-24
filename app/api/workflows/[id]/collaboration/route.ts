import { NextRequest, NextResponse } from 'next/server';
import { getRepositories, getActiveDatabaseMode } from '@/lib/db/repositories';
import { getAuthenticatedUser, verifyWorkspaceAccess } from '@/lib/auth/server-auth';
import { agentCollaborationBus } from '@/services/agent-orchestration/agent-collaboration-bus';
import { agentContextManager } from '@/services/agent-orchestration/agent-context-manager';
import { agentArtifactRegistry } from '@/services/agent-orchestration/agent-artifact-registry';
import { agentHandoffEngine } from '@/services/agent-orchestration/agent-handoff-engine';
import { agentCoordinationService } from '@/services/agent-orchestration/agent-coordination-service';
import { sanitizeSecretsInValue } from '@/services/agent-orchestration/workflow-state-manager';

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

    const session = agentCollaborationBus.getOrCreateSession(workflow.workspaceId, id);
    const messages = agentCollaborationBus.getSessionMessages(workflow.workspaceId, id);
    const context = agentContextManager.getContext(workflow.workspaceId, id);
    const artifacts = agentArtifactRegistry.listWorkflowArtifacts(workflow.workspaceId, id);
    const handoffs = agentHandoffEngine.listHandoffs(workflow.workspaceId, id);
    const reviews = agentCoordinationService.listReviews(workflow.workspaceId, id);
    const ceoDecisions = agentCoordinationService.getCeoDecisions(workflow.workspaceId, id);

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: {
        session,
        messages: sanitizeSecretsInValue(messages),
        context: sanitizeSecretsInValue(context),
        artifacts: sanitizeSecretsInValue(artifacts),
        handoffs: sanitizeSecretsInValue(handoffs),
        reviews: sanitizeSecretsInValue(reviews),
        ceoDecisions: sanitizeSecretsInValue(ceoDecisions),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collaboration details';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
