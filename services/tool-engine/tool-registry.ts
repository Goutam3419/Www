import { UniversalToolDefinition, ToolCategory, ToolDangerLevel, ToolRiskLevel } from '@/packages/types/src';

export interface ToolRegistrationResult {
  success: boolean;
  error?: string;
  tool?: UniversalToolDefinition;
}

export interface ToolValidationResult {
  valid: boolean;
  errors: string[];
}

export class ToolRegistryService {
  private tools: Map<string, UniversalToolDefinition> = new Map();

  constructor() {
    this.seedDefaultTools();
  }

  private seedDefaultTools() {
    const defaultTools: UniversalToolDefinition[] = [
      {
        id: 'tool_fs_read',
        name: 'Read File',
        description: 'Reads character contents of specified workspace path.',
        category: 'FileSystem',
        provider: 'internal',
        source: 'internal',
        dangerLevel: 'Safe',
        requiredPermissions: ['fs:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['fs.read'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
      },
      {
        id: 'tool_fs_write',
        name: 'Write File',
        description: 'Creates or edits a workspace file at specified relative path.',
        category: 'FileSystem',
        provider: 'internal',
        source: 'internal',
        dangerLevel: 'Low',
        requiredPermissions: ['fs:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['fs.write'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] }
      },
      {
        id: 'tool_terminal_exec',
        name: 'Execute Shell Command',
        description: 'Runs container shell command in isolated sandbox environment.',
        category: 'Terminal',
        provider: 'internal',
        source: 'internal',
        dangerLevel: 'High',
        requiredPermissions: ['terminal:exec'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['terminal.exec'],
        inputSchema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] },
        inputsSchema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] }
      },
      {
        id: 'tool_git_commit',
        name: 'Git Commit & Push',
        description: 'Commits workspace changes and pushes to remote Git branch.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'internal',
        dangerLevel: 'Medium',
        requiredPermissions: ['git:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['git.commit'],
        inputSchema: { type: 'object', properties: { message: { type: 'string' }, branch: { type: 'string' } }, required: ['message'] },
        inputsSchema: { type: 'object', properties: { message: { type: 'string' }, branch: { type: 'string' } }, required: ['message'] }
      },
      {
        id: 'tool_vercel_deploy',
        name: 'Deploy to Vercel',
        description: 'Triggers production deployment on Vercel platform.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'internal',
        dangerLevel: 'High',
        requiredPermissions: ['deploy:vercel'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.deploy'],
        inputSchema: { type: 'object', properties: { environment: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { environment: { type: 'string' } } }
      },
      {
        id: 'tool_firebase_rules',
        name: 'Deploy Firestore Rules',
        description: 'Validates and deploys firestore.rules security policies.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'internal',
        dangerLevel: 'Medium',
        requiredPermissions: ['firebase:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.rules'],
        inputSchema: { type: 'object', properties: { rulesContent: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { rulesContent: { type: 'string' } } }
      },
      {
        id: 'github_repo_list',
        name: 'GitHub Repo List',
        description: 'Lists repositories accessible to the connected GitHub user or organization.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['git:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.repo_list'],
        inputSchema: { type: 'object', properties: { org: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { org: { type: 'string' } } }
      },
      {
        id: 'github_repo_info',
        name: 'GitHub Repo Info',
        description: 'Retrieves details, metadata, and configuration of a GitHub repository.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['git:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.repo_info'],
        inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' } } }
      },
      {
        id: 'github_repo_tree',
        name: 'GitHub Repo Tree',
        description: 'Lists files and directories in a GitHub repository branch or directory path.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['git:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.repo_tree'],
        inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, branch: { type: 'string' }, path: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, branch: { type: 'string' }, path: { type: 'string' } } }
      },
      {
        id: 'github_file_read',
        name: 'GitHub File Read',
        description: 'Reads content of a file from a GitHub repository.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['git:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.file_read'],
        inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, path: { type: 'string' }, branch: { type: 'string' } }, required: ['path'] },
        inputsSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, path: { type: 'string' }, branch: { type: 'string' } }, required: ['path'] }
      },
      {
        id: 'github_file_write',
        name: 'GitHub File Write',
        description: 'Creates or updates a file in a GitHub repository with a commit message.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['git:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.file_write'],
        inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, path: { type: 'string' }, content: { type: 'string' }, message: { type: 'string' }, branch: { type: 'string' }, sha: { type: 'string' } }, required: ['path', 'content', 'message'] },
        inputsSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, path: { type: 'string' }, content: { type: 'string' }, message: { type: 'string' }, branch: { type: 'string' }, sha: { type: 'string' } }, required: ['path', 'content', 'message'] }
      },
      {
        id: 'github_branch_create',
        name: 'GitHub Branch Create',
        description: 'Creates a new git branch in a GitHub repository.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['git:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.branch_create'],
        inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, branch: { type: 'string' }, fromBranch: { type: 'string' } }, required: ['branch'] },
        inputsSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, branch: { type: 'string' }, fromBranch: { type: 'string' } }, required: ['branch'] }
      },
      {
        id: 'github_commit',
        name: 'GitHub Commit',
        description: 'Commits and pushes changes across single or multiple files in a repository.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'High',
        requiredPermissions: ['git:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.commit'],
        inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, branch: { type: 'string' }, message: { type: 'string' }, files: { type: 'array' } }, required: ['message'] },
        inputsSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, branch: { type: 'string' }, message: { type: 'string' }, files: { type: 'array' } }, required: ['message'] }
      },
      {
        id: 'github_repo_sync',
        name: 'GitHub Repo Sync',
        description: 'Syncs latest commits, branches, and metadata for a repository.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['git:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['github.repo_sync'],
        inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, repository: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, fullName: { type: 'string' }, repository: { type: 'string' } } }
      },
      {
        id: 'vercel_project_list',
        name: 'Vercel Project List',
        description: 'Lists Vercel projects for the authenticated team or user.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['vercel:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.project_list'],
        inputSchema: { type: 'object', properties: { teamId: { type: 'string' }, limit: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { teamId: { type: 'string' }, limit: { type: 'number' } } }
      },
      {
        id: 'vercel_project_info',
        name: 'Vercel Project Info',
        description: 'Retrieves metadata and environment settings for a Vercel project.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['vercel:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.project_info'],
        inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, projectName: { type: 'string' }, teamId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { projectId: { type: 'string' }, projectName: { type: 'string' }, teamId: { type: 'string' } } }
      },
      {
        id: 'vercel_project_create',
        name: 'Vercel Project Create',
        description: 'Creates a new project on Vercel.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['vercel:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.project_create'],
        inputSchema: { type: 'object', properties: { name: { type: 'string' }, framework: { type: 'string' }, repo: { type: 'string' } }, required: ['name'] },
        inputsSchema: { type: 'object', properties: { name: { type: 'string' }, framework: { type: 'string' }, repo: { type: 'string' } }, required: ['name'] }
      },
      {
        id: 'vercel_deployment_create',
        name: 'Vercel Deployment Create',
        description: 'Triggers a new preview or production deployment on Vercel.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'High',
        requiredPermissions: ['deploy:vercel'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.deployment_create'],
        inputSchema: { type: 'object', properties: { projectName: { type: 'string' }, target: { type: 'string' }, repo: { type: 'string' }, branch: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { projectName: { type: 'string' }, target: { type: 'string' }, repo: { type: 'string' }, branch: { type: 'string' } } }
      },
      {
        id: 'vercel_deployment_status',
        name: 'Vercel Deployment Status',
        description: 'Fetches current build status and URL of a Vercel deployment.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['vercel:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.deployment_status'],
        inputSchema: { type: 'object', properties: { deploymentId: { type: 'string' } }, required: ['deploymentId'] },
        inputsSchema: { type: 'object', properties: { deploymentId: { type: 'string' } }, required: ['deploymentId'] }
      },
      {
        id: 'vercel_deployment_logs',
        name: 'Vercel Deployment Logs',
        description: 'Retrieves build and execution log events for a Vercel deployment.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['vercel:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.deployment_logs'],
        inputSchema: { type: 'object', properties: { deploymentId: { type: 'string' }, limit: { type: 'number' } }, required: ['deploymentId'] },
        inputsSchema: { type: 'object', properties: { deploymentId: { type: 'string' }, limit: { type: 'number' } }, required: ['deploymentId'] }
      },
      {
        id: 'vercel_domain_list',
        name: 'Vercel Domain List',
        description: 'Lists all custom domains attached to a Vercel project.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['vercel:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.domain_list'],
        inputSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] },
        inputsSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] }
      },
      {
        id: 'vercel_domain_attach',
        name: 'Vercel Domain Attach',
        description: 'Attaches a custom domain to a Vercel project.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['vercel:domain'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['vercel.domain_attach'],
        inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, domain: { type: 'string' } }, required: ['projectId', 'domain'] },
        inputsSchema: { type: 'object', properties: { projectId: { type: 'string' }, domain: { type: 'string' } }, required: ['projectId', 'domain'] }
      },
      {
        id: 'firebase_project_list',
        name: 'Firebase Project List',
        description: 'Lists connected Firebase projects.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.project_list'],
        inputSchema: { type: 'object', properties: { limit: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { limit: { type: 'number' } } }
      },
      {
        id: 'firebase_project_info',
        name: 'Firebase Project Info',
        description: 'Retrieves details and metadata for a Firebase project.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.project_info'],
        inputSchema: { type: 'object', properties: { projectId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { projectId: { type: 'string' } } }
      },
      {
        id: 'firebase_firestore_list_collections',
        name: 'Firebase Firestore List Collections',
        description: 'Lists collection IDs in a Firestore database.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_list_collections'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, projectId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' }, projectId: { type: 'string' } } }
      },
      {
        id: 'firebase_firestore_query',
        name: 'Firebase Firestore Query',
        description: 'Queries documents from a Firestore collection.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_query'],
        inputSchema: { type: 'object', properties: { collection: { type: 'string' }, limit: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { collection: { type: 'string' }, limit: { type: 'number' } } }
      },
      {
        id: 'firebase_firestore_read',
        name: 'Firebase Firestore Read',
        description: 'Reads a specific document from Firestore by path.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_read'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' } } }
      },
      {
        id: 'firebase_firestore_get_document',
        name: 'Firebase Firestore Get Document',
        description: 'Reads a single document from Firestore collection.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_read'],
        inputSchema: { type: 'object', properties: { collection: { type: 'string' }, documentId: { type: 'string' }, path: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { collection: { type: 'string' }, documentId: { type: 'string' }, path: { type: 'string' } } }
      },
      {
        id: 'firebase_firestore_write',
        name: 'Firebase Firestore Write',
        description: 'Creates a new document in Firestore.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['firebase:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_write'],
        inputSchema: { type: 'object', properties: { collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } }, required: ['collection'] },
        inputsSchema: { type: 'object', properties: { collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } }, required: ['collection'] }
      },
      {
        id: 'firebase_firestore_create_document',
        name: 'Firebase Firestore Create Document',
        description: 'Creates a new document in a Firestore collection.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['firebase:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_write'],
        inputSchema: { type: 'object', properties: { collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } }, required: ['collection'] },
        inputsSchema: { type: 'object', properties: { collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } }, required: ['collection'] }
      },
      {
        id: 'firebase_firestore_update',
        name: 'Firebase Firestore Update',
        description: 'Updates an existing document in Firestore.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['firebase:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_update'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } } },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } } }
      },
      {
        id: 'firebase_firestore_update_document',
        name: 'Firebase Firestore Update Document',
        description: 'Updates an existing document in Firestore by path or collection.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['firebase:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_update'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } } },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' }, data: { type: 'object' } } }
      },
      {
        id: 'firebase_firestore_delete',
        name: 'Firebase Firestore Delete',
        description: 'Deletes a document from Firestore.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'High',
        requiredPermissions: ['firebase:admin'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_delete'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' } } }
      },
      {
        id: 'firebase_firestore_delete_document',
        name: 'Firebase Firestore Delete Document',
        description: 'Deletes a document from Firestore with mandatory approval.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'High',
        requiredPermissions: ['firebase:admin'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.firestore_delete'],
        inputSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { path: { type: 'string' }, collection: { type: 'string' }, documentId: { type: 'string' } } }
      },
      {
        id: 'firebase_auth_users_list',
        name: 'Firebase Auth Users List',
        description: 'Lists registered users in Firebase Authentication safely.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.auth_users_list'],
        inputSchema: { type: 'object', properties: { limit: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { limit: { type: 'number' } } }
      },
      {
        id: 'firebase_auth_user_list',
        name: 'Firebase Auth User List',
        description: 'Lists Firebase Auth users.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:auth:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.auth_management'],
        inputSchema: { type: 'object', properties: { limit: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { limit: { type: 'number' } } }
      },
      {
        id: 'firebase_auth_user_get',
        name: 'Firebase Auth User Get',
        description: 'Retrieves a user profile from Firebase Auth.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:auth:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.auth_management'],
        inputSchema: { type: 'object', properties: { uid: { type: 'string' }, email: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { uid: { type: 'string' }, email: { type: 'string' } } }
      },
      {
        id: 'firebase_auth_user_create',
        name: 'Firebase Auth User Create',
        description: 'Creates a user in Firebase Auth with required approval.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'High',
        requiredPermissions: ['firebase:auth:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.auth_management'],
        inputSchema: { type: 'object', properties: { email: { type: 'string' }, displayName: { type: 'string' }, disabled: { type: 'boolean' } }, required: ['email'] },
        inputsSchema: { type: 'object', properties: { email: { type: 'string' }, displayName: { type: 'string' }, disabled: { type: 'boolean' } }, required: ['email'] }
      },
      {
        id: 'firebase_auth_user_disable',
        name: 'Firebase Auth User Disable',
        description: 'Disables a user account in Firebase Auth with required approval.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'High',
        requiredPermissions: ['firebase:auth:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.auth_management'],
        inputSchema: { type: 'object', properties: { uid: { type: 'string' }, disabled: { type: 'boolean' } }, required: ['uid'] },
        inputsSchema: { type: 'object', properties: { uid: { type: 'string' }, disabled: { type: 'boolean' } }, required: ['uid'] }
      },
      {
        id: 'firebase_storage_list',
        name: 'Firebase Storage List',
        description: 'Lists stored files and objects in Firebase Storage.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:storage:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.storage'],
        inputSchema: { type: 'object', properties: { bucket: { type: 'string' }, prefix: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { bucket: { type: 'string' }, prefix: { type: 'string' } } }
      },
      {
        id: 'firebase_storage_upload',
        name: 'Firebase Storage Upload',
        description: 'Uploads a file to Firebase Storage.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['firebase:storage:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.storage'],
        inputSchema: { type: 'object', properties: { bucket: { type: 'string' }, path: { type: 'string' }, content: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { bucket: { type: 'string' }, path: { type: 'string' }, content: { type: 'string' } } }
      },
      {
        id: 'firebase_storage_delete',
        name: 'Firebase Storage Delete',
        description: 'Deletes a file from Firebase Storage with approval required.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'High',
        requiredPermissions: ['firebase:storage:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.storage'],
        inputSchema: { type: 'object', properties: { bucket: { type: 'string' }, path: { type: 'string' } }, required: ['path'] },
        inputsSchema: { type: 'object', properties: { bucket: { type: 'string' }, path: { type: 'string' } }, required: ['path'] }
      },
      {
        id: 'firebase_rules_read',
        name: 'Firebase Rules Read',
        description: 'Reads Firestore or Storage security rules.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:rules:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.rules'],
        inputSchema: { type: 'object', properties: { type: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { type: { type: 'string' } } }
      },
      {
        id: 'firebase_rules_validate',
        name: 'Firebase Rules Validate',
        description: 'Validates proposed Firebase security rules.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Medium',
        requiredPermissions: ['firebase:rules:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.rules'],
        inputSchema: { type: 'object', properties: { rules: { type: 'string' }, type: { type: 'string' } }, required: ['rules'] },
        inputsSchema: { type: 'object', properties: { rules: { type: 'string' }, type: { type: 'string' } }, required: ['rules'] }
      },
      {
        id: 'firebase_rules_deploy',
        name: 'Firebase Rules Deploy',
        description: 'Deploys updated security rules with mandatory approval.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'provider_adapter',
        dangerLevel: 'Critical',
        requiredPermissions: ['firebase:rules:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['firebase.rules'],
        inputSchema: { type: 'object', properties: { rules: { type: 'string' }, type: { type: 'string' } }, required: ['rules'] },
        inputsSchema: { type: 'object', properties: { rules: { type: 'string' }, type: { type: 'string' } }, required: ['rules'] }
      },
      {
        id: 'mcp_github_repo_sync',
        name: 'GitHub Repo Sync',
        description: 'Syncs GitHub repositories and pull requests.',
        category: 'GitGitHub',
        provider: 'github',
        source: 'mcp',
        dangerLevel: 'Safe',
        requiredPermissions: ['git:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['repo_sync'],
        inputSchema: { type: 'object', properties: { repository: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { repository: { type: 'string' } } }
      },
      {
        id: 'mcp_firebase_db_query',
        name: 'Firebase DB Query',
        description: 'Queries Firebase Firestore database documents.',
        category: 'Firebase',
        provider: 'firebase',
        source: 'mcp',
        dangerLevel: 'Safe',
        requiredPermissions: ['firebase:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['db_query'],
        inputSchema: { type: 'object', properties: { collection: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { collection: { type: 'string' } } }
      },
      {
        id: 'mcp_vercel_deploy_trigger',
        name: 'Vercel Deploy Trigger',
        description: 'Triggers automated Vercel deployment pipeline.',
        category: 'Vercel',
        provider: 'vercel',
        source: 'mcp',
        dangerLevel: 'High',
        requiredPermissions: ['deploy:vercel'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['deploy_trigger'],
        inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' }, projectId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { workspaceId: { type: 'string' }, projectId: { type: 'string' } } }
      },
      {
        id: 'mcp_workspace_quota_check',
        name: 'Workspace Quota Check',
        description: 'Checks resource limits and quota utilization.',
        category: 'Governance',
        provider: 'internal',
        source: 'mcp',
        dangerLevel: 'Safe',
        requiredPermissions: ['governance:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['quota_check'],
        inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { workspaceId: { type: 'string' } } }
      },

      // --- GOOGLE DRIVE TOOLS (7) ---
      {
        id: 'google_drive_list_files',
        name: 'List Google Drive Files',
        description: 'Lists files in Google Drive for the workspace context.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:drive:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_drive', 'google_drive.list_files'],
        inputSchema: { type: 'object', properties: { pageSize: { type: 'number' }, query: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { pageSize: { type: 'number' }, query: { type: 'string' } } }
      },
      {
        id: 'google_drive_get_file',
        name: 'Get Google Drive File',
        description: 'Retrieves metadata and content for a specific file in Google Drive.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:drive:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_drive', 'google_drive.get_file'],
        inputSchema: { type: 'object', properties: { fileId: { type: 'string' } }, required: ['fileId'] },
        inputsSchema: { type: 'object', properties: { fileId: { type: 'string' } }, required: ['fileId'] }
      },
      {
        id: 'google_drive_search',
        name: 'Search Google Drive',
        description: 'Searches for files in Google Drive using query matching.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:drive:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_drive', 'google_drive.search'],
        inputSchema: { type: 'object', properties: { query: { type: 'string' }, mimeType: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { query: { type: 'string' }, mimeType: { type: 'string' } } }
      },
      {
        id: 'google_drive_create_file',
        name: 'Create Google Drive File',
        description: 'Creates a new file in Google Drive.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:drive:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_drive', 'google_drive.create_file'],
        inputSchema: { type: 'object', properties: { name: { type: 'string' }, mimeType: { type: 'string' }, folderId: { type: 'string' } }, required: ['name'] },
        inputsSchema: { type: 'object', properties: { name: { type: 'string' }, mimeType: { type: 'string' }, folderId: { type: 'string' } }, required: ['name'] }
      },
      {
        id: 'google_drive_update_file',
        name: 'Update Google Drive File',
        description: 'Updates metadata or contents for an existing Google Drive file.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:drive:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_drive', 'google_drive.update_file'],
        inputSchema: { type: 'object', properties: { fileId: { type: 'string' }, name: { type: 'string' } }, required: ['fileId'] },
        inputsSchema: { type: 'object', properties: { fileId: { type: 'string' }, name: { type: 'string' } }, required: ['fileId'] }
      },
      {
        id: 'google_drive_delete_file',
        name: 'Delete Google Drive File',
        description: 'Permanently deletes a file from Google Drive. High-risk administrative operation.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'High',
        requiredPermissions: ['google:drive:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_drive', 'google_drive.delete_file'],
        inputSchema: { type: 'object', properties: { fileId: { type: 'string' } }, required: ['fileId'] },
        inputsSchema: { type: 'object', properties: { fileId: { type: 'string' } }, required: ['fileId'] }
      },
      {
        id: 'google_drive_create_folder',
        name: 'Create Google Drive Folder',
        description: 'Creates a folder in Google Drive.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:drive:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_drive', 'google_drive.create_folder'],
        inputSchema: { type: 'object', properties: { name: { type: 'string' }, parentFolderId: { type: 'string' } }, required: ['name'] },
        inputsSchema: { type: 'object', properties: { name: { type: 'string' }, parentFolderId: { type: 'string' } }, required: ['name'] }
      },

      // --- GOOGLE SHEETS TOOLS (5) ---
      {
        id: 'google_sheets_read',
        name: 'Read Google Sheet',
        description: 'Reads data values from a specified Google Spreadsheet range.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:sheets:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_sheets', 'google_sheets.read'],
        inputSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' } }, required: ['spreadsheetId'] },
        inputsSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' } }, required: ['spreadsheetId'] }
      },
      {
        id: 'google_sheets_write',
        name: 'Write Google Sheet',
        description: 'Writes data values to a specified range in a Google Spreadsheet.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:sheets:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_sheets', 'google_sheets.write'],
        inputSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' }, values: { type: 'array' } }, required: ['spreadsheetId'] },
        inputsSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' }, values: { type: 'array' } }, required: ['spreadsheetId'] }
      },
      {
        id: 'google_sheets_append',
        name: 'Append to Google Sheet',
        description: 'Appends data rows to a Google Spreadsheet.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:sheets:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_sheets', 'google_sheets.append'],
        inputSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' }, values: { type: 'array' } }, required: ['spreadsheetId'] },
        inputsSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' }, values: { type: 'array' } }, required: ['spreadsheetId'] }
      },
      {
        id: 'google_sheets_create',
        name: 'Create Google Sheet',
        description: 'Creates a new Google Spreadsheet document.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:sheets:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_sheets', 'google_sheets.create'],
        inputSchema: { type: 'object', properties: { title: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { title: { type: 'string' } } }
      },
      {
        id: 'google_sheets_clear',
        name: 'Clear Google Sheet Range',
        description: 'Clears data values from a Google Spreadsheet range. High-risk operation.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'High',
        requiredPermissions: ['google:sheets:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_sheets', 'google_sheets.clear'],
        inputSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' } }, required: ['spreadsheetId'] },
        inputsSchema: { type: 'object', properties: { spreadsheetId: { type: 'string' }, range: { type: 'string' } }, required: ['spreadsheetId'] }
      },

      // --- GOOGLE DOCS TOOLS (4) ---
      {
        id: 'google_docs_read',
        name: 'Read Google Doc',
        description: 'Reads content structure of a Google Document.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:docs:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_docs', 'google_docs.read'],
        inputSchema: { type: 'object', properties: { documentId: { type: 'string' } }, required: ['documentId'] },
        inputsSchema: { type: 'object', properties: { documentId: { type: 'string' } }, required: ['documentId'] }
      },
      {
        id: 'google_docs_create',
        name: 'Create Google Doc',
        description: 'Creates a new Google Document.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:docs:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_docs', 'google_docs.create'],
        inputSchema: { type: 'object', properties: { title: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { title: { type: 'string' } } }
      },
      {
        id: 'google_docs_update',
        name: 'Update Google Doc',
        description: 'Executes batch update requests on a Google Document.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:docs:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_docs', 'google_docs.update'],
        inputSchema: { type: 'object', properties: { documentId: { type: 'string' }, requests: { type: 'array' } }, required: ['documentId'] },
        inputsSchema: { type: 'object', properties: { documentId: { type: 'string' }, requests: { type: 'array' } }, required: ['documentId'] }
      },
      {
        id: 'google_docs_append',
        name: 'Append to Google Doc',
        description: 'Appends text content to the end of a Google Document.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:docs:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_docs', 'google_docs.append'],
        inputSchema: { type: 'object', properties: { documentId: { type: 'string' }, text: { type: 'string' } }, required: ['documentId', 'text'] },
        inputsSchema: { type: 'object', properties: { documentId: { type: 'string' }, text: { type: 'string' } }, required: ['documentId', 'text'] }
      },

      // --- GMAIL TOOLS (5) ---
      {
        id: 'gmail_search',
        name: 'Search Gmail Messages',
        description: 'Searches Gmail inbox and messages using search query.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['gmail:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['gmail', 'gmail.search'],
        inputSchema: { type: 'object', properties: { query: { type: 'string' }, maxResults: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { query: { type: 'string' }, maxResults: { type: 'number' } } }
      },
      {
        id: 'gmail_get_message',
        name: 'Get Gmail Message',
        description: 'Retrieves details and content for a single Gmail message ID.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['gmail:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['gmail', 'gmail.get_message'],
        inputSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] },
        inputsSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] }
      },
      {
        id: 'gmail_send',
        name: 'Send Gmail Message',
        description: 'Sends an email message via Gmail. High-risk administrative operation.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'High',
        requiredPermissions: ['gmail:send'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['gmail', 'gmail.send'],
        inputSchema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } }, required: ['to', 'subject', 'body'] },
        inputsSchema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } }, required: ['to', 'subject', 'body'] }
      },
      {
        id: 'gmail_modify_labels',
        name: 'Modify Gmail Message Labels',
        description: 'Adds or removes labels on a Gmail message.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['gmail:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['gmail', 'gmail.modify_labels'],
        inputSchema: { type: 'object', properties: { messageId: { type: 'string' }, addLabelIds: { type: 'array' }, removeLabelIds: { type: 'array' } }, required: ['messageId'] },
        inputsSchema: { type: 'object', properties: { messageId: { type: 'string' }, addLabelIds: { type: 'array' }, removeLabelIds: { type: 'array' } }, required: ['messageId'] }
      },
      {
        id: 'gmail_trash_message',
        name: 'Trash Gmail Message',
        description: 'Moves a Gmail message to trash. High-risk operation.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'High',
        requiredPermissions: ['gmail:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['gmail', 'gmail.trash_message'],
        inputSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] },
        inputsSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] }
      },

      // --- GOOGLE CALENDAR TOOLS (5) ---
      {
        id: 'google_calendar_list',
        name: 'List Google Calendar Events',
        description: 'Lists calendar events for specified Google Calendar.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:calendar:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_calendar', 'google_calendar.list'],
        inputSchema: { type: 'object', properties: { calendarId: { type: 'string' }, maxResults: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { calendarId: { type: 'string' }, maxResults: { type: 'number' } } }
      },
      {
        id: 'google_calendar_get_event',
        name: 'Get Google Calendar Event',
        description: 'Retrieves a single Google Calendar event by ID.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:calendar:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_calendar', 'google_calendar.get_event'],
        inputSchema: { type: 'object', properties: { calendarId: { type: 'string' }, eventId: { type: 'string' } }, required: ['eventId'] },
        inputsSchema: { type: 'object', properties: { calendarId: { type: 'string' }, eventId: { type: 'string' } }, required: ['eventId'] }
      },
      {
        id: 'google_calendar_create_event',
        name: 'Create Google Calendar Event',
        description: 'Creates a new event in Google Calendar.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:calendar:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_calendar', 'google_calendar.create_event'],
        inputSchema: { type: 'object', properties: { calendarId: { type: 'string' }, summary: { type: 'string' }, start: { type: 'object' }, end: { type: 'object' } }, required: ['summary'] },
        inputsSchema: { type: 'object', properties: { calendarId: { type: 'string' }, summary: { type: 'string' }, start: { type: 'object' }, end: { type: 'object' } }, required: ['summary'] }
      },
      {
        id: 'google_calendar_update_event',
        name: 'Update Google Calendar Event',
        description: 'Updates details for an existing Google Calendar event.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['google:calendar:write'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_calendar', 'google_calendar.update_event'],
        inputSchema: { type: 'object', properties: { calendarId: { type: 'string' }, eventId: { type: 'string' }, summary: { type: 'string' } }, required: ['eventId'] },
        inputsSchema: { type: 'object', properties: { calendarId: { type: 'string' }, eventId: { type: 'string' }, summary: { type: 'string' } }, required: ['eventId'] }
      },
      {
        id: 'google_calendar_delete_event',
        name: 'Delete Google Calendar Event',
        description: 'Deletes an event from Google Calendar. High-risk operation.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'High',
        requiredPermissions: ['google:calendar:write'],
        approvalRequired: true,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_calendar', 'google_calendar.delete_event'],
        inputSchema: { type: 'object', properties: { calendarId: { type: 'string' }, eventId: { type: 'string' } }, required: ['eventId'] },
        inputsSchema: { type: 'object', properties: { calendarId: { type: 'string' }, eventId: { type: 'string' } }, required: ['eventId'] }
      },

      // --- GOOGLE CLOUD / PROJECT DISCOVERY TOOLS (2) ---
      {
        id: 'google_cloud_project_list',
        name: 'List Google Cloud Projects',
        description: 'Lists Google Cloud projects accessible to connected authorization.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:cloud:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_cloud', 'google_cloud.project_list'],
        inputSchema: { type: 'object', properties: { pageSize: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { pageSize: { type: 'number' } } }
      },
      {
        id: 'google_cloud_project_info',
        name: 'Get Google Cloud Project Info',
        description: 'Retrieves details for a specific Google Cloud project.',
        category: 'ThirdPartyIntegration',
        provider: 'google',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['google:cloud:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['google_cloud', 'google_cloud.project_info'],
        inputSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] },
        inputsSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] }
      },

      // --- ANTHROPIC TOOLS (3) ---
      {
        id: 'anthropic_model_list',
        name: 'List Anthropic Models',
        description: 'Lists supported models from Anthropic.',
        category: 'ThirdPartyIntegration',
        provider: 'anthropic',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['ai:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['anthropic_models', 'anthropic.model_list'],
        inputSchema: { type: 'object', properties: {} },
        inputsSchema: { type: 'object', properties: {} }
      },
      {
        id: 'anthropic_message_create',
        name: 'Create Anthropic Message',
        description: 'Sends a prompt or message payload to Anthropic Claude models.',
        category: 'ThirdPartyIntegration',
        provider: 'anthropic',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['ai:execute'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['anthropic_execution', 'anthropic.message_create'],
        inputSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' }, maxTokens: { type: 'number' } } },
        inputsSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' }, maxTokens: { type: 'number' } } }
      },
      {
        id: 'anthropic_stream_message',
        name: 'Stream Anthropic Message',
        description: 'Streams response tokens from Anthropic Claude models.',
        category: 'ThirdPartyIntegration',
        provider: 'anthropic',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['ai:execute'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['anthropic_execution', 'anthropic.stream_message'],
        inputSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } },
        inputsSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } }
      },

      // --- OPENAI TOOLS (4) ---
      {
        id: 'openai_model_list',
        name: 'List OpenAI Models',
        description: 'Lists available models from OpenAI.',
        category: 'ThirdPartyIntegration',
        provider: 'openai',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['ai:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['openai_models', 'openai.model_list'],
        inputSchema: { type: 'object', properties: {} },
        inputsSchema: { type: 'object', properties: {} }
      },
      {
        id: 'openai_chat_completion',
        name: 'Create OpenAI Chat Completion',
        description: 'Generates chat completions using OpenAI models.',
        category: 'ThirdPartyIntegration',
        provider: 'openai',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['ai:execute'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['openai_execution', 'openai.chat_completion'],
        inputSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } },
        inputsSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } }
      },
      {
        id: 'openai_stream_completion',
        name: 'Stream OpenAI Chat Completion',
        description: 'Streams chat completions token-by-token using OpenAI models.',
        category: 'ThirdPartyIntegration',
        provider: 'openai',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['ai:execute'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['openai_execution', 'openai.stream_completion'],
        inputSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } },
        inputsSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } }
      },
      {
        id: 'openai_embedding',
        name: 'Create OpenAI Embedding',
        description: 'Generates vector embeddings using OpenAI embedding models.',
        category: 'ThirdPartyIntegration',
        provider: 'openai',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['ai:embedding'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['openai_embeddings', 'openai.embedding'],
        inputSchema: { type: 'object', properties: { model: { type: 'string' }, input: { type: 'string' } } },
        inputsSchema: { type: 'object', properties: { model: { type: 'string' }, input: { type: 'string' } } }
      },

      // --- OPENROUTER TOOLS (3) ---
      {
        id: 'openrouter_model_list',
        name: 'List OpenRouter Models',
        description: 'Lists models available through OpenRouter unified API gateway.',
        category: 'ThirdPartyIntegration',
        provider: 'openrouter',
        source: 'integration',
        dangerLevel: 'Safe',
        requiredPermissions: ['ai:read'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['openrouter_models', 'openrouter.model_list'],
        inputSchema: { type: 'object', properties: {} },
        inputsSchema: { type: 'object', properties: {} }
      },
      {
        id: 'openrouter_chat_completion',
        name: 'Create OpenRouter Chat Completion',
        description: 'Routes chat completions to any provider model via OpenRouter.',
        category: 'ThirdPartyIntegration',
        provider: 'openrouter',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['ai:execute'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['openrouter_execution', 'openrouter.chat_completion'],
        inputSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } },
        inputsSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } }
      },
      {
        id: 'openrouter_stream_completion',
        name: 'Stream OpenRouter Chat Completion',
        description: 'Streams completions token-by-token via OpenRouter.',
        category: 'ThirdPartyIntegration',
        provider: 'openrouter',
        source: 'integration',
        dangerLevel: 'Medium',
        requiredPermissions: ['ai:execute'],
        approvalRequired: false,
        enabled: true,
        version: '1.0.0',
        capabilities: ['openrouter_execution', 'openrouter.stream_completion'],
        inputSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } },
        inputsSchema: { type: 'object', properties: { model: { type: 'string' }, prompt: { type: 'string' }, messages: { type: 'array' } } }
      }
    ];

    defaultTools.forEach(t => this.tools.set(t.id, t));
  }

  public registerTool(toolInput: Partial<UniversalToolDefinition> & { id?: string; name?: string; category?: ToolCategory }): ToolRegistrationResult {
    const id = toolInput.id || `tool_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    if (this.tools.has(id)) {
      return {
        success: false,
        error: `Tool with ID '${id}' is already registered.`
      };
    }

    const fullTool: UniversalToolDefinition = {
      id,
      name: toolInput.name || 'Unnamed Tool',
      description: toolInput.description || '',
      category: (toolInput.category || 'Governance') as ToolCategory,
      provider: toolInput.provider || 'internal',
      source: toolInput.source || 'internal',
      version: toolInput.version || '1.0.0',
      dangerLevel: toolInput.dangerLevel || 'Safe',
      approvalRequired: toolInput.approvalRequired ?? false,
      enabled: toolInput.enabled ?? true,
      requiredPermissions: toolInput.requiredPermissions || [],
      capabilities: toolInput.capabilities || [],
      inputSchema: toolInput.inputSchema || toolInput.inputsSchema || { type: 'object', properties: {} },
      inputsSchema: toolInput.inputsSchema || toolInput.inputSchema || { type: 'object', properties: {} }
    };

    this.tools.set(id, fullTool);
    return {
      success: true,
      tool: fullTool
    };
  }

  public getTool(id: string): UniversalToolDefinition | undefined {
    return this.tools.get(id);
  }

  public unregisterTool(id: string): boolean {
    return this.tools.delete(id);
  }

  public listTools(): UniversalToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getAllTools(): UniversalToolDefinition[] {
    return this.listTools();
  }

  public listToolsByProvider(provider: string): UniversalToolDefinition[] {
    return this.listTools().filter(t => t.provider.toLowerCase() === provider.toLowerCase());
  }

  public getToolsByCategory(category: ToolCategory): UniversalToolDefinition[] {
    return this.getAllTools().filter(t => t.category === category);
  }

  public getToolsByDangerLevel(dangerLevel: ToolDangerLevel | ToolRiskLevel): UniversalToolDefinition[] {
    return this.getAllTools().filter(t => t.dangerLevel === dangerLevel);
  }

  public validateTool(tool: Partial<UniversalToolDefinition>): ToolValidationResult {
    const errors: string[] = [];
    if (!tool.id) errors.push('Tool ID is required');
    if (!tool.name) errors.push('Tool Name is required');
    if (!tool.provider) errors.push('Tool Provider is required');
    if (!tool.category) errors.push('Tool Category is required');
    if (!tool.version) errors.push('Tool Version is required');
    if (!tool.dangerLevel) errors.push('Tool Danger Level is required');
    
    const schema = tool.inputSchema || tool.inputsSchema;
    if (!schema || typeof schema !== 'object') {
      errors.push('Valid inputSchema object is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public isProviderConfigured(provider: string, workspaceId: string): boolean {
    const provLower = (provider || '').toLowerCase();
    if (provLower === 'internal' || provLower === 'local') return true;

    // Check specific environment variables for external providers
    if (provLower.includes('github')) {
      return Boolean(process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY);
    }
    if (provLower.includes('vercel')) {
      return Boolean(process.env.VERCEL_TOKEN || process.env.VERCEL_API_KEY);
    }
    if (provLower.includes('firebase')) {
      return Boolean(process.env.FIREBASE_CONFIG || process.env.FIREBASE_PROJECT_ID);
    }
    if (provLower.includes('supabase')) {
      return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
    }
    if (provLower.includes('google') || provLower.includes('gemini')) {
      return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    }
    if (provLower.includes('anthropic') || provLower.includes('claude')) {
      return Boolean(process.env.ANTHROPIC_API_KEY);
    }
    if (provLower.includes('openai')) {
      return Boolean(process.env.OPENAI_API_KEY);
    }
    if (provLower.includes('openrouter')) {
      return Boolean(process.env.OPENROUTER_API_KEY);
    }

    return true;
  }

  public enableTool(id: string): boolean {
    const tool = this.tools.get(id);
    if (!tool) return false;
    tool.enabled = true;
    return true;
  }

  public disableTool(id: string): boolean {
    const tool = this.tools.get(id);
    if (!tool) return false;
    tool.enabled = false;
    return true;
  }
}

export const toolRegistryService = new ToolRegistryService();
