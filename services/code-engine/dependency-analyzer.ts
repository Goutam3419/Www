import { DependencyAnalysisRecord, SupportedFramework } from '@/packages/types/src';

export class DependencyAnalyzerService {
  public analyzeDependencies(
    codeProjectId: string,
    _projectId: string,
    framework: SupportedFramework
  ): DependencyAnalysisRecord {
    return {
      codeProjectId,
      framework,
      dependencies: [
        { name: 'next', version: '^15.1.0', isDev: false },
        { name: 'react', version: '^19.0.0', isDev: false },
        { name: 'tailwindcss', version: '^4.0.0', isDev: true },
        { name: 'typescript', version: '^5.7.2', isDev: true }
      ],
      missingDependencies: [],
      recommendedDependencies: ['lucide-react', 'clsx', 'tailwind-merge', 'motion']
    };
  }

  public analyzeProjectDependencies(
    codeProjectId: string,
    projectId: string,
    framework: SupportedFramework,
    packageManager?: string,
    defaultDependencies?: string[],
    defaultDevDependencies?: string[]
  ): DependencyAnalysisRecord {
    return this.analyzeDependencies(codeProjectId, projectId, framework);
  }
}

export class PackageManagerInterface {
  public static generateInstallCommand(pm: string = 'npm', pkgs: string[] = []): { command: string; args: string[] } {
    if (pm === 'yarn') {
      return { command: 'yarn', args: ['add', ...pkgs] };
    }
    if (pm === 'pnpm') {
      return { command: 'pnpm', args: ['add', ...pkgs] };
    }
    return { command: 'npm', args: ['install', ...pkgs] };
  }
}

export const dependencyAnalyzerService = new DependencyAnalyzerService();
