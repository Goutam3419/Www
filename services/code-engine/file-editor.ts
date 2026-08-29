import { GeneratedFileRecord, CodePatchRecord, CodeFileEditOp } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { patchEngineService } from './patch-engine';
import { diffEngineService } from './diff-engine';
import { changeValidatorService } from './change-validator';

export class FileEditorService {
  public executeFileEdit(params: {
    codeProjectId: string;
    projectId: string;
    workspaceId: string;
    filePath: string;
    operation: CodeFileEditOp;
    newPath?: string;
    content?: string;
    targetString?: string;
    replacementString?: string;
    linePosition?: number;
    author?: string;
    reason?: string;
  }): { success: boolean; file?: GeneratedFileRecord; patchId?: string; error?: string } {
    if (params.operation === 'DELETE') {
      const delRes = this.deleteFile({
        codeProjectId: params.codeProjectId,
        filePath: params.filePath,
        workspaceId: params.workspaceId,
        projectId: params.projectId
      });
      return { success: delRes.success, patchId: delRes.patch?.patchId, error: delRes.error };
    }

    let finalContent = params.content || '';
    if (params.operation === 'REPLACE_SUBSTRING' && params.targetString) {
      const files = dbStore.getFilesForCodeProject(params.codeProjectId);
      const existing = files.find(f => f.path === params.filePath || f.name === params.filePath);
      if (existing) {
        finalContent = existing.content.replace(params.targetString, params.replacementString || '');
      }
    }

    const editRes = this.editFile({
      codeProjectId: params.codeProjectId,
      filePath: params.newPath || params.filePath,
      content: finalContent,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      description: params.reason || `Executed ${params.operation} on ${params.filePath}`
    });

    return {
      success: editRes.success,
      file: editRes.file,
      patchId: editRes.patch?.patchId,
      error: editRes.error
    };
  }
  public editFile(params: {
    codeProjectId: string;
    filePath: string;
    content: string;
    workspaceId: string;
    projectId: string;
    description?: string;
  }): { success: boolean; file?: GeneratedFileRecord; patch?: CodePatchRecord; error?: string } {
    // 1. Pre-validation
    const validation = changeValidatorService.validateEdit({
      filePath: params.filePath,
      content: params.content,
      workspaceId: params.workspaceId,
      projectId: params.projectId
    });

    if (!validation.valid) {
      const errMsg = validation.issues.map(i => i.description).join('; ');
      return { success: false, error: `Validation Failed: ${errMsg}` };
    }

    // 2. Lookup existing file
    const files = dbStore.getFilesForCodeProject(params.codeProjectId);
    const existingFile = files.find(f => f.path === params.filePath || f.name === params.filePath);

    const oldContent = existingFile ? existingFile.content : '';

    // Record File History Snapshot
    dbStore.createFileHistory({
      id: `history_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      codeProjectId: params.codeProjectId,
      filePath: params.filePath,
      content: oldContent,
      snapshotAt: new Date().toISOString()
    });

    let updatedFile: GeneratedFileRecord;
    if (existingFile) {
      updatedFile = { ...existingFile, content: params.content, updatedAt: new Date().toISOString() };
      dbStore.updateGeneratedFile(updatedFile);
    } else {
      updatedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        codeProjectId: params.codeProjectId,
        projectId: params.projectId,
        workspaceId: params.workspaceId,
        name: params.filePath.split('/').pop() || params.filePath,
        path: params.filePath,
        fileType: 'Component',
        language: 'TypeScript',
        content: params.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbStore.createGeneratedFile(updatedFile);
    }

    // 3. Create Patch & Compute Diff
    const patch = patchEngineService.createPatch({
      codeProjectId: params.codeProjectId,
      description: params.description || `Edited file: ${params.filePath}`,
      filesModified: [params.filePath],
      affectedComponents: [updatedFile.name],
      appliedBy: 'AI File Editor'
    });

    diffEngineService.computeDiff(params.filePath, oldContent, params.content, patch.patchId);

    return { success: true, file: updatedFile, patch };
  }

  public deleteFile(params: {
    codeProjectId: string;
    filePath: string;
    workspaceId: string;
    projectId: string;
  }): { success: boolean; patch?: CodePatchRecord; error?: string } {
    const files = dbStore.getFilesForCodeProject(params.codeProjectId);
    const existing = files.find(f => f.path === params.filePath || f.name === params.filePath);

    if (!existing) {
      return { success: false, error: 'File not found.' };
    }

    dbStore.createFileHistory({
      id: `history_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      codeProjectId: params.codeProjectId,
      filePath: params.filePath,
      content: existing.content,
      snapshotAt: new Date().toISOString()
    });

    dbStore.deleteGeneratedFile(existing.id);

    const patch = patchEngineService.createPatch({
      codeProjectId: params.codeProjectId,
      description: `Deleted file: ${params.filePath}`,
      filesModified: [params.filePath],
      affectedComponents: [existing.name],
      appliedBy: 'AI File Editor'
    });

    diffEngineService.computeDiff(params.filePath, existing.content, '', patch.patchId);

    return { success: true, patch };
  }
}

export const fileEditorService = new FileEditorService();
