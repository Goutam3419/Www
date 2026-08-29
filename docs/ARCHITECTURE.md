# Enterprise Architecture Guide (Prompt 1.1 - 1.4 Foundation)

## Architecture Overview
The AI CEO Agent platform adheres to strict Single Responsibility Principles (SRP) and high-modularity standards:

```
[ Top Navigation: Workspace & Project Switcher ]
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ Left Sidebar: Projects ]    [ Right Panel: Info & Audit ]
       │                               ▲
       └───────────────┬───────────────┘
                       ▼
        [ Center Tabbed View Engine ]
  Chat | Overview | Memory | Tasks | Connections | Logs | Settings
                       │
                       ▼
    [ Next.js API Routes / Platform Database Store ]
  Users | Workspaces | Projects | Chats | Memories | Tasks | Logs
```

## Isolation Rules
1. **Chat Context**: Each project maintains its own isolated conversation thread (`project_chat`). Context never leaks between projects.
2. **Project Memory**: Requirements, architecture decisions, and notes are indexed per project (`project_memory`).
3. **Connections**: OAuth and API credentials for GitHub, Vercel, Firebase, Supabase, and OpenRouter are managed at the project level (`project_connections`).
