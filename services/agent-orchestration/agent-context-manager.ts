import {
  AgentTaskContext,
  AgentArtifact,
  AgentRole,
} from '@/packages/types/src';
import { sanitizeSecretsInValue } from './workflow-state-manager';
import { workflowEventBus } from './workflow-event-bus';

export class AgentContextManager {
  private contexts: Map<string, AgentTaskContext> = new Map(); // key: `${workspaceId}:${contextId}`
  private workflowContextMap: Map<string, string> = new Map(); // key: `${workspaceId}:${workflowId}` -> contextId
  private contextSnapshots: Map<string, Map<number, AgentTaskContext>> = new Map(); // key: `${workspaceId}:${contextId}` -> Map<version, context>

  /**
   * Initializes a new shared task context for a workflow.
   */
  public createContext(
    workspaceId: string,
    workflowId: string,
    initialSharedState: Record<string, unknown> = {}
  ): AgentTaskContext {
    const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedInitialState = sanitizeSecretsInValue(initialSharedState) as Record<string, unknown>;

    const context: AgentTaskContext = {
      contextId,
      workspaceId,
      workflowId,
      version: 1,
      snapshotId: `snap_${contextId}_v1`,
      sharedState: sanitizedInitialState,
      predecessorOutputs: {},
      artifacts: [],
      lastUpdatedBy: 'SYSTEM_PLANNER',
      updatedAt: new Date().toISOString(),
    };

    const key = `${workspaceId}:${contextId}`;
    this.contexts.set(key, context);
    this.workflowContextMap.set(`${workspaceId}:${workflowId}`, contextId);

    // Save initial snapshot
    if (!this.contextSnapshots.has(key)) {
      this.contextSnapshots.set(key, new Map());
    }
    this.contextSnapshots.get(key)!.set(1, JSON.parse(JSON.stringify(context)));

    return context;
  }

  /**
   * Retrieves context by contextId or workflowId with workspace isolation.
   */
  public getContext(workspaceId: string, contextIdOrWorkflowId: string): AgentTaskContext | null {
    let contextId = contextIdOrWorkflowId;
    if (this.workflowContextMap.has(`${workspaceId}:${contextIdOrWorkflowId}`)) {
      contextId = this.workflowContextMap.get(`${workspaceId}:${contextIdOrWorkflowId}`)!;
    }

    const key = `${workspaceId}:${contextId}`;
    const ctx = this.contexts.get(key);
    if (!ctx || ctx.workspaceId !== workspaceId) {
      return null;
    }
    return ctx;
  }

  /**
   * Updates context with new shared state entries and/or predecessor outputs.
   */
  public updateContext(
    workspaceId: string,
    contextIdOrWorkflowId: string,
    updaterAgentId: string,
    updates: Partial<Record<string, unknown>> = {},
    predecessorOutputs: Record<string, unknown> = {}
  ): AgentTaskContext {
    let context = this.getContext(workspaceId, contextIdOrWorkflowId);
    if (!context) {
      context = this.createContext(workspaceId, contextIdOrWorkflowId);
    }

    const key = `${workspaceId}:${context.contextId}`;
    const nextVersion = context.version + 1;
    const sanitizedUpdates = sanitizeSecretsInValue(updates) as Record<string, unknown>;
    const sanitizedPredecessorOutputs = sanitizeSecretsInValue(predecessorOutputs) as Record<string, unknown>;

    const updatedContext: AgentTaskContext = {
      ...context,
      version: nextVersion,
      snapshotId: `snap_${context.contextId}_v${nextVersion}`,
      sharedState: {
        ...context.sharedState,
        ...sanitizedUpdates,
      },
      predecessorOutputs: {
        ...context.predecessorOutputs,
        ...sanitizedPredecessorOutputs,
      },
      lastUpdatedBy: updaterAgentId,
      updatedAt: new Date().toISOString(),
    };

    this.contexts.set(key, updatedContext);

    // Save snapshot
    if (!this.contextSnapshots.has(key)) {
      this.contextSnapshots.set(key, new Map());
    }
    this.contextSnapshots.get(key)!.set(nextVersion, JSON.parse(JSON.stringify(updatedContext)));

    workflowEventBus.emitEvent(
      updatedContext.workflowId,
      workspaceId,
      'STEP_STARTED',
      {
        action: 'AGENT_CONTEXT_UPDATED',
        contextId: updatedContext.contextId,
        version: nextVersion,
        updatedBy: updaterAgentId,
      },
      undefined,
      updaterAgentId
    );

    return updatedContext;
  }

