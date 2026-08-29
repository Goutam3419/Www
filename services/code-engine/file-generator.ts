import { GeneratedFileRecord, SupportedLanguage, SupportedFramework } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class FileGeneratorService {
  public generateFile(
    codeProjectIdOrOptions: string | {
      codeProjectId: string;
      projectId: string;
      workspaceId: string;
      name: string;
      fileType: string;
      language: SupportedLanguage;
      folderPath?: string;
      rawContent?: string;
    },
    projectId?: string,
    workspaceId?: string,
    spec?: { name: string; fileType: string; language: SupportedLanguage; framework?: SupportedFramework },
    folderPath: string = 'src'
  ): GeneratedFileRecord {
    if (typeof codeProjectIdOrOptions === 'object') {
      const opts = codeProjectIdOrOptions;
      const fullPath = opts.folderPath ? `${opts.folderPath}/${opts.name}` : opts.name;
      const file: GeneratedFileRecord = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        codeProjectId: opts.codeProjectId,
        projectId: opts.projectId,
        workspaceId: opts.workspaceId,
        name: opts.name,
        path: fullPath,
        fileType: (opts.fileType as GeneratedFileRecord['fileType']) || 'Component',
        language: opts.language || 'TypeScript',
        content: opts.rawContent || `// ${opts.name}\nexport default function ${opts.name.split('.')[0]}() {\n  return <div>${opts.name}</div>;\n}\n`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbStore.createGeneratedFile(file);
      return file;
    }

    const fullPath = `${folderPath}/${spec!.name}`;
    const file: GeneratedFileRecord = {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      codeProjectId: codeProjectIdOrOptions,
      projectId: projectId!,
      workspaceId: workspaceId!,
      name: spec!.name,
      path: fullPath,
      fileType: (spec!.fileType as GeneratedFileRecord['fileType']) || 'Component',
      language: spec!.language || 'TypeScript',
      content: `// ${spec!.name}\n// Generated file for ${spec!.fileType}\n\nexport default function ${spec!.name.split('.')[0]}() {\n  return <div>${spec!.name}</div>;\n}\n`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbStore.createGeneratedFile(file);
    return file;
  }

  public generateFolder(
    codeProjectId: string,
    projectId: string,
    workspaceId: string,
    folderPath: string
  ) {
    const folder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      codeProjectId,
      projectId,
      workspaceId,
      name: folderPath.split('/').pop() || folderPath,
      path: folderPath,
      parentPath: folderPath.split('/').slice(0, -1).join('/') || '/',
      createdAt: new Date().toISOString()
    };
    dbStore.setFolder(folder);
    return folder;
  }

  public generateProject(params: {
    projectId: string;
    workspaceId: string;
    projectName: string;
    framework: SupportedFramework;
    language?: SupportedLanguage;
    packageManager?: string;
    architecture?: string;
    rootPath?: string;
  }) {
    const codeProjectId = `cp_${Date.now()}`;
    const codeProject = {
      id: codeProjectId,
      projectId: params.projectId,
      workspaceId: params.workspaceId,
      name: params.projectName,
      framework: params.framework,
      language: params.language || 'TypeScript',
      packageManager: (params.packageManager as 'npm' | 'yarn' | 'pnpm' | 'pip' | 'flutter') || 'npm',
      rootPath: params.rootPath || '/',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.setCodeProject(codeProject);

    const mainFile = this.generateFile(
      codeProjectId,
      params.projectId,
      params.workspaceId,
      { name: 'App.tsx', fileType: 'Component', language: params.language || 'TypeScript', framework: params.framework },
      'src'
    );

    return {
      codeProject,
      initialFiles: [mainFile]
    };
  }
}

export const fileGeneratorService = new FileGeneratorService();
