import {
  AgentRole,
  AgentReviewRequest,
  AgentDecision,
  AgentDecisionAction,
} from '@/packages/types/src';
import { agentCollaborationBus } from './agent-collaboration-bus';
import { agentContextManager } from './agent-context-manager';
import { agentArtifactRegistry } from './agent-artifact-registry';
import { dbStore } from '@/lib/db/store';
import { agentPerformanceMemory } from './agent-performance-memory';
import { agentExperienceManager } from './experience-memory';
import { ceoDecisionMemory } from './ceo-decision-memory';

export interface RequestReviewParams {
  workspaceId: string;
  workflowId: string;
  targetStepId: string;
  reviewingAgentRole: AgentRole;
  reviewingAgentId?: string;
  requestedByAgentRole: AgentRole;
  requestedByAgentId?: string;
  artifactsToReview?: string[];
  reviewNotes?: string;
}

export class AgentCoordinationService {
  private reviews: Map<string, AgentReviewRequest> = new Map(); // key: `${workspaceId}:${reviewId}`
  private decisions: Map<string, AgentDecision[]> = new Map(); // key: `${workspaceId}:${workflowId}`

  /**
   * Submits a quality review request between agents.
   */
  public async requestReview(params: RequestReviewParams): Promise<AgentReviewRequest> {
    const {
      workspaceId,
      workflowId,
      targetStepId,
      reviewingAgentRole,
      reviewingAgentId = `agent_${reviewingAgentRole.toLowerCase().replace('_agent', '')}_01`,
      requestedByAgentRole,
      requestedByAgentId = `agent_${requestedByAgentRole.toLowerCase().replace('_agent', '')}_01`,
      artifactsToReview = [],
      reviewNotes,
    } = params;

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const review: AgentReviewRequest = {
      reviewId,
      workspaceId,
      workflowId,
      targetStepId,
      reviewingAgentRole,
      reviewingAgentId,
      requestedByAgentRole,
      requestedByAgentId,
      status: 'WAITING_REVIEW',
      artifactsToReview,
      reviewNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const key = `${workspaceId}:${reviewId}`;
    this.reviews.set(key, review);

    // Notify reviewer agent via collaboration bus
    agentCollaborationBus.publishMessage({
      workspaceId,
      workflowId,
      sessionId: `sess_${workflowId}`,
      stepId: targetStepId,
      fromAgentId: requestedByAgentId,
      fromAgentRole: requestedByAgentRole,
      toAgentId: reviewingAgentId,
      toAgentRole: reviewingAgentRole,
      messageType: 'REVIEW_REQUEST',
      content: `Review requested for step ${targetStepId} by ${requestedByAgentRole}: ${reviewNotes || 'Quality audit required'}`,
      artifactIds: artifactsToReview,
      correlationId: reviewId,
    });

    dbStore.logWorkspaceActivity({
      workspaceId,
      eventType: 'AGENT_REVIEW_REQUESTED',
      title: `Agent Review Requested: ${requestedByAgentRole} -> ${reviewingAgentRole}`,
      description: `Target Step: ${targetStepId}`,
      details: { reviewId, workflowId, targetStepId },
    });

    return review;
  }

  /**
   * Submits review verdict and feedback.
   */
  public async submitReview(
    reviewId: string,
    workspaceId: string,
    verdict: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED',
    notes: string,
    feedback: string[] = []
  ): Promise<AgentReviewRequest> {
    const key = `${workspaceId}:${reviewId}`;
    const review = this.reviews.get(key);
    if (!review) {
      throw new Error(`Review '${reviewId}' not found in workspace '${workspaceId}'`);
    }

    review.status = verdict;
    review.reviewNotes = notes;
    review.feedback = feedback;
    review.updatedAt = new Date().toISOString();

    // Publish review response
    agentCollaborationBus.publishMessage({
      workspaceId,
      workflowId: review.workflowId,
      sessionId: `sess_${review.workflowId}`,
      stepId: review.targetStepId,
      fromAgentId: review.reviewingAgentId,
      fromAgentRole: review.reviewingAgentRole,
      toAgentId: review.requestedByAgentId,
      toAgentRole: review.requestedByAgentRole,
      messageType: 'REVIEW_RESPONSE',
      content: `Review result: ${verdict}. Notes: ${notes}`,
      payload: { feedback, verdict },
      correlationId: reviewId,
    });

    // Track review outcomes in agent performance memory and experience engine
    const approved = verdict === 'APPROVED';
    agentPerformanceMemory.recordReviewOutcome(workspaceId, review.requestedByAgentId, approved).catch(() => {});

    agentExperienceManager.recordExperience({
      workspaceId,
      workflowId: review.workflowId,
      agentId: review.requestedByAgentId,
      agentRole: review.requestedByAgentRole,
      stepId: review.targetStepId,
      eventType: approved ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
      inputSummary: `Quality review of step '${review.targetStepId}' by ${review.reviewingAgentRole}`,
      actionSummary: `Submitted review with verdict '${verdict}'`,
      resultSummary: notes || `Review verdict: ${verdict}`,
      success: approved,
      errorCategory: approved ? undefined : 'REVIEW_QUALITY_DEFECT',
      confidence: 0.95,
      tags: ['AGENT_REVIEW', verdict, review.reviewingAgentRole],
    }).catch(() => {});

    // If revision is required, self-heal: assign DEBUG_AGENT to analyze and coordinate fix
    if (verdict === 'REVISION_REQUIRED') {
      await this.handleTestOrReviewFailure(review, notes, feedback);
    }

    return review;
  }

  /**
   * Handles failure by coordinating DEBUG_AGENT analysis, patch artifact generation, and CODING_AGENT remediation.
   */
  private async handleTestOrReviewFailure(
    review: AgentReviewRequest,
    notes: string,
    feedback: string[]
  ): Promise<void> {
    const { workspaceId, workflowId, targetStepId } = review;

    // 1. Log diagnostic review decision
    this.makeCeoDecision(
      workspaceId,
      workflowId,
      'REPLAN',
      `Quality review flagged defects at step '${targetStepId}'. Invoking diagnostic debug agent.`,
      notes,
      0.96
    );

    // 2. Register a diagnostic patch artifact
    const debugArtifact = agentArtifactRegistry.registerArtifact({
      workspaceId,
      workflowId,
      stepId: targetStepId,
      producerAgent: 'agent_debug_01',
      producerRole: 'DEBUG_AGENT',
      type: 'PATCH',
      name: 'diagnostic-patch.json',
      description: `Automated patch proposal for step ${targetStepId}`,
      data: {
        defectsIdentified: feedback,
        suggestedFixes: feedback.map((f) => `Remediate: ${f}`),
        targetStep: targetStepId,
      },
      metadata: { targetStepId, severity: 'HIGH' },
    });

    // 3. Attach artifact to shared context
    agentContextManager.attachArtifact(workspaceId, workflowId, debugArtifact);

    // 4. Send DEBUG -> CODING handoff message
    agentCollaborationBus.publishMessage({
      workspaceId,
      workflowId,
      sessionId: `sess_${workflowId}`,
      stepId: targetStepId,
      fromAgentId: 'agent_debug_01',
      fromAgentRole: 'DEBUG_AGENT',
      toAgentId: 'agent_code_01',
      toAgentRole: 'CODING_AGENT',
      messageType: 'HANDOFF',
      content: `DEBUG_AGENT identified ${feedback.length} issues and produced diagnostic patch ${debugArtifact.artifactId}. Ready for patch application.`,
      artifactIds: [debugArtifact.artifactId],
      correlationId: `debug_fix_${Date.now()}`,
    });
  }

  /**
   * Records a strategic CEO Agent decision for executive governance and auditability.
   */
  public makeCeoDecision(
    workspaceId: string,
    workflowId: string,
    action: AgentDecisionAction,
    summary: string,
    rationale: string,
    confidence: number = 0.95
  ): AgentDecision {
    const decision: AgentDecision = {
      decisionId: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspaceId,
      workflowId,
      agentId: 'agent_ceo_01',
      role: 'CEO_AGENT',
      action,
      summary,
      rationale,
      confidence,
      timestamp: new Date().toISOString(),
    };

    const key = `${workspaceId}:${workflowId}`;
    if (!this.decisions.has(key)) {
      this.decisions.set(key, []);
    }
    this.decisions.get(key)!.push(decision);

    agentCollaborationBus.publishMessage({
      workspaceId,
      workflowId,
      sessionId: `sess_${workflowId}`,
      fromAgentId: 'agent_ceo_01',
      fromAgentRole: 'CEO_AGENT',
      messageType: 'STATUS',
      content: `[CEO Strategic Decision] [${action}] ${summary}`,
      payload: { rationale, confidence },
      correlationId: decision.decisionId,
    });

    dbStore.logWorkspaceActivity({
      workspaceId,
      eventType: 'CEO_DECISION',
      title: `CEO Decision: ${action}`,
      description: summary,
      details: { decisionId: decision.decisionId, workflowId, action, confidence },
    });

    ceoDecisionMemory.recordDecision({
      workspaceId,
      workflowId,
      decisionId: decision.decisionId,
      category: action,
      rationale,
      selectedOption: summary,
      success: true,
      metadata: { confidence },
    }).catch(() => {});

    return decision;
  }

  /**
   * Retrieves all CEO decisions for a workflow.
   */
  public getCeoDecisions(workspaceId: string, workflowId?: string): AgentDecision[] {
    const results: AgentDecision[] = [];
    for (const [key, decs] of this.decisions.entries()) {
      if (!key.startsWith(`${workspaceId}:`)) continue;
      if (workflowId && key !== `${workspaceId}:${workflowId}`) continue;
      results.push(...decs);
    }
    return results;
  }

  /**
   * Retrieves a review by ID.
   */
  public getReview(workspaceId: string, reviewId: string): AgentReviewRequest | null {
    const key = `${workspaceId}:${reviewId}`;
    const r = this.reviews.get(key);
    if (!r || r.workspaceId !== workspaceId) return null;
    return r;
  }

  /**
   * Lists reviews for a workflow.
   */
  public listReviews(workspaceId: string, workflowId?: string): AgentReviewRequest[] {
    const results: AgentReviewRequest[] = [];
    for (const rev of this.reviews.values()) {
      if (rev.workspaceId !== workspaceId) continue;
      if (workflowId && rev.workflowId !== workflowId) continue;
      results.push(rev);
    }
    return results;
  }
}

export const agentCoordinationService = new AgentCoordinationService();
