import { CodeConflictIssue } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { importManagerService } from './import-manager';

export class ConflictDetectorService {
  public detectConflicts(codeProjectId: string): CodeConflictIssue[] {
    const files = dbStore.getFilesForCodeProject(codeProjectId);
    const conflicts: CodeConflictIssue[] = [];

    // 1. Detect Duplicate File Component Names
    const nameMap = new Map<string, string[]>();
    files.forEach(f => {
      const existing = nameMap.get(f.name) || [];
      existing.push(f.path);
      nameMap.set(f.name, existing);
    });

    nameMap.forEach((paths, name) => {
      if (paths.length > 1) {
        conflicts.push({
          id: `conflict_dup_${name}_${Date.now()}`,
          type: 'duplicate_component',
          title: `Duplicate Component Name: ${name}`,
          description: `Multiple files share the exact component name "${name}".`,
          affectedFiles: paths,
          severity: 'warning',
          suggestion: 'Rename one of the components or move it into a dedicated feature directory.'
        });
      }
    });

    // 2. Detect Duplicate Route Conflicts
    const routeMap = new Map<string, string[]>();
    files.forEach(f => {
      if (f.path.includes('app/') && (f.name.startsWith('page') || f.name.startsWith('route'))) {
        const existing = routeMap.get(f.path) || [];
        existing.push(f.path);
        routeMap.set(f.path, existing);
      }
    });

    // 3. Detect Circular & Unused Imports
    files.forEach(f => {
      if (f.content) {
        const dupImports = importManagerService.findDuplicateImports(f.content);
        if (dupImports.length > 0) {
          conflicts.push({
            id: `conflict_imp_${f.id}`,
            type: 'duplicate_import',
            title: `Duplicate Import Modules in ${f.name}`,
            description: `File "${f.path}" imports module(s) [${dupImports.join(', ')}] multiple times.`,
            affectedFiles: [f.path],
            severity: 'warning',
            suggestion: 'Consolidate multiple import statements into a single line.'
          });
        }
      }
    });

    // Persist detected conflicts
    conflicts.forEach(c => dbStore.createConflictIssue(c));
    return conflicts;
  }
}

export const conflictDetectorService = new ConflictDetectorService();
