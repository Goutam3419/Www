import {
  AgentMessage,
  AgentMessageType,
  AgentRole,
  AgentCollaborationSession,
} from '@/packages/types/src';
import { sanitizeSecretsInValue } from './workflow-state-manager';
import { workflowEventBus } from './workflow-event-bus';
import { dbStore } from '@/lib/db/store';

export type AgentMessageListener = (message: AgentMessage) => void;

export interface AgentMessageFilter {
  workspaceId?: string;
  workflowId?: string;
  sessionId?: string;
  targetAgentId?: string;
  targetRole?: AgentRole;
  messageType?: AgentMessageType;
}

export class AgentCollaborationBus {
  private listeners: Set<{
    listener: AgentMessageListener;
    filter?: AgentMessageFilter;
  }> = new Set();

  private messages: Map<string, AgentMessage[]> = new Map(); // key: `${workspaceId}:${sessionIdOrWorkflowId}`
  private sessions: Map<string, AgentCollaborationSession> = new Map(); // key: `${workspaceId}:${workflowId}`
  private pendingRequests: Map<
    string,
    {
      resolve: (msg: AgentMessage) => void;
      reject: (err: Error) => void;
      timer: NodeJS.Timeout;
    }
  > = new Map();

  /**
   * Initializes or retrieves an active collaboration session.
   */
  public getOrCreateSession(
    workspaceId: string,
    workflowId: string,
    initialAgentIds: string[] = []
  ): AgentCollaborationSession {
    const sessionKey = `${workspaceId}:${workflowId}`;
    let session = this.sessions.get(sessionKey);
    if (!session) {
      session = {
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        workspaceId,
        workflowId,
        activeAgentIds: initialAgentIds,
        status: 'ACTIVE',
        messagesCount: 0,
        latestContextVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.sessions.set(sessionKey, session);
    } else if (initialAgentIds.length > 0) {
      const merged = Array.from(new Set([...session.activeAgentIds, ...initialAgentIds]));
      session.activeAgentIds = merged;
      session.updatedAt = new Date().toISOString();
    }
    return session;
  }

  /**
   * Subscribes a listener to agent messages with optional filtering.
   */
  public subscribe(listener: AgentMessageListener, filter?: AgentMessageFilter): () => void {
    const entry = { listener, filter };
    this.listeners.add(entry);
    return () => this.listeners.delete(entry);
  }

  /**
   * Publishes an agent message with secret redaction, workspace scoping, and deterministic ordering.
   */
  public async publishMessage(
    msg: Omit<AgentMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): Promise<AgentMessage> {
    const sanitizedPayload = msg.payload
      ? (sanitizeSecretsInValue(msg.payload) as Record<string, unknown>)
      : undefined;

    const message: AgentMessage = {
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspaceId: msg.workspaceId,
      workflowId: msg.workflowId,
      stepId: msg.stepId,
      sessionId: msg.sessionId,
      fromAgentId: msg.fromAgentId,
      fromAgentRole: msg.fromAgentRole,
      toAgentId: msg.toAgentId,
      toAgentRole: msg.toAgentRole,
      messageType: msg.messageType,
      content: sanitizeSecretsInValue(msg.content) as string,
      payload: sanitizedPayload,
      contextRef: msg.contextRef,
      artifactIds: msg.artifactIds || [],
      correlationId: msg.correlationId || `corr_${Date.now()}`,
      parentMessageId: msg.parentMessageId,
      timestamp: msg.timestamp || new Date().toISOString(),
    };

    // Store in session and workflow history
    const sessionKey = `${msg.workspaceId}:${msg.sessionId}`;
    const workflowKey = `${msg.workspaceId}:${msg.workflowId}`;

    if (!this.messages.has(sessionKey)) {
      this.messages.set(sessionKey, []);
    }
    this.messages.get(sessionKey)!.push(message);

    if (sessionKey !== workflowKey) {
      if (!this.messages.has(workflowKey)) {
        this.messages.set(workflowKey, []);
      }
      this.messages.get(workflowKey)!.push(message);
    }

    // Update session stats
    const session = this.sessions.get(workflowKey);
    if (session) {
      session.messagesCount = (session.messagesCount || 0) + 1;
      session.updatedAt = message.timestamp;
      if (message.fromAgentId && !session.activeAgentIds.includes(message.fromAgentId)) {
        session.activeAgentIds.push(message.fromAgentId);
      }
    }

    // Check if answering a pending requestResponse
    if (message.correlationId && this.pendingRequests.has(message.correlationId)) {
      const pending = this.pendingRequests.get(message.correlationId)!;
      clearTimeout(pending.timer);
      this.pendingRequests.delete(message.correlationId);
      pending.resolve(message);
    }

    // Emit event to WorkflowEventBus for unified logging and monitoring
    workflowEventBus.emitEvent(
      message.workflowId,
      message.workspaceId,
      'STEP_STARTED', // reuse or log
      {
        action: 'AGENT_COLLABORATION_MESSAGE',
        messageId: message.id,
        messageType: message.messageType,
        fromAgentRole: message.fromAgentRole,
        toAgentRole: message.toAgentRole,
        correlationId: message.correlationId,
      },
      message.stepId,
      message.fromAgentId
    );

    dbStore.logWorkspaceActivity({
      workspaceId: message.workspaceId,
      eventType: 'AGENT_MESSAGE',
      title: `Agent Message: ${message.fromAgentRole} -> ${message.toAgentRole || 'BROADCAST'}`,
      description: message.content.substring(0, 120),
      details: {
        messageId: message.id,
        workflowId: message.workflowId,
        messageType: message.messageType,
        correlationId: message.correlationId,
      },
    });

    // Notify matching subscribers
    for (const { listener, filter } of this.listeners) {
      if (filter) {
        if (filter.workspaceId && filter.workspaceId !== message.workspaceId) continue;
        if (filter.workflowId && filter.workflowId !== message.workflowId) continue;
        if (filter.sessionId && filter.sessionId !== message.sessionId) continue;
        if (filter.targetAgentId && message.toAgentId && filter.targetAgentId !== message.toAgentId) continue;
        if (filter.targetRole && message.toAgentRole && filter.targetRole !== message.toAgentRole) continue;
        if (filter.messageType && filter.messageType !== message.messageType) continue;
      }
      try {
        listener(message);
      } catch (err) {
        console.error('Agent collaboration message listener error:', err);
      }
    }

    return message;
  }

  /**
   * Broadcasts a message to all agents in the collaboration session.
   */
  public async broadcast(
    workspaceId: string,
    workflowId: string,
    sessionId: string,
    fromAgentId: string,
    fromRole: AgentRole,
    content: string,
    payload?: Record<string, unknown>,
    stepId?: string
  ): Promise<AgentMessage> {
    return this.publishMessage({
      workspaceId,
      workflowId,
      sessionId,
      stepId,
      fromAgentId,
      fromAgentRole: fromRole,
      messageType: 'STATUS',
      content,
      payload,
      correlationId: `bcast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    });
  }

  /**
   * Sends a request message and awaits a correlated response.
   */
  public async requestResponse(
    msg: Omit<AgentMessage, 'id' | 'timestamp'>,
    timeoutMs: number = 10000
  ): Promise<AgentMessage> {
    const correlationId = msg.correlationId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullMsg = { ...msg, correlationId };

    return new Promise<AgentMessage>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(correlationId)) {
          this.pendingRequests.delete(correlationId);
          reject(new Error(`Agent request timeout after ${timeoutMs}ms for correlationId '${correlationId}'`));
        }
      }, timeoutMs);

      this.pendingRequests.set(correlationId, { resolve, reject, timer });
      this.publishMessage(fullMsg).catch((err) => {
        clearTimeout(timer);
        this.pendingRequests.delete(correlationId);
        reject(err);
      });
    });
  }

  /**
   * Retrieves messages for a session or workflow, respecting workspace isolation.
   */
  public getSessionMessages(workspaceId: string, sessionIdOrWorkflowId: string): AgentMessage[] {
    const key = `${workspaceId}:${sessionIdOrWorkflowId}`;
    const msgs = this.messages.get(key) || [];
    // Verify strict workspace isolation
    return msgs.filter((m) => m.workspaceId === workspaceId);
  }

  /**
   * Clears messages for a session.
   */
  public clearSession(workspaceId: string, sessionId: string): void {
    const key = `${workspaceId}:${sessionId}`;
    this.messages.delete(key);
  }
}

export const agentCollaborationBus = new AgentCollaborationBus();
