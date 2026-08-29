import { GeneratedFolderRecord, SupportedFramework } from '@/packages/types/src';
import { db } from '@/lib/db/store';
import { FrameworkManager } from './language-framework-manager';

export class FolderGeneratorService {
  public generateFoldersForProject(
    codeProjectId: string,
    projectId: string,
    workspaceId: string,
    framework: SupportedFramework,
    customFolders?: string[]
  ): GeneratedFolderRecord[] {
    const meta = FrameworkManager.getMeta(framework);
    const foldersToCreate = Array.from(new Set([...meta.defaultFolders, ...(customFolders || [])]));

    const generated: GeneratedFolderRecord[] = [];

    for (const folderPath of foldersToCreate) {
      const parts = folderPath.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.length > 1 ? parts.slice(0, parts.length - 1).join('/') : undefined;

      const record = db.saveGeneratedFolder({
        codeProjectId,
        projectId,
        workspaceId,
        path: folderPath,
        name,
        parentPath
      });

      generated.push(record);
    }

    return generated;
  }

  public createCustomFolder(
    codeProjectId: string,
    projectId: string,
    workspaceId: string,
    folderPath: string
  ): GeneratedFolderRecord {
    const cleanPath = folderPath.replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.length > 1 ? parts.slice(0, parts.length - 1).join('/') : undefined;

    return db.saveGeneratedFolder({
      codeProjectId,
      projectId,
      workspaceId,
      path: cleanPath,
      name,
      parentPath
    });
  }

  public getFolders(codeProjectId: string): GeneratedFolderRecord[] {
    return db.getGeneratedFolders(codeProjectId);
  }
}

export const folderGeneratorService = new FolderGeneratorService();
