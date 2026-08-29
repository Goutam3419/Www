import { CodeProjectRecord, GeneratedFileRecord, CodeConflictIssue } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export interface CodeProjectOverview {
  codeProject: CodeProjectRecord;
  filesCount: number;
  totalLines: number;
  framework: string;
  language: string;
  detectedConflicts: CodeConflictIssue[];
}

export class CodeReaderService {
  public analyzeProject(codeProjectId: string): CodeProjectOverview | null {
    const codeProject = dbStore.getCodeProject(codeProjectId);
    if (!codeProject) return null;

    const files = dbStore.getFilesForCodeProject(codeProjectId);
    let totalLines = 0;
    files.forEach(f => {
      if (f.content) {
        totalLines += f.content.split('\n').length;
      }
    });

    const detectedConflicts = dbStore.getConflictsForCodeProject(codeProjectId);

    return {
      codeProject,
      filesCount: files.length,
      totalLines,
      framework: codeProject.framework,
      language: codeProject.language,
      detectedConflicts
    };
  }

  public analyzeCodeProject(codeProjectId: string): CodeProjectOverview | null {
    return this.analyzeProject(codeProjectId);
  }

  public getFileContent(filePath: string, codeProjectId?: string): GeneratedFileRecord | null {
    if (codeProjectId) {
      const files = dbStore.getFilesForCodeProject(codeProjectId);
      const file = files.find(f => f.path === filePath || f.name === filePath);
      if (file) return file;
    }

    const allProjects = dbStore.getAllProjects();
    for (const proj of allProjects) {
      const files = dbStore.getFilesForCodeProject(proj.id);
      const match = files.find(f => f.path === filePath || f.name === filePath);
      if (match) return match;
    }

    return null;
  }

  public getFileDetails(codeProjectId: string, filePath: string): GeneratedFileRecord | null {
    return this.getFileContent(filePath, codeProjectId);
  }

  public getProjectStructure(codeProjectId: string) {
    const folders = dbStore.getFoldersForCodeProject(codeProjectId);
    const files = dbStore.getFilesForCodeProject(codeProjectId);
    return { folders, files };
  }
}

export const codeReaderService = new CodeReaderService();
