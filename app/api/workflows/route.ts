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
    const workflows = await repos.workflows.listByWorkspace(workspaceId);
    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: workflows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch workflows';
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
    const {
      workspaceId = 'ws_enterprise_01',
      projectId,
      name,
      description,
      steps = [],
      prompt,
      objective,
      constraints = [],
      preferences = {},
    } = body;

    const access = await verifyWorkspaceAccess(user.userId, workspaceId, 'MEMBER');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const naturalPrompt = prompt || objective;
    if (naturalPrompt) {
      const { dynamicWorkflowPlanner } = await import('@/services/agent-orchestration/dynamic-workflow-planner');
      const plan = await dynamicWorkflowPlanner.planWorkflow({
        prompt: naturalPrompt,
        workspaceId,
        userId: user.userId,
        projectId,
        name,
        description,
        constraints,
        preferences,
      });

      if (plan.planningStatus !== 'SUCCESS') {
        return NextResponse.json({
          success: false,
          planningStatus: plan.planningStatus,
          error: plan.decisions[plan.decisions.length - 1]?.rationale || 'Planning failed',
          missingCapabilities: plan.missingCapabilities,
          plan,
        }, { status: 422 });
      }

      return NextResponse.json({
        success: true,
        mode: getActiveDatabaseMode(),
        workflowId: plan.workflowId,
        objective: plan.objective,
        requirements: plan.requirements,
        plannedSteps: plan.plannedSteps,
        dependencies: plan.dependencies,
        assignedAgents: plan.assignedAgents,
        selectedTools: plan.selectedTools,
        parallelGroups: plan.parallelGroups,
        approvalRequiredSteps: plan.approvalRequiredSteps,
        estimatedExecutionInfo: plan.estimatedExecutionInfo,
        planningStatus: plan.planningStatus,
        data: plan.workflow,
        plan,
      });
    }

    if (!name) {
      return NextResponse.json({ success: false, error: 'Workflow name or prompt is required' }, { status: 400 });
    }

    const repos = getRepositories();
    const workflow = await repos.workflows.create({
      workspaceId,
      projectId,
      name,
      description: description || '',
      status: 'PLANNED',
      steps,
    });

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: workflow,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create workflow';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
