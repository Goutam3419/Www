import { CodeTemplateRecord, SupportedFramework, SupportedLanguage } from '@/packages/types/src';

export class TemplateEngineService {
  private templates: Map<string, CodeTemplateRecord> = new Map();

  constructor() {
    this.seedDefaultTemplates();
  }

  private seedDefaultTemplates() {
    const nextjsTemplate: CodeTemplateRecord = {
      id: 'tmpl_nextjs_default',
      name: 'Next.js App Router Clean Starter',
      framework: 'Next.js',
      description: 'Production App Router setup with Tailwind CSS and TypeScript.',
      folderStructure: ['app/', 'components/', 'lib/', 'public/'],
      sampleFiles: [
        { path: 'app/page.tsx', content: 'export default function Home() { return <main>Hello World</main>; }' },
        { path: 'app/globals.css', content: '@import "tailwindcss";' }
      ],
      structure: {
        folders: ['app', 'components', 'lib', 'public'],
        files: [
          { path: 'app/page.tsx', fileType: 'Page', defaultContent: 'export default function Home() { return <main>Hello World</main>; }' },
          { path: 'app/globals.css', fileType: 'Styles', defaultContent: '@import "tailwindcss";' }
        ]
      }
    };

    const reactTemplate: CodeTemplateRecord = {
      id: 'tmpl_react_vite',
      name: 'React SPA Starter',
      framework: 'React',
      description: 'Clean React client SPA.',
      folderStructure: ['src/', 'src/components/', 'src/hooks/'],
      sampleFiles: [
        { path: 'src/App.tsx', content: 'export function App() { return <div>React App</div>; }' }
      ],
      structure: {
        folders: ['src', 'src/components', 'src/hooks'],
        files: [
          { path: 'src/App.tsx', fileType: 'Component', defaultContent: 'export function App() { return <div>React App</div>; }' }
        ]
      }
    };

    this.templates.set(nextjsTemplate.id, nextjsTemplate);
    this.templates.set(reactTemplate.id, reactTemplate);
  }

  public getTemplates(): CodeTemplateRecord[] {
    return Array.from(this.templates.values());
  }

  public getTemplateByFramework(framework: SupportedFramework): CodeTemplateRecord {
    const found = Array.from(this.templates.values()).find(t => t.framework === framework);
    if (found) return found;
    return {
      id: `tmpl_${framework.toLowerCase().replace(/\s+/g, '_')}`,
      name: `${framework} Starter`,
      framework,
      description: `Default starter for ${framework}`,
      folderStructure: ['src/'],
      sampleFiles: [],
      structure: {
        folders: ['src'],
        files: []
      }
    };
  }

  public registerCustomTemplate(params: {
    name: string;
    framework: SupportedFramework;
    description?: string;
    language?: SupportedLanguage;
    folderStructure?: string[];
    sampleFiles?: { path: string; content: string }[];
  }): CodeTemplateRecord {
    const template: CodeTemplateRecord = {
      id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: params.name,
      framework: params.framework,
      description: params.description || `Custom ${params.framework} template.`,
      folderStructure: params.folderStructure || ['src/'],
      sampleFiles: params.sampleFiles || []
    };

    this.templates.set(template.id, template);
    return template;
  }
}

export const templateEngineService = new TemplateEngineService();
