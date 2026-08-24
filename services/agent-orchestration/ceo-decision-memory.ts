import { AgentExperienceRecord } from '@/packages/types/src';
import { agentExperienceManager } from './experience-memory';

export interface RecordCeoDecisionInput {
  workspaceId: string;
  workflowId?: string;
  projectId?: string;
  decisionId: string;
  category: string;
  rationale: string;
  selectedOption: string;
  success?: boolean;
  outcome?: string;
  metadata?: Record<string, unknown>;
}

export interface RecordStrategicDecisionInput {
  workspaceId: string;
  workflowId?: string;
  projectId?: string;
  decisionType: 'CONTINUE' | 'RETRY' | 'REPLAN' | 'DELEGATE' | 'ESCALATE' | 'ABORT';
  strategicGoal: string;
  rationale: string;
  tradeoffs?: Record<string, unknown>;
  confidence: number;
}

export interface StrategicDecisionRecord {
  decisionId: string;
  workspaceId: string;
  workflowId?: string;
  decisionType: string;
  strategicGoal: string;
  rationale: string;
  confidence: number;
  recordedAt: string;
  metadata?: Record<string, unknown>;
}

export class CeoDecisionMemory {
  /**
   * Records a strategic CEO / Executive planning decision into long-term experience memory.
   */
  public async recordDecision(input: RecordCeoDecisionInput): Promise<AgentExperienceRecord> {
    return agentExperienceManager.recordExperience({
      workspaceId: input.workspaceId,
      workflowId: input.workflowId,
      projectId: input.projectId,
      agentId: 'agent_ceo_01',
      agentRole: 'CEO_AGENT',
      eventType: 'CEO_DECISION',
      inputSummary: `Strategic Decision [${input.category}]: ${input.rationale}`,
      actionSummary: `Selected Option: ${input.selectedOption}`,
      resultSummary: input.outcome || `Decision applied for category ${input.category}`,
      success: input.success !== undefined ? input.success : true,
      confidence: 0.98,
      tags: ['CEO_DECISION', input.category, input.selectedOption],
      metadata: {
        decisionId: input.decisionId,
        category: input.category,
        selectedOption: input.selectedOption,
        ...(input.metadata || {}),
      },
    });
  }

  /**
   * Records a Phase 14.3.4 strategic decision.
   */
  public async recordStrategicDecision(input: RecordStrategicDecisionInput): Promise<AgentExperienceRecord> {
    const decisionId = `dec_strat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    return agentExperienceManager.recordExperience({
      workspaceId: input.workspaceId,
      workflowId: input.workflowId,
      projectId: input.projectId,
      agentId: 'agent_ceo_01',
      agentRole: 'CEO_AGENT',
      eventType: 'CEO_DECISION',
      inputSummary: `Strategic Goal: ${input.strategicGoal}`,
      actionSummary: `Decision: ${input.decisionType} — ${input.rationale}`,
      resultSummary: `Confidence: ${Math.round(input.confidence * 100)}%`,
      success: true,
      confidence: input.confidence,
      tags: ['CEO_STRATEGIC_DECISION', input.decisionType],
      metadata: {
        decisionId,
        decisionType: input.decisionType,
        strategicGoal: input.strategicGoal,
        tradeoffs: input.tradeoffs || {},
      },
    });
  }

  /**
   * Retrieves past strategic decisions relevant to a planning objective or category.
   */
  public async retrievePastDecisions(
    workspaceId: string,
    category?: string,
    query?: string
  ): Promise<AgentExperienceRecord[]> {
    const results = await agentExperienceManager.searchExperiences({
      workspaceId,
      eventType: 'CEO_DECISION',
      query: query || category,
      limit: 10,
    });

    return results.map((r) => r.experience);
  }

  /**
   * Retrieves past Phase 14.3.4 strategic decisions formatted with strategic metadata.
   */
  public async retrieveStrategicDecisions(
    workspaceId: string,
    query?: string,
    limit = 5
  ): Promise<StrategicDecisionRecord[]> {
    const results = await agentExperienceManager.searchExperiences({
      workspaceId,
      eventType: 'CEO_DECISION',
      query,
      limit,
      minConfidence: 0.1,
    });

    return results.map((r) => {
      const exp = r.experience;
      return {
        decisionId: (exp.metadata?.decisionId as string) || exp.id,
        workspaceId: exp.workspaceId,
        workflowId: exp.workflowId,
        decisionType: (exp.metadata?.decisionType as string) || 'CONTINUE',
        strategicGoal: (exp.metadata?.strategicGoal as string) || exp.inputSummary,
        rationale: exp.actionSummary,
        confidence: exp.confidence,
        recordedAt: exp.timestamp || new Date().toISOString(),
        metadata: exp.metadata,
      };
    });
  }
}

export const ceoDecisionMemory = new CeoDecisionMemory();