  /**
   * Merges multiple parallel branch contexts safely without race conditions or state corruption.
   */
  public mergeContext(
    workspaceId: string,
    targetContextId: string,
    sourceContext: Partial<AgentTaskContext>,
    mergeAgentId: string
  ): AgentTaskContext {
    const target = this.getContext(workspaceId, targetContextId);
    if (!target) {
      throw new Error(`Target context '${targetContextId}' not found for merge in workspace '${workspaceId}'`);
    }

    const nextVersion = target.version + 1;
    const sanitizedSourceShared = sourceContext.sharedState
      ? (sanitizeSecretsInValue(sourceContext.sharedState) as Record<string, unknown>)
      : {};
    const sanitizedSourcePredecessors = sourceContext.predecessorOutputs
      ? (sanitizeSecretsInValue(sourceContext.predecessorOutputs) as Record<string, unknown>)
      : {};

    // Merge artifacts avoiding duplicates
    const combinedArtifacts = [...target.artifacts];
    if (sourceContext.artifacts) {
      for (const art of sourceContext.artifacts) {
        if (!combinedArtifacts.some((a) => a.artifactId === art.artifactId)) {
          combinedArtifacts.push(art);
        }
      }
    }

    const key = `${workspaceId}:${target.contextId}`;
    const merged: AgentTaskContext = {
      ...target,
      version: nextVersion,
      snapshotId: `snap_${target.contextId}_v${nextVersion}`,
      sharedState: {
        ...target.sharedState,
        ...sanitizedSourceShared,
      },
      predecessorOutputs: {
        ...target.predecessorOutputs,
        ...sanitizedSourcePredecessors,
      },
      artifacts: combinedArtifacts,
      lastUpdatedBy: mergeAgentId,
      updatedAt: new Date().toISOString(),
    };

    this.contexts.set(key, merged);

    if (!this.contextSnapshots.has(key)) {
      this.contextSnapshots.set(key, new Map());
    }
    this.contextSnapshots.get(key)!.set(nextVersion, JSON.parse(JSON.stringify(merged)));

    return merged;
  }

  /**
   * Attaches an artifact reference to the context.
   */
  public attachArtifact(
    workspaceId: string,
    contextIdOrWorkflowId: string,
    artifact: AgentArtifact
  ): AgentTaskContext {
    let context = this.getContext(workspaceId, contextIdOrWorkflowId);
    if (!context) {
      context = this.createContext(workspaceId, contextIdOrWorkflowId);
    }

    // Verify workspace isolation
    if (artifact.workspaceId !== workspaceId) {
      throw new Error(`Artifact workspace '${artifact.workspaceId}' mismatch with context workspace '${workspaceId}'`);
    }

    const sanitizedArtifact: AgentArtifact = {
      ...artifact,
      metadata: sanitizeSecretsInValue(artifact.metadata) as Record<string, unknown>,
      data: artifact.data ? (sanitizeSecretsInValue(artifact.data) as Record<string, unknown>) : undefined,
    };

    const updatedArtifacts = context.artifacts.filter((a) => a.artifactId !== artifact.artifactId);
    updatedArtifacts.push(sanitizedArtifact);

    const nextVersion = context.version + 1;
    const key = `${workspaceId}:${context.contextId}`;
    const updatedContext: AgentTaskContext = {
      ...context,
      version: nextVersion,
      snapshotId: `snap_${context.contextId}_v${nextVersion}`,
      artifacts: updatedArtifacts,
      lastUpdatedBy: artifact.producerAgent,
      updatedAt: new Date().toISOString(),
    };

    this.contexts.set(key, updatedContext);

    if (!this.contextSnapshots.has(key)) {
      this.contextSnapshots.set(key, new Map());
    }
    this.contextSnapshots.get(key)!.set(nextVersion, JSON.parse(JSON.stringify(updatedContext)));

    return updatedContext;
  }

