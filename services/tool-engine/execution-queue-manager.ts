import { ToolQueueItem } from '@/packages/types/src';
import { toolQueueService } from './tool-queue';

export interface QueueItemDetails extends ToolQueueItem {
  queuePosition: number;
  retryCount: number;
  maxRetries: number;
}

export class ExecutionQueueManagerService {
  private retryCounts = new Map<string, number>();

  /**
   * Enqueues a tool execution request with custom priority and retry capabilities.
   */
  public enqueueExecution(
    executionId: string,
    toolId: string,
    toolName: string,
    workspaceId: string,
    projectId: string,
    userId: string,
    priority: number = 50
  ): QueueItemDetails {
    const item = toolQueueService.enqueue(
      executionId,
      toolId,
      toolName,
      workspaceId,
      projectId,
      userId,
      priority
    );
    this.retryCounts.set(item.id, 0);

    return this.enrichQueueItem(item);
  }

  /**
   * Cancels a queued or processing execution.
   */
  public cancelExecution(queueId: string): QueueItemDetails | undefined {
    const item = toolQueueService.updateStatus(queueId, 'CANCELLED');
    if (item) {
      return this.enrichQueueItem(item);
    }
    return undefined;
  }

  /**
   * Increments retry count for a queue item. Returns true if retry limit (3) is not reached.
   */
  public retryExecution(queueId: string, maxRetries: number = 3): boolean {
    const currentRetries = this.retryCounts.get(queueId) || 0;
    if (currentRetries < maxRetries) {
      this.retryCounts.set(queueId, currentRetries + 1);
      toolQueueService.updateStatus(queueId, 'QUEUED');
      return true;
    }
    toolQueueService.updateStatus(queueId, 'FAILED');
    return false;
  }

  /**
   * Retrieves full queue ordered by priority and queue position.
   */
  public getOrderedQueue(): QueueItemDetails[] {
    const queue = toolQueueService.getQueue();
    const queuedOrProcessing = queue.filter(q => q.status === 'QUEUED' || q.status === 'PROCESSING');

    return queue.map(item => {
      const position = queuedOrProcessing.findIndex(q => q.id === item.id);
      return {
        ...item,
        queuePosition: position >= 0 ? position + 1 : 0,
        retryCount: this.retryCounts.get(item.id) || 0,
        maxRetries: 3
      };
    });
  }

  private enrichQueueItem(item: ToolQueueItem): QueueItemDetails {
    const queue = toolQueueService.getQueue();
    const queuedOrProcessing = queue.filter(q => q.status === 'QUEUED' || q.status === 'PROCESSING');
    const position = queuedOrProcessing.findIndex(q => q.id === item.id);

    return {
      ...item,
      queuePosition: position >= 0 ? position + 1 : 0,
      retryCount: this.retryCounts.get(item.id) || 0,
      maxRetries: 3
    };
  }
}

export const executionQueueManagerService = new ExecutionQueueManagerService();
