import { ToolExecutionLog } from '@/packages/types/src';

export class ToolLoggerService {
  private logs: ToolExecutionLog[] = [];

  public logExecution(logInput: Omit<ToolExecutionLog, 'id'>): ToolExecutionLog {
    const id = `tlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const log: ToolExecutionLog = {
      ...logInput,
      id
    };
    this.logs.unshift(log);
    if (this.logs.length > 500) this.logs.pop();
    return log;
  }

  public getLogs(workspaceId?: string, projectId?: string): ToolExecutionLog[] {
    let list = this.logs;
    if (workspaceId) list = list.filter(l => l.workspaceId === workspaceId);
    if (projectId) list = list.filter(l => l.projectId === projectId);
    return list;
  }
}

export const toolLoggerService = new ToolLoggerService();
