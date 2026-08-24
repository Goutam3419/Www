import { NextRequest, NextResponse } from 'next/server';
import {
  decisionOptimizationEngine,
  failurePredictionService,
  agentTeamFormationService,
  agentAssignmentResolver,
  confidenceEngine,
  agentDecisionReviewService,
} from '@/services/agent-orchestration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, workspaceId = 'ws_default' } = body;

    switch (action) {
      case 'RANK_AGENTS': {
        const { role = 'CODING_AGENT', requiredCapabilities = [], requiredTools = [], taskSimilarityQuery } = body;
        const result = await agentAssignmentResolver.rankAgentCandidates({
          role,
          requiredCapabilities,
          requiredTools,
          workspaceId,
          taskSimilarityQuery,
        });
        return NextResponse.json({ success: true, data: result });
      }

      case 'OPTIMIZE_STRATEGY': {
        const { request, requirements, baseSteps = [] } = body;
        const result = await decisionOptimizationEngine.optimizeDecision(
          request || { workspaceId, userId: 'user_default', prompt: 'Build application' },
          requirements || { objective: 'Build application', projectType: 'FULLSTACK_APP', features: [], integrations: [], databaseRequirements: { type: 'none', isRequired: false }, authenticationRequirements: { provider: 'none', isRequired: false }, storageRequirements: { provider: 'none', isRequired: false }, deploymentTarget: { provider: 'none', isRequired: false }, testingRequirements: { unitTests: true, linting: true, typeChecking: true, buildCheck: true }, securityRequirements: { rbac: true, secretRedaction: true, approvalGates: true }, userConstraints: [] },
          baseSteps
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'PREDICT_FAILURES': {
        const { steps = [], workflowId } = body;
        const result = await failurePredictionService.predictWorkflowFailures(workspaceId, steps, workflowId);
        return NextResponse.json({ success: true, data: result });
      }

      case 'FORM_TEAM': {
        const { workflowId, name, steps = [], userId = 'user_default' } = body;
        const result = await agentTeamFormationService.formTeamForWorkflow({
          workspaceId,
          workflowId,
          name,
          steps,
          userId,
        });
        return NextResponse.json({ success: result.success, data: result });
      }

      case 'CALCULATE_CONFIDENCE': {
        const result = await confidenceEngine.calculateConfidence({
          workspaceId,
          ...body,
        });
        return NextResponse.json({ success: true, data: result });
      }

      case 'CONDUCT_REVIEW': {
        const { topic, proposedStrategy, proposedByRole, proposedByAgentId, maxRounds, workflowId } = body;
        if (!topic || !proposedStrategy) {
          return NextResponse.json({ success: false, error: 'topic and proposedStrategy are required' }, { status: 400 });
        }
        const result = await agentDecisionReviewService.conductDecisionReview({
          workspaceId,
          workflowId,
          topic,
          proposedStrategy,
          proposedByRole,
          proposedByAgentId,
          maxRounds,
        });
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action '${action}'. Available actions: RANK_AGENTS, OPTIMIZE_STRATEGY, PREDICT_FAILURES, FORM_TEAM, CALCULATE_CONFIDENCE, CONDUCT_REVIEW`,
        }, { status: 400 });
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId') || 'ws_default';
  const type = searchParams.get('type') || 'teams';

  if (type === 'reviews') {
    const reviews = agentDecisionReviewService.listReviews(workspaceId);
    return NextResponse.json({ success: true, data: reviews });
  }

  const teams = agentTeamFormationService.listTeams(workspaceId);
  return NextResponse.json({ success: true, data: teams });
}
