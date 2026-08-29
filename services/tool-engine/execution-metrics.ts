import { db } from '@/lib/db/store';
import { ExecutionMetrics } from '@/packages/types/src';

export class ExecutionMetricsService {
  /**
   * Record metrics for tool execution
   */
  public recordMetrics(metrics: Omit<ExecutionMetrics, 'id' | 'createdAt'>): ExecutionMetrics {
    return db.recordExecutionMetrics(metrics);
  }

  /**
   * Get metrics by execution ID
   */
  public getMetrics(executionId: string): ExecutionMetrics | undefined {
    return db.getExecutionMetrics(executionId);
  }
}

export const executionMetricsService = new ExecutionMetricsService();
