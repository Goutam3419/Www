import { codeReaderService } from './code-reader';
import { conflictDetectorService } from './conflict-detector';
import { diffEngineService } from './diff-engine';
import { patchEngineService } from './patch-engine';
import { changeValidatorService } from './change-validator';
import { fileEditorService } from './file-editor';
import { multiFileEditorService } from './multi-file-editor';
import { refactorEngineService } from './refactor-engine';
import { rollbackEngineService } from './rollback-engine';
import { changeHistoryService } from './change-history';
import { templateEngineService } from './template-engine';
import { dependencyAnalyzerService } from './dependency-analyzer';
import { fileGeneratorService } from './file-generator';
import { SupportedFramework, SupportedLanguage } from '@/packages/types/src';

export class CodeEngineService {
  public reader = codeReaderService;
  public conflicts = conflictDetectorService;
  public diff = diffEngineService;
  public diffs = diffEngineService;
  public patch = patchEngineService;
  public patches = patchEngineService;
  public validator = changeValidatorService;
  public editor = fileEditorService;
  public multiEditor = multiFileEditorService;
  public refactor = refactorEngineService;
  public refactoring = refactorEngineService;
  public rollback = rollbackEngineService;
  public history = changeHistoryService;
  public templates = templateEngineService;
  public dependencyAnalyzer = dependencyAnalyzerService;
  public generator = fileGeneratorService;

  public getTemplates() {
    return templateEngineService.getTemplates();
  }

  public analyzeDependencies(codeProjectId: string, projectId: string, framework: SupportedFramework) {
    return dependencyAnalyzerService.analyzeDependencies(codeProjectId, projectId, framework);
  }

  public validateCode(content: string, fileName: string, language: SupportedLanguage) {
    return changeValidatorService.validateCode(content, fileName, language);
  }

  public generateFile(
    codeProjectId: string,
    projectId: string,
    workspaceId: string,
    spec: { name: string; fileType: string; language: SupportedLanguage; framework?: SupportedFramework },
    folderPath: string = 'src'
  ) {
    return fileGeneratorService.generateFile(codeProjectId, projectId, workspaceId, spec, folderPath);
  }

  public generateFolder(
    codeProjectId: string,
    projectId: string,
    workspaceId: string,
    folderPath: string
  ) {
    return fileGeneratorService.generateFolder(codeProjectId, projectId, workspaceId, folderPath);
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
    return fileGeneratorService.generateProject(params);
  }

  public getCapabilities() {
    return {
      supportedFrameworks: ['Next.js', 'React', 'FastAPI', 'Express', 'Flutter', 'Blank Project'],
      supportedLanguages: ['TypeScript', 'JavaScript', 'Python', 'Dart'],
      features: [
        'AST-Aware Multi-File Editing',
        'Atomic Code Patching & Transaction Rollback',
        'Dependency Tree Analysis',
        'Conflict Detection Engine',
        'Template Instantiation'
      ]
    };
  }
}

export const codeEngineService = new CodeEngineService();
