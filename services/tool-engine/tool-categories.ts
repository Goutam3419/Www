import { ToolCategory, ToolCategoryInfo } from '@/packages/types/src';

export const TOOL_CATEGORIES: ToolCategoryInfo[] = [
  { category: 'FileSystem', description: 'File manipulation, creation, reading, and structural organization', count: 4 },
  { category: 'Terminal', description: 'Container terminal commands, scripts, and build tasks', count: 3 },
  { category: 'GitGitHub', description: 'Git version control, repositories, branches, commits, PRs', count: 4 },
  { category: 'Vercel', description: 'Vercel deployment, domains, environment variables, projects', count: 3 },
  { category: 'Firebase', description: 'Firebase Firestore, Auth, rules, dynamic indexes', count: 3 },
  { category: 'Supabase', description: 'Supabase PostgreSQL, auth policies, tables, storage', count: 3 },
  { category: 'Database', description: 'Generic database migrations, queries, schemas', count: 2 },
  { category: 'BrowserAutomation', description: 'Playwright & Puppeteer browser web testing', count: 2 },
  { category: 'CodeGenerator', description: 'AI Code & Component generation routines', count: 2 },
  { category: 'MCP', description: 'Model Context Protocol integrations & tools', count: 2 },
  { category: 'Enterprise', description: 'Governance, approval workflows, and audit tools', count: 2 }
];

export const TOOL_CATEGORIES_METADATA = TOOL_CATEGORIES.map(c => ({
  name: c.category,
  description: c.description
}));

export function getCategoryInfo(category: ToolCategory): ToolCategoryInfo | undefined {
  return TOOL_CATEGORIES.find(c => c.category === category);
}
