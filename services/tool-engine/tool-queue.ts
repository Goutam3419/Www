import { ToolQueueItem, ToolQueueStatus } from '@/packages/types/src';

export class ToolQueueService {
  private queue: ToolQueueItem[] = [];

  public enqueue(
    executionId: string,
    toolId: string,
    toolName: string,
    workspaceId: string,
    projectId: string,
    userId: string,
    priority: number = 50
  ): ToolQueueItem {
    const item: ToolQueueItem = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      executionId,
      toolId,
      toolName,
      workspaceId,
      projectId,
      userId,
      status: 'QUEUED',
      priority,
      enqueuedAt: new Date().toISOString()
    };

    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority);
    return item;
  }

  public updateStatus(queueId: string, status: ToolQueueStatus): ToolQueueItem | undefined {
    const item = this.queue.find(q => q.id === queueId);
    if (item) {
      item.status = status;
      if (status === 'PROCESSING') item.startedAt = new Date().toISOString();
      if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
        item.completedAt = new Date().toISOString();
      }
    }
    return item;
  }

  public getQueue(): ToolQueueItem[] {
    return this.queue;
  }
}

export const toolQueueService = new ToolQueueService();
