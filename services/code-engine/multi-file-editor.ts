import { CodePatchRecord } from '@/packages/types/src';
import { fileEditorService } from './file-editor';
import { patchEngineService } from './patch-engine';

export interface MultiFileOperation {
  action: 'create' | 'update' | 'delete';
  filePath: string;
  content?: string;
}

export class MultiFileEditorService {
  public executeMultiFileEdit(params: {
    codeProjectId: string;
    projectId: string;
    workspaceId: string;
    sessionTitle?: string;
    author?: string;
    reason?: string;
    operations: Array<{
      filePath: string;
      operation?: string;
      action?: 'create' | 'update' | 'delete';
      content?: string;
      newPath?: string;
      targetString?: string;
      replacementString?: string;
    }>;
  }): { success: boolean; modifiedFiles?: string[]; sessionId?: string; patchId?: string; error?: string } {
    const formattedOps: MultiFileOperation[] = params.operations.map(op => {
      let action: 'create' | 'update' | 'delete' = 'update';
      if (op.action) {
        action = op.action;
      } else if (op.operation === 'DELETE') {
        action = 'delete';
      } else if (op.operation === 'CREATE') {
        action = 'create';
      }
      return {
        action,
        filePath: op.newPath || op.filePath,
        content: op.content || ''
      };
    });

    const res = this.executeTransaction({
      codeProjectId: params.codeProjectId,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      description: params.reason || params.sessionTitle || 'Multi-file edit session',
      operations: formattedOps
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    return {
      success: true,
      modifiedFiles: formattedOps.map(o => o.filePath),
      sessionId: `sess_${Date.now()}`,
      patchId: res.patch?.patchId
    };
  }

  public executeTransaction(params: {
    codeProjectId: string;
    workspaceId: string;
    projectId: string;
    description: string;
    operations: MultiFileOperation[];
  }): { success: boolean; patch?: CodePatchRecord; filesUpdated: number; error?: string } {
    if (!params.operations || params.operations.length === 0) {
      return { success: false, filesUpdated: 0, error: 'No operations provided in transaction.' };
    }

    const modifiedPaths: string[] = [];

    for (const op of params.operations) {
      if (op.action === 'create' || op.action === 'update') {
        const res = fileEditorService.editFile({
          codeProjectId: params.codeProjectId,
          filePath: op.filePath,
          content: op.content || '',
          workspaceId: params.workspaceId,
          projectId: params.projectId,
          description: params.description
        });
        if (!res.success) {
          return { success: false, filesUpdated: modifiedPaths.length, error: res.error };
        }
        modifiedPaths.push(op.filePath);
      } else if (op.action === 'delete') {
        const res = fileEditorService.deleteFile({
          codeProjectId: params.codeProjectId,
          filePath: op.filePath,
          workspaceId: params.workspaceId,
          projectId: params.projectId
        });
        if (!res.success) {
          return { success: false, filesUpdated: modifiedPaths.length, error: res.error };
        }
        modifiedPaths.push(op.filePath);
      }
    }

    const masterPatch = patchEngineService.createPatch({
      codeProjectId: params.codeProjectId,
      description: `[Multi-File Batch] ${params.description}`,
      filesModified: modifiedPaths,
      affectedComponents: modifiedPaths.map(p => p.split('/').pop() || p),
      appliedBy: 'AI Multi-File Transaction Engine'
    });

    return {
      success: true,
      patch: masterPatch,
      filesUpdated: modifiedPaths.length
    };
  }
}

export const multiFileEditorService = new MultiFileEditorService();
