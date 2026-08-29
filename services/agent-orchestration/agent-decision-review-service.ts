import {
  MultiAgentDecisionReview,
  AgentReviewRound,
  WorkflowStrategy,
  AgentRole,
} from '@/packages/types/src';
import { ceoDecisionMemory } from './ceo-decision-memory';
import { agentExperienceManager } from './experience-memory';
import { confidenceEngine } from './confidence-engine';

export interface ConductReviewOptions {
  workspaceId: string;
  workflowId?: string;
  topic: string;
  proposedStrategy: WorkflowStrategy;
  proposedByRole?: AgentRole;
  proposedByAgentId?: string;
  maxRounds?: number;
}

export class AgentDecisionReviewService {
  private reviews: Map<string, MultiAgentDecisionReview> = new Map();
  private readonly MAX_REVIEW_DEPTH = 3;

  /**
   * Conducts a bounded multi-agent review and debate for high-impact decisions, finalized by CEO_AGENT.
   */
  public async conductDecisionReview(options: ConductReviewOptions): Promise<MultiAgentDecisionReview> {
    const {
      workspaceId,
      workflowId,
      topic,
      proposedStrategy,
      proposedByRole = 'PLANNER_AGENT',
      proposedByAgentId = 'agent_planner_01',
      maxRounds = this.MAX_REVIEW_DEPTH,
    } = options;

    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const rounds: AgentReviewRound[] = [];
    const boundedMaxRounds = Math.min(maxRounds, this.MAX_REVIEW_DEPTH);

    // 1. Primary Proposal Evaluation Round by TESTING / ARCHITECTURE agent
    const round1ReviewerRole: AgentRole = 'TESTING_AGENT';
    const objectionsRound1: string[] = [];
    const suggestedModificationsRound1: string[] = [];

    if (proposedStrategy.riskScore > 0.3) {
      objectionsRound1.push(`Strategy risk score (${Math.round(proposedStrategy.riskScore * 100)}%) is elevated for high-impact production.`);
      suggestedModificationsRound1.push('Introduce strict pre-deployment automated test validation step.');
    }
    if (proposedStrategy.estimatedCost.tokenCost > 15000) {
      suggestedModificationsRound1.push('Optimize prompt payload size and cache AST definitions.');
    }

    rounds.push({
      roundNumber: 1,
      agentRole: round1ReviewerRole,
      agentId: 'agent_test_01',
      perspective: 'STRATEGY',
      evaluation: objectionsRound1.length > 0 ? 'MODIFIED' : 'APPROVED',
      objections: objectionsRound1,
      suggestedModifications: suggestedModificationsRound1,
      confidence: 0.92,
      timestamp: new Date().toISOString(),
    });

    // 2. Risk & Security Reviewer Round by INTEGRATION / SECURITY agent
    if (boundedMaxRounds >= 2) {
      const objectionsRound2: string[] = [];
      const suggestedModificationsRound2: string[] = [];

      if (proposedStrategy.suggestedTools.some((t) => t.includes('delete') || t.includes('drop'))) {
        objectionsRound2.push('Destructive tool invocations require mandatory human approval guard.');
      }

      rounds.push({
        roundNumber: 2,
        agentRole: 'INTEGRATION_AGENT',
        agentId: 'agent_integration_01',
        perspective: 'RISK_ASSESSMENT',
        evaluation: objectionsRound2.length > 0 ? 'MODIFIED' : 'APPROVED',
        objections: objectionsRound2,
        suggestedModifications: suggestedModificationsRound2,
        confidence: 0.94,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Query Past CEO Decisions for Precedents
    let previousCeoPrecedent: string | undefined;
    try {
      const pastCeoDecisions = await ceoDecisionMemory.retrieveStrategicDecisions(workspaceId, topic, 2);
      if (pastCeoDecisions.length > 0) {
        previousCeoPrecedent = `Precedent: Reused verified pattern from decision [${pastCeoDecisions[0].decisionType}] (Confidence: ${pastCeoDecisions[0].confidence})`;
      }
    } catch {
      // Non-blocking fallback
    }

    // 4. CEO_AGENT Strategic Final Decision
    const hasCriticalObjection = rounds.some((r) => r.evaluation === 'OBJECTED');
    const hasModifications = rounds.some((r) => r.suggestedModifications.length > 0);

    let finalDecisionType: 'APPROVE_STRATEGY' | 'MODIFY_STRATEGY' | 'REJECT_STRATEGY' | 'REQUEST_HUMAN_APPROVAL' = 'APPROVE_STRATEGY';
    let rationale = `Approved strategy '${proposedStrategy.name}' following peer consensus across ${rounds.length} review rounds.`;

    if (hasCriticalObjection) {
      finalDecisionType = 'REJECT_STRATEGY';
      rationale = 'Rejected initial strategy due to unresolved high-risk objections raised in peer review.';
    } else if (proposedStrategy.riskScore > 0.6) {
      finalDecisionType = 'REQUEST_HUMAN_APPROVAL';
      rationale = 'Strategy contains high-risk operations exceeding automatic executive clearance thresholds. Human approval requested.';
    } else if (hasModifications) {
      finalDecisionType = 'MODIFY_STRATEGY';
      rationale = `Adopted strategy with modifications: ${rounds.flatMap((r) => r.suggestedModifications).join('; ')}`;
    }

    const confidenceAssessment = await confidenceEngine.calculateConfidence({
      workspaceId,
      agentRole: 'CEO_AGENT',
      agentId: 'agent_ceo_01',
      reviewAgreements: rounds.filter((r) => r.evaluation === 'APPROVED').length + 1,
      totalReviewers: rounds.length + 1,
      isHighImpact: true,
      predictedRisk: proposedStrategy.riskScore > 0.5 ? 'HIGH' : proposedStrategy.riskScore > 0.25 ? 'MEDIUM' : 'LOW',
    });

    const ceoDecision = {
      decision: finalDecisionType,
      confidence: confidenceAssessment.overallConfidence,
      rationale: previousCeoPrecedent ? `${rationale} (${previousCeoPrecedent})` : rationale,
      finalStrategyId: proposedStrategy.strategyId,
      strategicDirective: `CEO Strategic Directive: Execute '${proposedStrategy.name}' with state verification gates.`,
    };

    const review: MultiAgentDecisionReview = {
      reviewId,
      workspaceId,
      workflowId,
      decisionTopic: topic,
      primaryProposal: {
        strategyId: proposedStrategy.strategyId,
        strategyType: proposedStrategy.strategyType,
        summary: proposedStrategy.description,
        proposedByRole,
        proposedByAgentId,
      },
      rounds,
      ceoDecision,
      completedAt: new Date().toISOString(),
    };

    this.reviews.set(reviewId, review);

    // Record decision in CEO Decision Memory and Experience Memory
    ceoDecisionMemory.recordStrategicDecision({
      workspaceId,
      workflowId,
      decisionType: finalDecisionType === 'REJECT_STRATEGY' ? 'ABORT' : 'CONTINUE',
      strategicGoal: topic,
      rationale: ceoDecision.rationale,
      tradeoffs: {
        expectedSuccess: proposedStrategy.expectedSuccessProbability,
        riskScore: proposedStrategy.riskScore,
        peerReviewRounds: rounds.length,
      },
      confidence: ceoDecision.confidence,
    }).catch(() => {});

    agentExperienceManager.recordExperience({
      workspaceId,
      workflowId,
      eventType: 'CEO_DECISION',
      inputSummary: `Multi-Agent Debate on topic: '${topic}'`,
      actionSummary: `CEO evaluated ${rounds.length} peer review rounds for strategy '${proposedStrategy.name}'`,
      resultSummary: `Final Decision: [${finalDecisionType}] - ${ceoDecision.rationale}`,
      success: finalDecisionType !== 'REJECT_STRATEGY',
      confidence: ceoDecision.confidence,
      tags: ['MULTI_AGENT_DEBATE', 'CEO_DECISION', proposedStrategy.strategyType],
      metadata: { reviewId, roundsCount: rounds.length, strategyId: proposedStrategy.strategyId },
    }).catch(() => {});

    return review;
  }

  public getReview(reviewId: string): MultiAgentDecisionReview | null {
    return this.reviews.get(reviewId) || null;
  }

  public listReviews(workspaceId?: string): MultiAgentDecisionReview[] {
    const all = Array.from(this.reviews.values());
    if (workspaceId) {
      return all.filter((r) => r.workspaceId === workspaceId);
    }
    return all;
  }
}

export const agentDecisionReviewService = new AgentDecisionReviewService();
