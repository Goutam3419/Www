import {
  AgentExperienceRecord,
  ExperienceEventType,
  ExperienceQueryFilter,
  ExperienceSearchResult,
  AgentExperienceRecommendation,
  AgentRole,
  LearningScoreBreakdown,
} from '@/packages/types/src';
import { getRepositories } from '@/lib/db/repositories';
import { sanitizeSecretsInValue } from './workflow-state-manager';
import { getSupabaseServerClient } from '@/lib/db/supabase/client';

/**
 * Generates a normalized 768-dimensional deterministic semantic embedding
 * from textual content.
 */
export function generateDeterministicEmbedding(text: string): number[] {
  const dim = 768;
  const vector = new Array<number>(dim).fill(0);
  const normalized = (text || '').toLowerCase().replace(/[^a-z0-9_\-\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return vector;
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let hash = 0;
    for (let c = 0; c < token.length; c++) {
      hash = ((hash << 5) - hash + token.charCodeAt(c)) | 0;
    }

    // Distribute token energy across multiple dimensions deterministically (position-invariant)
    const baseIdx = Math.abs(hash) % dim;
    const secondaryIdx = Math.abs((hash * 31 + 17) | 0) % dim;
    const tertiaryIdx = Math.abs((hash * 127 + 43) | 0) % dim;

    vector[baseIdx] += 1.0;
    vector[secondaryIdx] += 0.6;
    vector[tertiaryIdx] += 0.3;

    // Bigram semantic matching
    if (i > 0) {
      const biStr = `${tokens[i - 1]}_${token}`;
      let biHash = 0;
      for (let c = 0; c < biStr.length; c++) {
        biHash = ((biHash << 5) - biHash + biStr.charCodeAt(c)) | 0;
      }
      const biIdx = Math.abs(biHash) % dim;
      vector[biIdx] += 0.8;
    }
  }

  // Normalize L2 norm
  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < dim; i++) {
    vector[i] = vector[i] / norm;
  }

  return vector;
}

