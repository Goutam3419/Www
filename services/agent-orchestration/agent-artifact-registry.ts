import { AgentArtifact, AgentArtifactType, AgentRole } from '@/packages/types/src';
import { sanitizeSecretsInValue } from './workflow-state-manager';
import { dbStore } from '@/lib/db/store';

export class AgentArtifactRegistry {
  private artifacts: Map<string, AgentArtifact> = new Map(); // key: `${workspaceId}:${artifactId}`

  /**
   * Registers a newly generated artifact.
   */
  public registerArtifact(
    artifact: Omit<AgentArtifact, 'artifactId' | 'createdAt'> & { artifactId?: string; createdAt?: string }
  ): AgentArtifact {
    const artifactId = artifact.artifactId || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedMetadata = sanitizeSecretsInValue(artifact.metadata || {}) as Record<string, unknown>;
    const sanitizedData = artifact.data ? (sanitizeSecretsInValue(artifact.data) as Record<string, unknown>) : undefined;

    const fullArtifact: AgentArtifact = {
      artifactId,
      workspaceId: artifact.workspaceId,
      workflowId: artifact.workflowId,
      stepId: artifact.stepId,
      producerAgent: artifact.producerAgent,
      producerRole: artifact.producerRole,
      type: artifact.type,
      name: artifact.name,
      description: artifact.description,
      uri: artifact.uri,
      data: sanitizedData,
      checksum: artifact.checksum || `chk_${Math.random().toString(36).substring(2, 10)}`,
      version: artifact.version || '1.0.0',
      metadata: sanitizedMetadata,
      createdAt: artifact.createdAt || new Date().toISOString(),
    };

    const key = `${artifact.workspaceId}:${artifactId}`;
    this.artifacts.set(key, fullArtifact);

    dbStore.logWorkspaceActivity({
      workspaceId: artifact.workspaceId,
      eventType: 'ARTIFACT_CREATED',
      title: `Artifact Produced: ${fullArtifact.name} (${fullArtifact.type})`,
      description: `Producer: ${fullArtifact.producerRole} | Step: ${fullArtifact.stepId}`,
      details: {
        artifactId,
        workflowId: fullArtifact.workflowId,
        type: fullArtifact.type,
        checksum: fullArtifact.checksum,
      },
    });

    return fullArtifact;
  }

  /**
   * Retrieves an artifact by ID, ensuring strict workspace isolation.
   */
  public getArtifact(workspaceId: string, artifactId: string): AgentArtifact | null {
    const key = `${workspaceId}:${artifactId}`;
    const art = this.artifacts.get(key);
    if (!art || art.workspaceId !== workspaceId) return null;
    return art;
  }

  /**
   * Lists artifacts for a workflow.
   */
  public listWorkflowArtifacts(
    workspaceId: string,
    workflowId: string,
    filter?: { type?: AgentArtifactType; producerRole?: AgentRole; stepId?: string }
  ): AgentArtifact[] {
    const results: AgentArtifact[] = [];
    for (const art of this.artifacts.values()) {
      if (art.workspaceId !== workspaceId || art.workflowId !== workflowId) continue;
      if (filter?.type && art.type !== filter.type) continue;
      if (filter?.producerRole && art.producerRole !== filter.producerRole) continue;
      if (filter?.stepId && art.stepId !== filter.stepId) continue;
      results.push(art);
    }
    return results;
  }
}

export const agentArtifactRegistry = new AgentArtifactRegistry();
