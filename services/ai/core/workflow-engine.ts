import { db } from '@/lib/db/store';
import { AIWorkflow, WorkflowEvent } from '@/packages/types/src';

export class WorkflowEngine {
  public startWorkflow(workspaceId: string, projectId: string, conversationId: string, workflowType: string): AIWorkflow {
    return db.createWorkflow(workspaceId, projectId, conversationId, workflowType);
  }

  public updateStatus(workflowId: string, status: AIWorkflow['status']) {
    db.updateWorkflow(workflowId, { status });
  }

  public addEvent(workflowId: string, eventType: WorkflowEvent['eventType'], details: string) {
    db.addWorkflowEvent(workflowId, eventType, details);
  }

  public getWorkflowStatus(workflowId: string) {
    const wf = db.getWorkflow(workflowId);
    const events = db.getWorkflowEvents(workflowId);
    return { workflow: wf, events };
  }
}

export class EventSystem {
  public emit(projectId: string, eventName: string, payload: Record<string, unknown>) {
    db.addLog(projectId, 'INFO', 'EventSystem', `Event Emitted: ${eventName}`, payload);
  }
}

export const workflowEngine = new WorkflowEngine();
export const eventSystem = new EventSystem();