/**
 * Calculates cosine similarity between two normalized vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }
  return Math.max(0, Math.min(1, (dotProduct + 1) / 2)); // Normalized to 0.0 - 1.0
}

export interface RecordExperienceInput {
  workspaceId: string;
  workflowId?: string;
  projectId?: string;
  agentId?: string;
  agentRole?: AgentRole;
  stepId?: string;
  eventType: ExperienceEventType;
  inputSummary: string;
  actionSummary: string;
  resultSummary: string;
  success: boolean;
  errorCategory?: string;
  resolution?: string;
  confidence?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export class AgentExperienceManager {
  /**
   * Records a new multi-agent experience with sanitized secrets and semantic embedding.
   */
  public async recordExperience(input: RecordExperienceInput): Promise<AgentExperienceRecord> {
    const repos = getRepositories();

    // 1. Redact any tokens or confidential values
    const sanitizedInput = sanitizeSecretsInValue(input.inputSummary) as string;
    const sanitizedAction = sanitizeSecretsInValue(input.actionSummary) as string;
    const sanitizedResult = sanitizeSecretsInValue(input.resultSummary) as string;
    const sanitizedResolution = input.resolution ? (sanitizeSecretsInValue(input.resolution) as string) : undefined;
    const sanitizedMetadata = (sanitizeSecretsInValue(input.metadata || {}) as Record<string, unknown>) || {};

    // 2. Generate semantic embedding from combined context
    const fullTextForEmbedding = [
      input.eventType,
      input.agentRole || '',
      sanitizedInput,
      sanitizedAction,
      sanitizedResult,
      input.errorCategory || '',
      sanitizedResolution || '',
      (input.tags || []).join(' '),
    ].join(' ');

    const embedding = generateDeterministicEmbedding(fullTextForEmbedding);

    const record: Omit<AgentExperienceRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string } = {
      workspaceId: input.workspaceId,
      workflowId: input.workflowId,
      projectId: input.projectId,
      agentId: input.agentId,
      agentRole: input.agentRole,
      stepId: input.stepId,
      eventType: input.eventType,
      inputSummary: sanitizedInput,
      actionSummary: sanitizedAction,
      resultSummary: sanitizedResult,
      success: input.success,
      errorCategory: input.errorCategory,
      resolution: sanitizedResolution,
      confidence: input.confidence !== undefined ? input.confidence : (input.success ? 0.95 : 0.7),
      tags: input.tags || [],
      embedding,
      metadata: sanitizedMetadata,
    };

    const saved = await repos.agentExperiences.create(record);
    return saved;
  }

  /**
   * Retrieves semantically similar experiences for a workspace query.
   */
  public async searchExperiences(filter: ExperienceQueryFilter): Promise<ExperienceSearchResult[]> {
    const { workspaceId, query, limit = 10, minConfidence = 0.3 } = filter;
    const repos = getRepositories();

    // Try Supabase RPC search if query provided and client available
    if (query) {
      const client = getSupabaseServerClient();
      const queryVec = generateDeterministicEmbedding(query);

      if (client) {
        try {
          const { data, error } = await client.rpc('match_agent_experiences', {
            query_embedding: queryVec,
            target_workspace_id: workspaceId,
            target_event_type: filter.eventType || null,
            target_agent_role: filter.agentRole || null,
            success_only: filter.successOnly !== undefined ? filter.successOnly : null,
            match_threshold: minConfidence,
            match_count: limit,
          });

          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map((d: Record<string, unknown>) => {
              const experience: AgentExperienceRecord = {
                id: String(d.id),
                workspaceId: String(d.workspace_id),
                workflowId: d.workflow_id ? String(d.workflow_id) : undefined,
                projectId: d.project_id ? String(d.project_id) : undefined,
                agentId: d.agent_id ? String(d.agent_id) : undefined,
                agentRole: d.agent_role as AgentExperienceRecord['agentRole'],
                stepId: d.step_id ? String(d.step_id) : undefined,
                eventType: d.event_type as AgentExperienceRecord['eventType'],
                inputSummary: String(d.input_summary || ''),
                actionSummary: String(d.action_summary || ''),
                resultSummary: String(d.result_summary || ''),
                success: Boolean(d.success),
                errorCategory: d.error_category ? String(d.error_category) : undefined,
                resolution: d.resolution ? String(d.resolution) : undefined,
                confidence: Number(d.confidence || 0.8),
                tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
                metadata: (d.metadata as Record<string, unknown>) || {},
                timestamp: String(d.timestamp || new Date().toISOString()),
              };

              const similarity = Number(d.similarity || 0.85);
              const score = this.calculateExperienceScore(experience, similarity);

              return {
                experience,
                similarity,
                score,
                matchReason: `Semantic similarity match (${(similarity * 100).toFixed(1)}%) with historical outcome`,
              };
            });
          }
        } catch {
          // Fallback to local query
        }
      }
    }

    // Fallback: Query experiences via repository & evaluate in memory
    const allRecords = await repos.agentExperiences.query({
      ...filter,
      limit: Math.max(100, (filter.limit || 10) * 5),
    });
    const queryVec = query ? generateDeterministicEmbedding(query) : null;

    const scored: ExperienceSearchResult[] = allRecords.map((exp) => {
      let similarity = 0.8;
      if (queryVec && exp.embedding) {
        similarity = cosineSimilarity(queryVec, exp.embedding);
      } else if (query) {
        // Keyword overlap calculation
        const qWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
        const text = `${exp.inputSummary} ${exp.actionSummary} ${exp.resultSummary} ${exp.errorCategory || ''} ${exp.tags.join(' ')}`.toLowerCase();
        const matches = qWords.filter((w) => text.includes(w)).length;
        similarity = qWords.length > 0 ? matches / qWords.length : 0.5;
      }

      const score = this.calculateExperienceScore(exp, similarity);
      return {
        experience: exp,
        similarity,
        score,
        matchReason: `Matched experience in workspace '${workspaceId}' [${exp.eventType}]`,
      };
    });

    return scored
      .filter((s) => s.similarity >= minConfidence)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generates actionable recommendations based on past experiences for a workflow context.
   */
  public async generateRecommendations(
    workspaceId: string,
    query: string,
    options: {
      agentRole?: AgentRole;
      errorCategory?: string;
      toolId?: string;
    } = {}
  ): Promise<AgentExperienceRecommendation> {
    const searchResults = await this.searchExperiences({
      workspaceId,
      query,
      agentRole: options.agentRole,
      errorCategory: options.errorCategory,
      limit: 8,
    });

    const successfulExperiences = searchResults.filter((r) => r.experience.success);
    const failedExperiences = searchResults.filter((r) => !r.experience.success);

    const successfulStrategies: string[] = Array.from(
      new Set(
        successfulExperiences
          .map((r) => r.experience.resolution || r.experience.actionSummary)
          .filter(Boolean)
      )
    ).slice(0, 4);

    const failedStrategies: string[] = Array.from(
      new Set(
        failedExperiences
          .map((r) => `${r.experience.actionSummary} (Failed: ${r.experience.resultSummary})`)
          .filter(Boolean)
      )
    ).slice(0, 4);

    const knownErrors: string[] = Array.from(
      new Set(
        failedExperiences
          .map((r) => r.experience.errorCategory || r.experience.resultSummary)
          .filter(Boolean)
      )
    ).slice(0, 4);

    const recommendedActions: string[] = [];
    if (successfulStrategies.length > 0) {
      recommendedActions.push(`Apply verified pattern: ${successfulStrategies[0]}`);
    }
    if (failedStrategies.length > 0) {
      recommendedActions.push(`Avoid previously failed approach: ${failedStrategies[0]}`);
    }
    if (options.errorCategory) {
      const pastFix = searchResults.find(
        (r) => r.experience.errorCategory === options.errorCategory && r.experience.resolution
      );
      if (pastFix) {
        recommendedActions.push(`Learned resolution for '${options.errorCategory}': ${pastFix.experience.resolution}`);
      }
    }

    const avgConfidence = searchResults.length > 0
      ? searchResults.reduce((acc, r) => acc + r.experience.confidence, 0) / searchResults.length
      : 0.85;

    const avgSimilarity = searchResults.length > 0
      ? searchResults.reduce((acc, r) => acc + r.similarity, 0) / searchResults.length
      : 0.8;

    return {
      query,
      similarExperiences: searchResults.map((r) => r.experience),
      successfulStrategies,
      failedStrategies,
      knownErrors,
      recommendedActions,
      confidenceScore: Math.round(avgConfidence * 100) / 100,
      relevanceScore: Math.round(avgSimilarity * 100) / 100,
    };
  }

  /**
   * Deterministic experience scoring algorithm.
   */
  public calculateExperienceScore(exp: AgentExperienceRecord, similarity: number): number {
    const breakdown = this.getScoreBreakdown(exp, similarity);
    return breakdown.finalScore;
  }

  /**
   * Detailed breakdown of how an experience is scored.
   */
  public getScoreBreakdown(exp: AgentExperienceRecord, similarity: number): LearningScoreBreakdown {
    // 1. Base score by outcome
    const baseScore = exp.success ? 1.0 : 0.4;

    // 2. Recency decay (half-life of 30 days)
    const ageDays = (Date.now() - new Date(exp.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.max(0.6, Math.exp(-0.02 * ageDays));

    // 3. Similarity weighting
    const similarityWeight = similarity;

    // 4. Agent role confidence
    const agentPerformanceWeight = exp.confidence || 0.9;

    // 5. Tool / outcome bonus
    const humanApprovalBonus = exp.eventType === 'HUMAN_APPROVAL' || exp.eventType === 'REVIEW_APPROVED' ? 0.15 : 0.0;

    // Final blended score (0.0 to 1.0)
    const finalScore = Math.min(
      1.0,
      (baseScore * 0.35 +
        recencyWeight * 0.2 +
        similarityWeight * 0.3 +
        agentPerformanceWeight * 0.15 +
        humanApprovalBonus) * (exp.success ? 1.0 : 0.75)
    );

    return {
      experienceId: exp.id,
      baseScore,
      recencyWeight,
      similarityWeight,
      agentPerformanceWeight,
      toolReliabilityWeight: 0.9,
      humanApprovalBonus,
      finalScore: Math.round(finalScore * 1000) / 1000,
    };
  }
}

export const agentExperienceManager = new AgentExperienceManager();