  /**
   * Filters the shared context to only what the receiving agent role needs, preventing context pollution.
   */
  public filterContextForAgent(context: AgentTaskContext, recipientRole: AgentRole): AgentTaskContext {
    const filteredSharedState: Record<string, unknown> = {};

    // Common keys for all agents
    if (context.sharedState['objective']) filteredSharedState['objective'] = context.sharedState['objective'];
    if (context.sharedState['projectType']) filteredSharedState['projectType'] = context.sharedState['projectType'];
    if (context.sharedState['techStack']) filteredSharedState['techStack'] = context.sharedState['techStack'];

    switch (recipientRole) {
      case 'PLANNER_AGENT':
        Object.assign(filteredSharedState, context.sharedState);
        break;
      case 'CODING_AGENT':
        filteredSharedState['architecture'] = context.sharedState['architecture'];
        filteredSharedState['specifications'] = context.sharedState['specifications'];
        filteredSharedState['fileManifest'] = context.sharedState['fileManifest'];
        filteredSharedState['patches'] = context.sharedState['patches'];
        break;
      case 'DATABASE_AGENT':
        filteredSharedState['databaseRequirements'] = context.sharedState['databaseRequirements'];
        filteredSharedState['schema'] = context.sharedState['schema'];
        filteredSharedState['auth'] = context.sharedState['auth'];
        break;
      case 'TESTING_AGENT':
        filteredSharedState['fileManifest'] = context.sharedState['fileManifest'];
        filteredSharedState['testSuite'] = context.sharedState['testSuite'];
        filteredSharedState['buildTarget'] = context.sharedState['buildTarget'];
        break;
      case 'DEBUG_AGENT':
        filteredSharedState['testErrors'] = context.sharedState['testErrors'];
        filteredSharedState['failedStep'] = context.sharedState['failedStep'];
        filteredSharedState['sourceFiles'] = context.sharedState['sourceFiles'];
        break;
      case 'DEPLOYMENT_AGENT':
        filteredSharedState['deploymentTarget'] = context.sharedState['deploymentTarget'];
        filteredSharedState['buildArtifacts'] = context.sharedState['buildArtifacts'];
        filteredSharedState['githubCommit'] = context.sharedState['githubCommit'];
        break;
      case 'CEO_AGENT':
        // CEO receives summarized status
        filteredSharedState['summary'] = context.sharedState['summary'];
        filteredSharedState['liveUrl'] = context.sharedState['liveUrl'];
        filteredSharedState['deployStatus'] = context.sharedState['deployStatus'];
        filteredSharedState['testResults'] = context.sharedState['testResults'];
        break;
      default:
        Object.assign(filteredSharedState, context.sharedState);
    }

    return {
      ...context,
      sharedState: filteredSharedState,
    };
  }

  /**
   * Creates an immutable snapshot reference.
   */
  public createSnapshot(workspaceId: string, contextId: string): string {
    const context = this.getContext(workspaceId, contextId);
    if (!context) {
      throw new Error(`Context '${contextId}' not found in workspace '${workspaceId}'`);
    }
    return `snap_${context.contextId}_v${context.version}_${Date.now()}`;
  }

  /**
   * Diffs two versions of a context.
   */
  public diffContext(
    workspaceId: string,
    contextId: string,
    versionA: number,
    versionB: number
  ): Record<string, { from: unknown; to: unknown }> {
    const key = `${workspaceId}:${contextId}`;
    const snapshots = this.contextSnapshots.get(key);
    if (!snapshots) return {};

    const snapA = snapshots.get(versionA)?.sharedState || {};
    const snapB = snapshots.get(versionB)?.sharedState || {};

    const diff: Record<string, { from: unknown; to: unknown }> = {};
    const allKeys = Array.from(new Set([...Object.keys(snapA), ...Object.keys(snapB)]));

    for (const k of allKeys) {
      const valA = snapA[k];
      const valB = snapB[k];
      if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        diff[k] = { from: valA, to: valB };
      }
    }

    return diff;
  }
}

export const agentContextManager = new AgentContextManager();
