import { SupportedLanguage, SupportedFramework } from '@/packages/types/src';

export interface LanguageMeta {
  name: SupportedLanguage;
  extension: string;
  manifestFile: string;
  commentSingle: string;
  commentMultiOpen: string;
  commentMultiClose: string;
  popularFrameworks: SupportedFramework[];
}

export interface FrameworkMeta {
  name: SupportedFramework;
  primaryLanguage: SupportedLanguage;
  defaultFolders: string[];
  defaultRootFiles: string[];
  recommendedPackageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
}

export class LanguageManager {
  private static languages: Record<SupportedLanguage, LanguageMeta> = {
    TypeScript: {
      name: 'TypeScript',
      extension: '.ts',
      manifestFile: 'package.json',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['Next.js', 'React', 'Angular', 'Node.js', 'Express', 'React Native']
    },
    JavaScript: {
      name: 'JavaScript',
      extension: '.js',
      manifestFile: 'package.json',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['React', 'Vue', 'Node.js', 'Express', 'React Native']
    },
    Python: {
      name: 'Python',
      extension: '.py',
      manifestFile: 'pyproject.toml',
      commentSingle: '#',
      commentMultiOpen: '"""',
      commentMultiClose: '"""',
      popularFrameworks: ['FastAPI']
    },
    Go: {
      name: 'Go',
      extension: '.go',
      manifestFile: 'go.mod',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['Node.js']
    },
    Rust: {
      name: 'Rust',
      extension: '.rs',
      manifestFile: 'Cargo.toml',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['Blank Project']
    },
    Java: {
      name: 'Java',
      extension: '.java',
      manifestFile: 'pom.xml',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['Blank Project']
    },
    'C#': {
      name: 'C#',
      extension: '.cs',
      manifestFile: 'App.csproj',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['Blank Project']
    },
    PHP: {
      name: 'PHP',
      extension: '.php',
      manifestFile: 'composer.json',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['Blank Project']
    },
    Dart: {
      name: 'Dart',
      extension: '.dart',
      manifestFile: 'pubspec.yaml',
      commentSingle: '//',
      commentMultiOpen: '/*',
      commentMultiClose: '*/',
      popularFrameworks: ['Flutter']
    }
  };

  public static getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(this.languages) as SupportedLanguage[];
  }

  public static getMeta(language: SupportedLanguage): LanguageMeta {
    return this.languages[language] || this.languages['TypeScript'];
  }
}

export class FrameworkManager {
  private static frameworks: Record<SupportedFramework, FrameworkMeta> = {
    'Next.js': {
      name: 'Next.js',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['app', 'app/api', 'components', 'components/ui', 'lib', 'types', 'public'],
      defaultRootFiles: ['next.config.ts', 'tsconfig.json', 'package.json', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    React: {
      name: 'React',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['src', 'src/components', 'src/hooks', 'src/services', 'src/types', 'public'],
      defaultRootFiles: ['vite.config.ts', 'tsconfig.json', 'package.json', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    Vue: {
      name: 'Vue',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['src', 'src/components', 'src/views', 'src/store', 'src/types', 'public'],
      defaultRootFiles: ['vite.config.ts', 'tsconfig.json', 'package.json', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    Angular: {
      name: 'Angular',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['src', 'src/app', 'src/app/components', 'src/app/services', 'src/assets'],
      defaultRootFiles: ['angular.json', 'tsconfig.json', 'package.json', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    'Node.js': {
      name: 'Node.js',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['src', 'src/controllers', 'src/services', 'src/utils', 'src/types'],
      defaultRootFiles: ['tsconfig.json', 'package.json', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    Express: {
      name: 'Express',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['src', 'src/routes', 'src/controllers', 'src/middleware', 'src/services', 'src/types'],
      defaultRootFiles: ['tsconfig.json', 'package.json', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    FastAPI: {
      name: 'FastAPI',
      primaryLanguage: 'Python',
      defaultFolders: ['app', 'app/api', 'app/core', 'app/models', 'app/schemas', 'app/services', 'tests'],
      defaultRootFiles: ['main.py', 'requirements.txt', 'pyproject.toml', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    Flutter: {
      name: 'Flutter',
      primaryLanguage: 'Dart',
      defaultFolders: ['lib', 'lib/views', 'lib/widgets', 'lib/controllers', 'lib/models', 'test'],
      defaultRootFiles: ['pubspec.yaml', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    'React Native': {
      name: 'React Native',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['src', 'src/components', 'src/screens', 'src/navigation', 'src/services'],
      defaultRootFiles: ['app.json', 'package.json', 'tsconfig.json', 'README.md'],
      recommendedPackageManager: 'npm'
    },
    'Blank Project': {
      name: 'Blank Project',
      primaryLanguage: 'TypeScript',
      defaultFolders: ['src', 'docs'],
      defaultRootFiles: ['package.json', 'README.md'],
      recommendedPackageManager: 'npm'
    }
  };

  public static getSupportedFrameworks(): SupportedFramework[] {
    return Object.keys(this.frameworks) as SupportedFramework[];
  }

  public static getMeta(framework: SupportedFramework): FrameworkMeta {
    return this.frameworks[framework] || this.frameworks['Next.js'];
  }
}
