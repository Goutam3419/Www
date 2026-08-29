import { WorkflowEvent, WorkflowEventType } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { sanitizeSecretsInValue } from './workflow-state-manager';

export type WorkflowEventListener = (event: WorkflowEvent) => void;

export class WorkflowEventBus {
  private listeners = new Set<WorkflowEventListener>();

  public subscribe(listener: WorkflowEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emits and logs a workflow event.
   */
  public emitEvent(
    workflowId: string,
    workspaceId: string,
    eventType: WorkflowEventType,
    details?: Record<string, unknown>,
    stepId?: string,
    agentId?: string
  ): WorkflowEvent {
    const sanitizedDetails = details ? (sanitizeSecretsInValue(details) as Record<string, unknown>) : undefined;

    const event: WorkflowEvent = {
      id: `wfe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workflowId,
      workspaceId,
      eventType,
      stepId,
      agentId,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
    };

    // Store in dbStore & audit log
    dbStore.addWorkflowEvent(
      workflowId,
      eventType,
      JSON.stringify({ stepId, agentId, ...sanitizedDetails })
    );

    dbStore.logWorkspaceActivity({
      workspaceId,
      eventType: `WORKFLOW_${eventType}`,
      title: `Workflow Event: ${eventType}`,
      description: stepId ? `Step: ${stepId}` : `Workflow: ${workflowId}`,
      details: { workflowId, stepId, agentId, ...(sanitizedDetails || {}) },
    });

    // Notify listeners
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Workflow event listener error:', err);
      }
    }

    return event;
  }
}

export const workflowEventBus = new WorkflowEventBus();
