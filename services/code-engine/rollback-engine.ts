import { RollbackHistoryRecord } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { fileEditorService } from './file-editor';

export class RollbackEngineService {
  public rollbackPatch(params: {
    codeProjectId: string;
    workspaceId: string;
    projectId: string;
    targetPatchId: string;
    reason?: string;
  }): { success: boolean; rollbackRecord?: RollbackHistoryRecord; error?: string } {
    const patch = dbStore.getCodePatch(params.targetPatchId);
    if (!patch) {
      return { success: false, error: 'Target patch not found.' };
    }

    const diffs = dbStore.getDiffsForPatch(params.targetPatchId);
    const rolledBackFiles: string[] = [];

    diffs.forEach(diff => {
      fileEditorService.editFile({
        codeProjectId: params.codeProjectId,
        filePath: diff.filePath,
        content: diff.oldContent,
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        description: `Rollback patch ${patch.patchId}: ${params.reason || 'Manual user rollback'}`
      });
      rolledBackFiles.push(diff.filePath);
    });

    // Mark patch as rolled back
    patch.status = 'rolled_back';
    dbStore.createCodePatch(patch);

    const rollbackRecord: RollbackHistoryRecord = {
      id: `rollback_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      codeProjectId: params.codeProjectId,
      targetPatchId: params.targetPatchId,
      rolledBackFiles,
      performedAt: new Date().toISOString(),
      reason: params.reason || 'User initiated rollback'
    };

    dbStore.createRollbackRecord(rollbackRecord);

    return {
      success: true,
      rollbackRecord
    };
  }

  public rollbackFileToSnapshot(params: {
    codeProjectId: string;
    workspaceId: string;
    projectId: string;
    filePath: string;
  }): { success: boolean; error?: string } {
    const history = dbStore.getFileHistory(params.filePath);
    if (!history || history.length === 0) {
      return { success: false, error: 'No history snapshot found for file.' };
    }

    const latestSnapshot = history[history.length - 1];
    fileEditorService.editFile({
      codeProjectId: params.codeProjectId,
      filePath: params.filePath,
      content: latestSnapshot.content,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      description: `Reverted file to previous snapshot (${latestSnapshot.snapshotAt})`
    });

    return { success: true };
  }

  public getRollbackHistory(codeProjectId: string): RollbackHistoryRecord[] {
    return dbStore.getRollbackHistoryForCodeProject(codeProjectId);
  }

  public executeRollback(params: {
    codeProjectId: string;
    projectId: string;
    workspaceId: string;
    rollbackType: string;
    targetPatchId?: string;
    filePath?: string;
    targetTimestamp?: string;
    author?: string;
    reason?: string;
  }): { success: boolean; rolledBackFiles?: string[]; message?: string } {
    if (params.targetPatchId) {
      const res = this.rollbackPatch({
        codeProjectId: params.codeProjectId,
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        targetPatchId: params.targetPatchId,
        reason: params.reason
      });
      if (!res.success) {
        return { success: false, message: res.error || 'Failed to rollback patch' };
      }
      return {
        success: true,
        rolledBackFiles: res.rollbackRecord?.rolledBackFiles || [],
        message: `Successfully rolled back patch ${params.targetPatchId}`
      };
    }

    if (params.filePath) {
      const res = this.rollbackFileToSnapshot({
        codeProjectId: params.codeProjectId,
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        filePath: params.filePath
      });
      if (!res.success) {
        return { success: false, message: res.error || 'Failed to revert file' };
      }
      return {
        success: true,
        rolledBackFiles: [params.filePath],
        message: `Successfully reverted ${params.filePath} to latest snapshot`
      };
    }

    return { success: false, message: 'Invalid rollback parameters provided.' };
  }
}

export const rollbackEngineService = new RollbackEngineService();
