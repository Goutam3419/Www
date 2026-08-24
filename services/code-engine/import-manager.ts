import { SupportedLanguage } from '@/packages/types/src';

export interface ExtractedImport {
  statement: string;
  moduleSource: string;
  importedMembers: string[];
  isDefaultImport: boolean;
  defaultMember?: string;
}

export class ImportManager {
  public extractImports(code: string, language: SupportedLanguage = 'TypeScript'): string[] {
    const imports: string[] = [];
    if (!code) return imports;

    const tsImportRegex = /import\s+(?:type\s+)?(?:(\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = tsImportRegex.exec(code)) !== null) {
      if (match[3]) imports.push(match[3]);
    }

    return imports;
  }

  public extractExports(code: string): string[] {
    const exports: string[] = [];
    if (!code) return exports;

    const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|type|interface|var|let)\s+(\w+)/g;
    let match;
    while ((match = exportRegex.exec(code)) !== null) {
      if (match[1]) exports.push(match[1]);
    }

    return exports;
  }

  public cleanUnusedImports(code: string): string {
    if (!code) return code;
    const lines = code.split('\n');
    const importRegex = /^import\s+(?:type\s+)?(?:(\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"];?$/;

    const cleanedLines = lines.filter(line => {
      const match = line.trim().match(importRegex);
      if (!match) return true;

      const namedMembers = match[2];
      if (namedMembers) {
        const members = namedMembers.split(',').map(m => m.trim().split(' as ')[0].trim());
        const isAnyUsed = members.some(m => {
          if (!m) return false;
          const regex = new RegExp(`\\b${m}\\b`, 'g');
          const matches = code.match(regex) || [];
          return matches.length > 1;
        });
        return isAnyUsed;
      }

      return true;
    });

    return cleanedLines.join('\n');
  }

  public findDuplicateImports(code: string, language: SupportedLanguage = 'TypeScript'): string[] {
    const extracted = this.extractImports(code, language);
    const sourcesSeen = new Set<string>();
    const duplicates = new Set<string>();

    for (const source of extracted) {
      if (sourcesSeen.has(source)) {
        duplicates.add(source);
      } else {
        sourcesSeen.add(source);
      }
    }

    return Array.from(duplicates);
  }

  public resolvePathAlias(importPath: string): string {
    if (importPath.startsWith('@/')) {
      const suffix = importPath.substring(2);
      return `./${suffix}`;
    }
    return importPath;
  }
}

export const importManagerService = new ImportManager();
