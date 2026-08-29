export const PLATFORM_CONFIG = {
  appName: 'AI CEO Agent',
  version: '1.0.0',
  defaultAiModel: 'openrouter/anthropic/claude-3.5-sonnet',
  supportedModels: [
    'openrouter/anthropic/claude-3.5-sonnet',
    'openrouter/google/gemini-2.5-flash',
    'openrouter/openai/gpt-4o',
    'google/gemini-2.5-pro'
  ],
  supportedFrameworks: ['Next.js', 'React', 'FastAPI', 'Node.js Express', 'Python'],
  supportedLanguages: ['TypeScript', 'JavaScript', 'Python'],
  defaultTimezone: 'UTC',
  environments: ['development', 'staging', 'production'] as const,
  projectStatuses: [
    'Planning',
    'In Progress',
    'Review',
    'Testing',
    'Deployment',
    'Production',
    'Completed',
    'Archived'
  ] as const,
  connectionProviders: ['GitHub', 'Vercel', 'Firebase', 'Supabase', 'OpenRouter'] as const
};
