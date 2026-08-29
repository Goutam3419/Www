import { RefactorLogRecord } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { fileEditorService } from './file-editor';
import { importManagerService } from './import-manager';

export class RefactorEngineService {
  public renameSymbol(params: {
    codeProjectId: string;
    workspaceId: string;
    projectId: string;
    oldSymbol: string;
    newSymbol: string;
  }): { success: boolean; filesModified: number; log?: RefactorLogRecord; error?: string } {
    const files = dbStore.getFilesForCodeProject(params.codeProjectId);
    const affectedFiles: string[] = [];

    files.forEach(file => {
      if (file.content && file.content.includes(params.oldSymbol)) {
        const regex = new RegExp(`\\b${params.oldSymbol}\\b`, 'g');
        const updatedContent = file.content.replace(regex, params.newSymbol);

        fileEditorService.editFile({
          codeProjectId: params.codeProjectId,
          filePath: file.path,
          content: updatedContent,
          workspaceId: params.workspaceId,
          projectId: params.projectId,
          description: `Refactored symbol: ${params.oldSymbol} -> ${params.newSymbol}`
        });

        affectedFiles.push(file.path);
      }
    });

    const refactorLog: RefactorLogRecord = {
      id: `refactor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      codeProjectId: params.codeProjectId,
      action: 'rename_symbol',
      targetSymbol: params.oldSymbol,
      newSymbol: params.newSymbol,
      affectedFiles,
      performedAt: new Date().toISOString()
    };

    dbStore.createRefactorLog(refactorLog);

    return {
      success: true,
      filesModified: affectedFiles.length,
      log: refactorLog
    };
  }

  public optimizeImports(params: {
    codeProjectId: string;
    workspaceId: string;
    projectId: string;
    filePath?: string;
  }): { success: boolean; filesModified: number; log?: RefactorLogRecord } {
    const files = dbStore.getFilesForCodeProject(params.codeProjectId);
    const targetFiles = params.filePath ? files.filter(f => f.path === params.filePath) : files;
    const affectedFiles: string[] = [];

    targetFiles.forEach(file => {
      if (file.content) {
        const cleaned = importManagerService.cleanUnusedImports(file.content);
        if (cleaned !== file.content) {
          fileEditorService.editFile({
            codeProjectId: params.codeProjectId,
            filePath: file.path,
            content: cleaned,
            workspaceId: params.workspaceId,
            projectId: params.projectId,
            description: `Optimized and cleaned imports in ${file.name}`
          });
          affectedFiles.push(file.path);
        }
      }
    });

    const refactorLog: RefactorLogRecord = {
      id: `refactor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      codeProjectId: params.codeProjectId,
      action: 'optimize_imports',
      affectedFiles,
      performedAt: new Date().toISOString()
    };

    dbStore.createRefactorLog(refactorLog);

    return {
      success: true,
      filesModified: affectedFiles.length,
      log: refactorLog
    };
  }

  public executeRefactor(params: {
    codeProjectId: string;
    projectId: string;
    workspaceId: string;
    refactorType: string;
    targetFilePath: string;
    secondaryFilePath?: string;
    symbolOldName?: string;
    symbolNewName?: string;
    extractedName?: string;
    extractedCode?: string;
    author?: string;
  }): { success: boolean; patchId?: string; message: string } {
    if (params.symbolOldName && params.symbolNewName) {
      const res = this.renameSymbol({
        codeProjectId: params.codeProjectId,
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        oldSymbol: params.symbolOldName,
        newSymbol: params.symbolNewName
      });
      return { success: res.success, patchId: res.log?.id, message: `Renamed symbol ${params.symbolOldName} to ${params.symbolNewName}` };
    }

    const res = this.optimizeImports({
      codeProjectId: params.codeProjectId,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      filePath: params.targetFilePath
    });
    return { success: res.success, patchId: res.log?.id, message: `Refactored ${params.targetFilePath}` };
  }
}

export const refactorEngineService = new RefactorEngineService();
