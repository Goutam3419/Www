import {
  CodeProjectRecord,
  SupportedFramework,
  SupportedLanguage,
  PackageManagerType,
  GeneratedFolderRecord,
  GeneratedFileRecord
} from '@/packages/types/src';
import { db } from '@/lib/db/store';
import { templateEngineService } from './template-engine';
import { folderGeneratorService } from './folder-generator';
import { fileGeneratorService } from './file-generator';
import { dependencyAnalyzerService } from './dependency-analyzer';
import { LanguageManager } from './language-framework-manager';

export interface GenerateProjectInput {
  projectId: string;
  workspaceId: string;
  projectName: string;
  framework: SupportedFramework;
  language?: SupportedLanguage;
  packageManager?: PackageManagerType;
  architecture?: string;
  rootPath?: string;
}

export interface GeneratedProjectResult {
  codeProject: CodeProjectRecord;
  folders: GeneratedFolderRecord[];
  files: GeneratedFileRecord[];
  summary: {
    totalFolders: number;
    totalFiles: number;
    language: SupportedLanguage;
    framework: SupportedFramework;
    packageManager: PackageManagerType;
  };
}

export class ProjectGeneratorService {
  public generateProjectStructure(input: GenerateProjectInput): GeneratedProjectResult {
    const template = templateEngineService.getTemplateByFramework(input.framework);

    const language = input.language || template.language || LanguageManager.getMeta(input.framework === 'FastAPI' ? 'Python' : 'TypeScript').name;
    const packageManager = input.packageManager || 'npm';
    const rootPath = input.rootPath || `./${input.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const architecture = input.architecture || `${input.framework} Modular Architecture`;

    // 1. Create & Persist CodeProjectRecord
    const codeProject = db.createCodeProject({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      name: input.projectName,
      language,
      framework: input.framework,
      architecture,
      rootPath,
      packageManager
    });

    // 2. Generate Folders
    const folders = folderGeneratorService.generateFoldersForProject(
      codeProject.id,
      input.projectId,
      input.workspaceId,
      input.framework,
      template.structure.folders
    );

    // 3. Generate Template Files
    const generatedFiles: GeneratedFileRecord[] = [];

    for (const fileDef of template.structure.files) {
      const parts = fileDef.path.split('/');
      const fileName = parts.pop() || fileDef.path;
      const folderPath = parts.join('/');

      const fileRecord = fileGeneratorService.generateFile({
        codeProjectId: codeProject.id,
        projectId: input.projectId,
        workspaceId: input.workspaceId,
        name: fileName.replace(/\.[^/.]+$/, ''),
        fileType: fileDef.fileType,
        language,
        folderPath,
        rawContent: fileDef.defaultContent
      });

      generatedFiles.push(fileRecord);
    }

    // 4. Perform Dependency Analysis
    dependencyAnalyzerService.analyzeProjectDependencies(
      codeProject.id,
      input.projectId,
      input.framework,
      packageManager,
      template.defaultDependencies,
      template.defaultDevDependencies
    );

    // Audit Event
    db.logAuditEvent({
      workspaceId: input.workspaceId,
      userId: 'usr_ceo_001',
      action: 'Code Project Structure Generated',
      details: {
        codeProjectId: codeProject.id,
        projectId: input.projectId,
        framework: input.framework,
        filesGenerated: generatedFiles.length
      }
    });

    return {
      codeProject,
      folders,
      files: generatedFiles,
      summary: {
        totalFolders: folders.length,
        totalFiles: generatedFiles.length,
        language,
        framework: input.framework,
        packageManager
      }
    };
  }

  public getProjectByProjectId(projectId: string): CodeProjectRecord | undefined {
    return db.getCodeProjectByProjectId(projectId);
  }
}

export const projectGeneratorService = new ProjectGeneratorService();
