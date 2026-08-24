import { ToolEventLog } from '@/packages/types/src';

export class ToolEventManagerService {
  private events: ToolEventLog[] = [];

  public emitEvent(
    toolId: string,
    eventType: string,
    message: string,
    details?: Record<string, unknown>,
    workspaceId: string = 'ws_default_01'
  ): ToolEventLog {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const event: ToolEventLog = {
      id,
      toolId,
      eventType,
      message,
      details,
      createdAt: new Date().toISOString()
    };
    this.events.unshift(event);
    if (this.events.length > 200) this.events.pop();
    return event;
  }

  public getEvents(toolId?: string): ToolEventLog[] {
    if (toolId) return this.events.filter(e => e.toolId === toolId);
    return this.events;
  }
}

export const toolEventManagerService = new ToolEventManagerService();
