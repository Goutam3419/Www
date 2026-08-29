import { CodePatchRecord, RollbackHistoryRecord, RefactorLogRecord, FileHistoryRecord } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class ChangeHistoryService {
  public getPatches(codeProjectId: string): CodePatchRecord[] {
    return dbStore.getPatchesForCodeProject(codeProjectId);
  }

  public getRollbacks(codeProjectId: string): RollbackHistoryRecord[] {
    return dbStore.getRollbackHistoryForCodeProject(codeProjectId);
  }

  public getRefactorLogs(codeProjectId: string): RefactorLogRecord[] {
    return dbStore.getRefactorLogsForCodeProject(codeProjectId);
  }

  public getFileSnapshots(filePath: string): FileHistoryRecord[] {
    return dbStore.getFileHistory(filePath);
  }

  public getFileHistory(_codeProjectId: string, filePath?: string): FileHistoryRecord[] {
    if (filePath) {
      return dbStore.getFileHistory(filePath);
    }
    return [];
  }

  public getEditSessions(codeProjectId: string) {
    const patches = dbStore.getPatchesForCodeProject(codeProjectId);
    return patches.map(p => ({
      sessionId: `sess_${p.patchId}`,
      title: p.description,
      appliedAt: p.appliedAt,
      modifiedFiles: p.filesModified
    }));
  }
}

export const changeHistoryService = new ChangeHistoryService();
