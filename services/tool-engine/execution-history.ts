import { db } from '@/lib/db/store';
import { ExecutionHistoryItem } from '@/packages/types/src';

export class ExecutionHistoryService {
  /**
   * Save execution history entry
   */
  public recordHistory(item: Omit<ExecutionHistoryItem, 'id'>): ExecutionHistoryItem {
    return db.recordExecutionHistory(item);
  }

  /**
   * Get historical execution entries
   */
  public getHistory(toolId?: string, workspaceId?: string): ExecutionHistoryItem[] {
    return db.getExecutionHistory(toolId, workspaceId);
  }
}

export const executionHistoryService = new ExecutionHistoryService();
