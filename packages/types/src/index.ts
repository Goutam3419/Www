export type SupportedFramework = 'Next.js' | 'React' | 'FastAPI' | 'Express' | 'Flutter' | 'Blank Project' | 'Angular' | 'Node.js' | 'React Native' | 'Vue' | string;
export type SupportedLanguage = 'TypeScript' | 'JavaScript' | 'Python' | 'Dart' | 'Go' | 'Rust' | string;
export type CodeFileEditOp = 'CREATE' | 'OVERWRITE' | 'REPLACE_SUBSTRING' | 'INSERT' | 'DELETE' | 'RENAME';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  createdAt?: string;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Testing' | 'Deployment' | 'Production' | 'Completed' | 'Archived';

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  description?: string;
  archived?: boolean;
  status?: string;
  framework?: string;
  language?: string;
  environment?: string;
  deploymentStatus?: string;
  previewUrl?: string;
  gitRepository?: string | null;
  createdAt: string;
}

export type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'pip' | 'flutter';

export interface CodeProjectRecord {
  id: string;
  projectId: string;
  workspaceId: string;
  name: string;
  framework: SupportedFramework;
  language: SupportedLanguage;
  rootPath: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'flutter';
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedFolderRecord {
  id: string;
  codeProjectId: string;
  name: string;
  path: string;
  parentPath?: string;
  createdAt: string;
}

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'READ' | string;

export interface AuditEvent {
  id: string;
  workspaceId: string;
  projectId?: string;
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type CodeFileType = 'Component' | 'Page' | 'Hook' | 'API' | 'Service' | 'Utility' | 'Config' | 'Styles' | string;

export interface GeneratedFileRecord {
  id: string;
  codeProjectId: string;
  projectId: string;
  workspaceId: string;
  name: string;
  path: string;
  fileType: CodeFileType;
  language: SupportedLanguage;
  content: string;
  sizeBytes?: number;
  imports?: string[];
  exports?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CodeTemplateRecord {
  id: string;
  name: string;
  framework: SupportedFramework;
  description: string;
  language?: string;
  version?: string;
  folderStructure: string[];
  sampleFiles: { path: string; content: string }[];
  structure?: {
    folders: string[];
    files: Array<{ path: string; fileType: CodeFileType; defaultContent?: string; content?: string }>;
  };
  defaultDependencies?: string[];
  defaultDevDependencies?: string[];
}

export interface DependencyAnalysisRecord {
  codeProjectId: string;
  framework: SupportedFramework;
  dependencies: Record<string, string> | Array<{ name: string; version?: string; isDev?: boolean }> | string[];
  devDependencies?: Record<string, string>;
  missingDependencies?: string[];
  missingPackages?: string[];
  recommendedDependencies?: string[];
  packageManager?: string;
}

export interface CodeValidationIssue {
  id: string;
  type: 'syntax' | 'import' | 'typing' | 'security' | 'architecture';
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  lineNumber?: number;
}

// Prompt 4.2 Extensions
export interface CodePatchRecord {
  patchId: string;
  codeProjectId: string;
  description: string;
  filesModified: string[];
  affectedComponents: string[];
  appliedAt: string;
  appliedBy: string;
  status: 'applied' | 'rolled_back';
  checksum?: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface CodeDiffRecord {
  diffId: string;
  patchId: string;
  filePath: string;
  oldContent: string;
  newContent: string;
  addedLines: number;
  removedLines: number;
  hunks: DiffHunk[];
  createdAt: string;
}

export interface FileHistoryRecord {
  id: string;
  codeProjectId: string;
  filePath: string;
  content: string;
  snapshotAt: string;
}

export interface RollbackHistoryRecord {
  id: string;
  codeProjectId: string;
  targetPatchId: string;
  rolledBackFiles: string[];
  performedAt: string;
  reason?: string;
}

export interface RefactorLogRecord {
  id: string;
  codeProjectId: string;
  action: 'rename_symbol' | 'extract_component' | 'optimize_imports' | 'convert_syntax';
  refactorType?: string;
  description?: string;
  targetSymbol?: string;
  newSymbol?: string;
  affectedFiles: string[];
  performedAt: string;
  timestamp?: string;
}

export type ToolCategory = 'Code' | 'System' | 'Data' | 'Network' | 'AI' | 'Utility' | 'FileSystem' | string;
export type ToolStatus = 'Active' | 'Beta' | 'Deprecated' | 'Disabled';
export type ToolExecutionType = 'Sync' | 'Async' | 'Stream' | 'Background';
export type ToolDangerLevel = 'Safe' | 'Moderate' | 'Medium' | 'High' | 'Critical' | string;
export type ToolRiskLevel = ToolDangerLevel;
export type ApprovalLevel = 'Auto' | 'Ask User' | 'Admin Only' | 'Blocked';
export type PolicyDecision = 'Allow' | 'Require Approval' | 'Reject';

export interface PermissionValidationResult {
  valid: boolean;
  workspaceValid: boolean;
  projectValid: boolean;
  roleValid: boolean;
  ownershipValid: boolean;
  toolPermissionValid: boolean;
  missingPermissions: string[];
  errors: string[];
}

export interface DangerClassificationResult {
  dangerLevel: ToolDangerLevel;
  riskScore: number;
  riskFactors: string[];
  requiresApproval: boolean;
}

export interface ExecutionPolicyResult {
  decision: PolicyDecision;
  approvalLevel: ApprovalLevel;
  dangerLevel: ToolDangerLevel;
  reason: string;
  permissionValidation: PermissionValidationResult;
  dangerClassification: DangerClassificationResult;
}

export interface ToolCategoryInfo {
  name?: ToolCategory | string;
  category?: ToolCategory | string;
  description?: string;
  icon?: string;
  count?: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status?: ToolStatus;
  executionType?: ToolExecutionType | string;
  dangerLevel: ToolDangerLevel;
  requiresApproval?: boolean;
  approvalRequired?: boolean;
  requiredPermissions?: string[];
  requiredInputs?: string[];
  outputs?: string[];
  dependencies?: string[];
  timeoutMs?: number;
  retrySupport?: boolean;
  author?: string;
  tags?: string[];
  inputsSchema?: Record<string, unknown>;
  outputsSchema?: Record<string, unknown>;
  version: string;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  version?: string;
  provider: string;
  transport?: 'adapter' | 'sse' | 'stdio' | string;
  url?: string;
  status?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | string;
  enabled?: boolean;
  capabilities?: string[];
  discoveredToolsCount?: number;
  lastConnectedAt?: string;
}

export interface UniversalToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  provider: string;
  source: string;
  version: string;
  dangerLevel: ToolDangerLevel | ToolRiskLevel | string;
  approvalRequired?: boolean;
  requiresApproval?: boolean;
  enabled: boolean;
  requiredPermissions: string[];
  capabilities?: string[];
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  inputsSchema?: Record<string, unknown>;
  outputsSchema?: Record<string, unknown>;
  status?: ToolStatus;
  executionType?: ToolExecutionType | string;
}

export interface ToolEventLog {
  id: string;
  toolId: string;
  eventType: string;
  message: string;
  details?: Record<string, unknown>;
  createdAt: string;
  workspaceId?: string;
}

export interface ToolExecutionLog {
  id: string;
  executionId?: string;
  toolId?: string;
  toolName?: string;
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  inputs?: Record<string, unknown>;
  outputs?: unknown;
  startTime?: string;
  endTime?: string;
  durationMs?: number;
  status?: string;
  message?: string;
  level?: 'info' | 'warn' | 'error' | string;
  timestamp?: string;
  error?: string;
  retryCount?: number;
  details?: Record<string, unknown>;
}

export type PipelineStageState = 'Pending' | 'Waiting Approval' | 'Ready' | 'Running' | 'Completed' | 'Failed' | 'Cancelled' | string;

export interface ExecutionPlanStep {
  id: string;
  stepNumber: number;
  toolId?: string;
  actionName: string;
  description: string;
  inputs?: Record<string, unknown>;
  status: PipelineStageState;
  dependsOnStepIds?: string[];
}

export interface ExecutionPlan {
  id: string;
  requestId: string;
  title: string;
  goal: string;
  steps: ExecutionPlanStep[];
  status: PipelineStageState;
  createdAt: string;
  workspaceId?: string;
  projectId?: string;
}

export interface FormattedExecutionResult {
  executionId: string;
  toolId: string;
  toolName: string;
  success: boolean;
  outputs?: unknown;
  error?: string;
  warnings: string[];
  executionTimeMs: number;
  affectedModules: string[];
  affectedFiles: string[];
  summary: string;
  formattedAt: string;
}

export type ToolQueueStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | string;

export interface ToolQueueItem {
  id: string;
  executionId: string;
  toolId: string;
  toolName: string;
  workspaceId: string;
  projectId: string;
  userId: string;
  status: ToolQueueStatus;
  priority: number;
  enqueuedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type ExecutionState = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'AWAITING_APPROVAL' | string;

export interface ExecutionMetrics {
  id?: string;
  executionId?: string;
  toolId?: string;
  createdAt?: string;
  totalExecutions?: number;
  successRate?: number;
  averageDurationMs?: number;
  failedExecutions?: number;
  totalExecutionsCount?: number;
  successfulExecutionsCount?: number;
  failedExecutionsCount?: number;
  averageExecutionDurationMs?: number;
  validationDurationMs?: number;
  queueWaitDurationMs?: number;
  executionDurationMs?: number;
  totalDurationMs?: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
}

export interface ExecutionProgressReport {
  executionId: string;
  toolId?: string;
  progressPercent: number;
  stepMessage?: string;
  status?: ExecutionState;
}

export interface ExecutionResult {
  executionId?: string;
  toolId?: string;
  success: boolean;
  outputs?: unknown;
  output?: unknown;
  error?: string;
  logs?: string[];
  warnings?: string[];
  metrics?: ExecutionMetrics;
}

export interface ToolExecutionResult {
  success: boolean;
  toolId?: string;
  provider?: string;
  executionId?: string;
  output?: unknown;
  outputs?: unknown;
  error?: string;
  durationMs?: number;
  retryCount?: number;
  metadata?: Record<string, unknown>;
  logs?: string[];
  warnings?: string[];
  metrics?: ExecutionMetrics;
}

export interface ToolExecution {
  id: string;
  toolId: string;
  toolName: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'Running' | 'Queued' | 'Preparing' | 'Validating' | string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  stepMessage?: string;
  progressPercent?: number;
  progress?: number;
  args?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  result?: unknown;
  outputs?: unknown;
  error?: string;
  logs?: string[];
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  retryCount?: number;
  maxRetries?: number;
  approvalId?: string;
}

export type UserRole = 'ADMIN' | 'MEMBER' | 'VIEWER' | 'GUEST' | string;

export interface ToolExecutionContext {
  executionId: string;
  workspaceId: string;
  projectId: string;
  conversationId?: string;
  aiSessionId?: string;
  agentId?: string;
  userId: string;
  userRole: UserRole;
  currentGoal?: string;
  toolId: string;
  toolInputs: Record<string, unknown>;
  permissions: string[];
  dangerLevel: ToolDangerLevel;
  riskLevel?: ToolRiskLevel;
  environment?: string;
}

export interface ApprovalRequest {
  id: string;
  toolId: string;
  toolName: string;
  requestedBy: string;
  dangerLevel: ToolDangerLevel;
  reason: string;
  params?: Record<string, unknown>;
  requestedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  executionId?: string;
  workspaceId?: string;
  projectId?: string;
}

export interface ExecutionHistoryItem {
  id: string;
  executionId?: string;
  toolId: string;
  toolName: string;
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  inputs?: Record<string, unknown>;
  outputs?: unknown;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED' | ExecutionState | string;
  startedAt?: string;
  completedAt?: string;
  executedAt?: string;
  durationMs: number;
  executedBy?: string;
}

export type PluginType = 'Core' | 'Official' | 'Community' | 'Enterprise' | 'Private';

export interface PluginRegistryItem {
  id: string;
  name: string;
  description: string;
  pluginType: PluginType;
  enabled: boolean;
  version?: string;
  author?: string;
  downloads?: number;
  toolIds?: string[];
  manifest?: Record<string, unknown>;
  installedAt?: string;
}

export interface CodeConflictIssue {
  id: string;
  type: 'duplicate_component' | 'circular_import' | 'broken_reference' | 'duplicate_route' | 'duplicate_import';
  title: string;
  description: string;
  affectedFiles: string[];
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ProjectChatMessage {
  id: string;
  projectId: string;
  sender: 'user' | 'assistant' | 'system' | 'USER' | 'ASSISTANT' | 'SYSTEM' | string;
  name?: string;
  senderName?: string;
  text?: string;
  content?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface ProjectMemoryItem {
  id: string;
  projectId: string;
  category: 'REQUIREMENTS' | 'ARCHITECTURE' | 'DECISIONS' | 'NOTES' | 'PREFERENCES';
  title: string;
  content: string;
  tags?: string[];
  createdBy?: string;
  createdAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | string;
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedRole?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface ProjectConnection {
  id: string;
  projectId: string;
  name: string;
  provider: string;
  config?: Record<string, unknown>;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastTestedAt?: string;
  updatedAt?: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'AUDIT';

export interface ProjectLog {
  id: string;
  projectId: string;
  level: LogLevel;
  module: string;
  source?: string;
  message: string;
  details?: unknown;
  timestamp: string;
  createdAt?: string;
}

export interface ProjectSettings {
  projectId: string;
  framework: string;
  language: string;
  autoRefactor: boolean;
  autoValidate: boolean;
  model: string;
  gitRepository?: string | null;
}

export type ActivityEventType = 'Project Created' | 'Chat Started' | 'Planning Completed' | 'Execution Started' | 'Execution Completed' | 'Tool Execution' | 'Deployment' | 'Bug Fixed' | string;

export interface WorkspaceActivityItem {
  id: string;
  workspaceId?: string;
  projectId?: string;
  projectName?: string;
  type?: ActivityEventType;
  eventType?: ActivityEventType;
  title: string;
  description?: string;
  timestamp: string;
  performedBy?: string;
}

export interface WorkspaceSearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  projectId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceShortcut {
  key: string;
  action: string;
  description: string;
  category: string;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM' | string;

export interface WorkspaceNotification {
  id: string;
  workspaceId?: string;
  projectId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  timestamp?: string;
}

export type AIIntentType = 'Greeting' | 'Bug Fix Request' | 'Website Request' | 'Coding Request' | 'Planning Request' | 'Deployment Request' | 'Task Request' | 'Configuration Request' | 'Research Request' | 'Project Update' | 'Question' | 'Discussion' | string;

export interface AIPlanStep {
  id: string;
  title: string;
  description: string;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FAILED' | string;
  dependencies?: string[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  expectedOutput?: string;
}

export type AIModelState = 'Idle' | 'Thinking' | 'Planning' | 'Generating' | 'Executing' | 'Error' | string;

export interface AIWorkflow {
  id: string;
  workspaceId: string;
  projectId: string;
  conversationId: string;
  type: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | string;
  createdAt: string;
}

export interface WorkflowEvent {
  id: string;
  workflowId: string;
  workspaceId?: string;
  eventType: WorkflowEventType | string;
  stepId?: string;
  agentId?: string;
  title?: string;
  details?: Record<string, unknown> | string;
  timestamp: string;
}

export interface AISessionRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  conversationId: string;
  currentModel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type AISession = AISessionRecord;

export interface ResponseValidationResult {
  id: string;
  responseId: string;
  correctnessScore: number;
  completenessScore: number;
  readabilityScore: number;
  securityScore: number;
  overallScore: number;
  passed: boolean;
  issuesFound?: string[];
  createdAt: string;
}

export interface AIResponse {
  id: string;
  requestId?: string;
  sessionId?: string;
  workspaceId?: string;
  projectId?: string;
  conversationId?: string;
  intent?: string;
  goal?: string;
  plan?: Array<{ id?: string; title: string; description: string }>;
  reasoningSummary?: string;
  answer?: string;
  nextAction?: string;
  warnings?: string[];
  confidence?: string;
  confidenceScore?: number;
  modelUsed?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  createdAt?: string;
  timestamp?: string;
}

// GitHub Integration Types (Prompt 5.1)
export type GitHubConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'RECONNECTING' | 'PENDING' | string;

export interface GitHubAccount {
  id: string;
  githubUserId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  profileUrl?: string;
}

export interface GitHubOAuthSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes: string[];
  tokenType: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubConnection {
  id: string;
  userId: string;
  workspaceId?: string;
  status: GitHubConnectionStatus;
  account?: GitHubAccount;
  oauthSessionId?: string;
  lastValidatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRepositoryMetadata {
  id: string;
  fullName: string;
  name: string;
  owner: string;
  description?: string;
  isPrivate: boolean;
  defaultBranch: string;
  topics?: string[];
  starsCount?: number;
  forksCount?: number;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  updatedAt?: string;
}

export interface GitHubPermissionValidationResult {
  valid: boolean;
  hasRepoAccess: boolean;
  hasAdminPermission: boolean;
  hasPushPermission: boolean;
  hasPullPermission: boolean;
  missingScopes: string[];
  errors: string[];
}

// GitHub Integration Architecture Types (Prompt 5.2)
export type GitBranchType = 'main' | 'development' | 'feature' | 'release' | 'hotfix';

export interface GitBranchInfo {
  id: string;
  repoFullName: string;
  name: string;
  type: GitBranchType;
  isDefault: boolean;
  isProtected: boolean;
  headCommitSha?: string;
  createdAt: string;
}

export interface CommitPlan {
  id: string;
  repoFullName: string;
  branchName: string;
  message: string;
  summary: string;
  affectedFiles: string[];
  affectedModules: string[];
  status: 'Draft' | 'Planned' | 'Approved';
  createdAt: string;
}

export type GitFileChangeType = 'CREATED' | 'MODIFIED' | 'DELETED' | 'RENAMED';

export interface GitFileChange {
  path: string;
  changeType: GitFileChangeType;
  additions: number;
  deletions: number;
  oldPath?: string;
}

export interface GitChangeAnalysis {
  id: string;
  repoFullName: string;
  totalFilesChanged: number;
  createdFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
  renamedFiles: { oldPath: string; newPath: string }[];
  dependencyChanges: { package: string; oldVersion?: string; newVersion: string; changeType: 'ADDED' | 'UPDATED' | 'REMOVED' }[];
  changes: GitFileChange[];
  analyzedAt: string;
}

// GitHub Integration Architecture Types (Prompt 5.3)
export type PRMergeStrategy = 'squash' | 'rebase' | 'merge_commit';
export type PRApprovalStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

export interface PullRequestPlan {
  id: string;
  repoFullName: string;
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description: string;
  changedFilesSummary: {
    totalFiles: number;
    additions: number;
    deletions: number;
  };
  reviewChecklist: { item: string; completed: boolean }[];
  mergeStrategy: PRMergeStrategy;
  approvalStatus: PRApprovalStatus;
  readinessAnalysis: {
    isReady: boolean;
    checks: { name: string; passed: boolean; message: string }[];
  };
  createdAt: string;
}

export interface WorkflowPlanItem {
  name: string;
  type: 'build' | 'lint' | 'test' | 'deploy';
  status: 'ENABLED' | 'DISABLED';
  trigger: string;
  steps: string[];
}

export interface GitHubActionsPlan {
  id: string;
  repoFullName: string;
  workflows: WorkflowPlanItem[];
  executionOrder: string[];
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  failureRiskDetection: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    risks: string[];
    mitigation: string[];
  };
  plannedAt: string;
}

export interface ReleasePlan {
  id: string;
  repoFullName: string;
  targetBranch: string;
  currentVersion: string;
  plannedVersion: string;
  versionType: 'major' | 'minor' | 'patch';
  tagName: string;
  releaseNotes: string;
  changelog: { category: 'Features' | 'Fixes' | 'Performance' | 'Chore'; entries: string[] }[];
  releaseSummary: string;
  validation: {
    valid: boolean;
    errors: string[];
  };
  plannedAt: string;
}

export interface RepoSecurityAnalysis {
  id: string;
  repoFullName: string;
  visibility: 'public' | 'private' | 'internal';
  branchProtection: {
    enabled: boolean;
    enforceAdmins: boolean;
    requiredReviewsCount: number;
  };
  secretUsage: {
    count: number;
    detectedSecretsInCode: number;
    details: string[];
  };
  tokenScope: {
    scopes: string[];
    isExcessive: boolean;
  };
  permissionRisks: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
  }[];
  securityScore: number;
  recommendations: string[];
  analyzedAt: string;
}

// GitHub Integration Architecture Types (Prompt 5.4)
export interface RepoExplorerOverview {
  repoFullName: string;
  info: {
    description: string;
    isPrivate: boolean;
    defaultBranch: string;
    topics: string[];
    openIssuesCount: number;
    starsCount: number;
    forksCount: number;
  };
  branches: string[];
  statistics: {
    totalCommits: number;
    totalPRs: number;
    totalReleases: number;
    contributorsCount: number;
    repoSizeKb: number;
  };
  health: {
    score: number;
    checks: { name: string; status: 'PASS' | 'WARN' | 'FAIL'; description: string }[];
  };
  summary: string;
}

export interface CommitValidationAndRisk {
  isValid: boolean;
  validationErrors: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  risks: string[];
  recommendations: string[];
}

export interface BranchOperationPlan {
  id: string;
  repoFullName: string;
  action: 'CREATE' | 'RENAME' | 'DELETE';
  branchName: string;
  newBranchName?: string;
  mergeTargetValidation: {
    valid: boolean;
    warnings: string[];
  };
  protectionAnalysis: {
    isProtected: boolean;
    rules: string[];
  };
  plannedAt: string;
}

export interface GitHubActivityTimeline {
  id: string;
  repoFullName: string;
  commitTimeline: { id: string; hash: string; message: string; author: string; timestamp: string }[];
  prTimeline: { id: string; title: string; author: string; status: string; timestamp: string }[];
  releaseTimeline: { id: string; tag: string; name: string; timestamp: string }[];
  summary: string;
  insights: string[];
  generatedAt: string;
}

// Vercel Deployment Architecture Types (Prompt 6.1)
export interface VercelDeploymentPlan {
  id: string;
  projectId: string;
  projectName: string;
  targetEnvironment: 'PREVIEW' | 'PRODUCTION';
  buildStrategy: {
    framework: string;
    buildCommand: string;
    outputDirectory: string;
    nodeVersion: string;
  };
  summary: string;
  validation: {
    valid: boolean;
    checks: { name: string; status: 'PASS' | 'WARN' | 'FAIL'; message: string }[];
  };
  plannedAt: string;
}

export interface VercelEnvironmentConfig {
  id: string;
  projectId: string;
  variables: {
    key: string;
    isRequired: boolean;
    isConfigured: boolean;
    group: 'SYSTEM' | 'DATABASE' | 'AI' | 'AUTH' | 'GENERAL';
  }[];
  missingVariables: string[];
  validationStatus: 'VALID' | 'WARNING' | 'INCOMPLETE';
  analyzedAt: string;
}

export interface VercelProjectConfigAnalysis {
  id: string;
  projectId: string;
  nextConfig: {
    hasNextConfig: boolean;
    imagesConfigured: boolean;
    experimentalFeatures: string[];
  };
  buildConfig: {
    installCommand: string;
    buildCommand: string;
    devCommand: string;
  };
  outputConfig: {
    outputType: 'standalone' | 'export' | 'default';
    staticPagesCount: number;
    dynamicPagesCount: number;
  };
  deploymentReadiness: boolean;
  analyzedAt: string;
}

export interface VercelDeploymentReadinessReport {
  id: string;
  projectId: string;
  missingConfigurations: string[];
  missingEnvVariables: string[];
  buildReadiness: 'READY' | 'NEEDS_ATTENTION' | 'BLOCKED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  readinessScore: number;
  recommendations: string[];
  generatedAt: string;
}

// Vercel Deployment Pipeline & Validation Architecture Types (Prompt 6.2)
export interface VercelPipelinePlan {
  id: string;
  projectId: string;
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  stages: {
    stageName: 'VALIDATION' | 'BUILD' | 'DEPLOYMENT' | 'ROLLBACK';
    status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'SKIPPED';
    durationMs: number;
    details: string;
  }[];
  createdAt: string;
}

export interface VercelBuildValidationReport {
  id: string;
  projectId: string;
  nextjsValidation: { valid: boolean; issues: string[] };
  typeScriptValidation: { valid: boolean; errorsCount: number; details: string };
  eslintValidation: { valid: boolean; warningsCount: number; details: string };
  dependencyValidation: { valid: boolean; missingPackages: string[] };
  buildReadiness: boolean;
  validatedAt: string;
}

export interface VercelDeploymentRiskAnalysis {
  id: string;
  projectId: string;
  configurationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  environmentRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  dependencyRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  buildRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  deploymentRiskScore: number;
  riskFactors: string[];
  analyzedAt: string;
}

export interface VercelRollbackPlan {
  id: string;
  projectId: string;
  currentVersion: string;
  previousVersion: string;
  rollbackValidation: { valid: boolean; checks: string[] };
  recoveryStrategy: string;
  rollbackReadiness: 'READY' | 'NOT_AVAILABLE';
  plannedAt: string;
}

// Vercel Deployment Monitoring & History Types (Prompt 6.3)
export interface VercelDeploymentHistoryEntry {
  id: string;
  projectId: string;
  version: string;
  commitHash: string;
  branch: string;
  status: 'SUCCESS' | 'FAILED' | 'BUILDING' | 'CANCELLED';
  environment: 'production' | 'preview' | 'development';
  durationMs: number;
  timeline: { step: string; timestamp: string; status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' }[];
  metadata: { creator: string; framework: string; nodeVersion: string };
  createdAt: string;
}

export interface VercelDeploymentLog {
  id: string;
  deploymentId: string;
  projectId: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'BUILD' | 'VALIDATION' | 'DEPLOY';
  source: 'BUILD' | 'VALIDATION' | 'DEPLOYMENT' | 'RUNTIME';
  message: string;
  timestamp: string;
}

export interface VercelDeploymentMonitoringMetrics {
  id: string;
  projectId: string;
  liveStatus: 'HEALTHY' | 'DEGRADED' | 'OUTAGE' | 'BUILDING';
  healthScore: number;
  avgBuildDurationMs: number;
  successRatePct: number;
  failureRatePct: number;
  totalDeployments: number;
  analytics: {
    date: string;
    deploymentsCount: number;
    avgDurationMs: number;
    successCount: number;
    failureCount: number;
  }[];
  monitoredAt: string;
}

export interface VercelDeploymentInsights {
  id: string;
  projectId: string;
  overallHealthScore: number;
  avgBuildTimeSec: number;
  totalDeploymentsCount: number;
  successCount: number;
  failureCount: number;
  recentDeployments: VercelDeploymentHistoryEntry[];
  deploymentTrend: { date: string; score: number }[];
  generatedAt: string;
}

// Vercel Deployment Approval, Policy, Recovery & Executive Types (Prompt 6.4)
export interface VercelDeploymentApprovalRecord {
  id: string;
  projectId: string;
  deploymentId: string;
  targetEnvironment: 'production' | 'preview';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  reviewer: string;
  comments: string;
  decisionAt: string;
}

export interface VercelDeploymentPolicyCompliance {
  id: string;
  projectId: string;
  productionPolicies: { name: string; compliant: boolean; description: string }[];
  previewPolicies: { name: string; compliant: boolean; description: string }[];
  environmentRules: { name: string; compliant: boolean; description: string }[];
  complianceScore: number;
  evaluatedAt: string;
}

export interface VercelDeploymentRecoveryPlan {
  id: string;
  projectId: string;
  incidentSummary: string;
  failureRecoverySteps: string[];
  rollbackTargetVersion: string;
  recoveryTimeline: { step: string; estDurationSec: number; status: 'READY' | 'COMPLETED' }[];
  recoveryReadinessScore: number;
  plannedAt: string;
}

export interface VercelDeploymentExecutiveDashboard {
  id: string;
  projectId: string;
  overallDeploymentStatus: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  kpis: { metricName: string; value: string; trend: 'STABLE' | 'IMPROVING' | 'ATTENTION' }[];
  approvalMetrics: { pendingApprovals: number; avgApprovalTimeMin: number; totalApproved: number };
  recoveryMetrics: { totalIncidents: number; mttrMinutes: number; recoveryReadinessScore: number };
  policyCompliancePct: number;
  executiveSummary: string;
  generatedAt: string;
}

// Firebase Integration Engine Types (Prompt 7.1)
export interface FirebaseProjectInfo {
  projectId: string;
  projectName: string;
  appId: string;
  region: string;
  billingPlan: 'Spark (Free)' | 'Blaze (Pay-as-you-go)';
  status: 'ACTIVE' | 'PROVISIONING' | 'MAINTENANCE';
  environment: 'development' | 'staging' | 'production';
}

export interface FirebaseConfigRecord {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseEnvironmentMapping {
  environment: 'development' | 'staging' | 'production';
  config: FirebaseConfigRecord;
  isConfigured: boolean;
}

export interface FirebaseProjectValidation {
  valid: boolean;
  checks: { name: string; status: 'PASS' | 'WARN' | 'FAIL'; message: string }[];
}

export interface FirebaseProjectSummary {
  id: string;
  projectId: string;
  info: FirebaseProjectInfo;
  environments: FirebaseEnvironmentMapping[];
  validation: FirebaseProjectValidation;
  summaryText: string;
  generatedAt: string;
}

export interface FirebaseAuthAuthProvider {
  id: string;
  name: string;
  type: 'email' | 'google' | 'github' | 'anonymous';
  enabled: boolean;
  scopes?: string[];
  configRequirement?: string;
}

export interface FirebaseAuthValidation {
  valid: boolean;
  providerCount: number;
  issues: string[];
}

export interface FirebaseAuthReadinessReport {
  id: string;
  projectId: string;
  readinessScore: number;
  providers: FirebaseAuthAuthProvider[];
  validation: FirebaseAuthValidation;
  domainAllowlist: string[];
  mfaEnforced: boolean;
  readinessStatus: 'READY' | 'NEEDS_ATTENTION' | 'NOT_CONFIGURED';
  generatedAt: string;
}

export interface FirestoreCollectionPlan {
  name: string;
  path: string;
  description: string;
  entitySchema: string;
  estimatedDocumentCount?: number;
}

export interface FirestoreDocumentStructure {
  entityName: string;
  fields: { name: string; type: string; required: boolean; description?: string; maxLength?: number; pattern?: string }[];
}

export interface FirestoreIndexPlan {
  collectionPath: string;
  fields: { fieldPath: string; order: 'ASCENDING' | 'DESCENDING' }[];
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
}

export interface FirestoreRulesPlan {
  masterGateEnabled: boolean;
  isValidHelperPresent: boolean;
  allowListRestricted: boolean;
  defaultDenyEnabled: boolean;
  rulesDraft: string;
}

export interface FirestoreCollectionValidation {
  valid: boolean;
  collectionCount: number;
  indexCount: number;
  missingIndexWarnings: string[];
}

export interface FirestorePlannerReport {
  id: string;
  projectId: string;
  collections: FirestoreCollectionPlan[];
  structures: FirestoreDocumentStructure[];
  indexes: FirestoreIndexPlan[];
  rulesPlan: FirestoreRulesPlan;
  validation: FirestoreCollectionValidation;
  generatedAt: string;
}

export interface FirebaseStorageBucketStructure {
  bucketName: string;
  region: string;
  corsConfigured: boolean;
  defaultMaxUploadSizeBytes: number;
}

export interface FirebaseStorageFolderPlan {
  folderPath: string;
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
  description: string;
}

export interface FirebaseStorageUploadStrategy {
  resumableUploads: boolean;
  directClientUpload: boolean;
  clientChunkSizeBytes: number;
  maxConcurrentUploads: number;
}

export interface FirebaseStorageAccessRules {
  rulesDraft: string;
  authRequiredPaths: string[];
  publicPaths: string[];
}

export interface FirebaseStorageValidation {
  valid: boolean;
  foldersCount: number;
  accessRulesValid: boolean;
  issues: string[];
}

export interface FirebaseStoragePlannerReport {
  id: string;
  projectId: string;
  bucket: FirebaseStorageBucketStructure;
  folders: FirebaseStorageFolderPlan[];
  uploadStrategy: FirebaseStorageUploadStrategy;
  accessRules: FirebaseStorageAccessRules;
  validation: FirebaseStorageValidation;
  generatedAt: string;
}

// Firebase Integration Engine Part 2 Types (Prompt 7.2)
export interface FirestoreCollectionMetadata {
  id: string;
  name: string;
  path: string;
  documentCount: number;
  avgDocumentSizeBytes: number;
  ttlEnabled: boolean;
  parentCollection?: string;
  subCollections: string[];
}

export interface FirestoreCollectionRelationship {
  sourceCollection: string;
  targetCollection: string;
  relationshipType: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
  foreignKeyField: string;
}

export interface FirestoreCollectionStatistics {
  totalCollections: number;
  totalEstimatedDocuments: number;
  totalStorageSizeBytes: number;
  dailyReadOperations: number;
  dailyWriteOperations: number;
}

export interface FirestoreCollectionManagerReport {
  id: string;
  projectId: string;
  collections: FirestoreCollectionMetadata[];
  relationships: FirestoreCollectionRelationship[];
  statistics: FirestoreCollectionStatistics;
  validation: { valid: boolean; issues: string[] };
  generatedAt: string;
}

export interface FirestoreRuleOperationPolicy {
  operation: 'read' | 'write' | 'update' | 'delete' | 'create';
  collectionPath: string;
  condition: string;
  restrictedFields?: string[];
  roleRequired?: string;
}

export interface FirestoreRulesManagerReport {
  id: string;
  projectId: string;
  readRules: FirestoreRuleOperationPolicy[];
  writeRules: FirestoreRuleOperationPolicy[];
  updateRules: FirestoreRuleOperationPolicy[];
  deleteRules: FirestoreRuleOperationPolicy[];
  rulesSummary: string;
  validation: { valid: boolean; warnings: string[] };
  generatedAt: string;
}

export interface FirebaseAuthRole {
  roleId: string;
  name: string;
  description: string;
  permissions: string[];
  assignedUsersCount: number;
}

export interface FirebaseAuthSessionOverview {
  activeSessions: number;
  tokenExpirationMinutes: number;
  mfaEnforcementRatePercent: number;
  suspiciousActivityDetected: boolean;
}

export interface FirebaseAuthManagerReport {
  id: string;
  projectId: string;
  roles: FirebaseAuthRole[];
  permissionMap: Record<string, string[]>;
  sessionOverview: FirebaseAuthSessionOverview;
  authPolicies: { policyName: string; status: 'ENFORCED' | 'OPTIONAL' | 'DISABLED'; detail: string }[];
  accessValidation: { valid: boolean; auditResults: string[] };
  generatedAt: string;
}

export interface FirebaseSecurityDashboardReport {
  id: string;
  projectId: string;
  securityScore: number;
  authHealth: 'OPTIMAL' | 'NEEDS_REVIEW' | 'CRITICAL';
  firestoreHealth: 'OPTIMAL' | 'NEEDS_REVIEW' | 'CRITICAL';
  rulesStatus: 'SECURE_MASTER_GATED' | 'PERMISSIVE' | 'UNSECURED';
  configSummary: {
    sslEnforced: boolean;
    appCheckActive: boolean;
    auditLogRetentionDays: number;
    environment: string;
  };
  generatedAt: string;
}

// Firebase Integration Engine Part 3 Types (Prompt 7.3)
export interface FirebaseActivityEvent {
  id: string;
  category: 'AUTH' | 'FIRESTORE' | 'STORAGE' | 'PROJECT';
  operation: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  actor: string;
  timestamp: string;
  details: string;
}

export interface FirebaseActivityManagerReport {
  id: string;
  projectId: string;
  activities: FirebaseActivityEvent[];
  timeline: { timestamp: string; eventCount: number }[];
  categories: string[];
  generatedAt: string;
}

export interface FirebaseMonitoringMetric {
  metricName: string;
  value: string;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface FirebaseMonitoringEngineReport {
  id: string;
  projectId: string;
  authHealth: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  firestoreHealth: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  storageHealth: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  overallFirebaseStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  healthSummary: string;
  metrics: FirebaseMonitoringMetric[];
  generatedAt: string;
}

export interface FirebaseAnalyticsEngineReport {
  id: string;
  projectId: string;
  userStats: {
    totalUsers: number;
    activeDailyUsers: number;
    newUsersThisMonth: number;
    mfaUsersPercent: number;
  };
  collectionStats: {
    collectionName: string;
    docCount: number;
    readOps: number;
    writeOps: number;
  }[];
  storageStats: {
    bucketName: string;
    usedStorageBytes: number;
    fileCount: number;
    bandwidthUsageBytes: number;
  };
  generatedAt: string;
}

// Firebase Integration Engine Part 4 Types (Prompt 7.4)
export interface FirebaseConfigurationManagerReport {
  id: string;
  projectId: string;
  projectConfigSummary: {
    projectId: string;
    region: string;
    billingPlan: string;
    servicesEnabled: string[];
  };
  authConfig: {
    mfaEnforced: boolean;
    allowedProviders: string[];
    sessionDurationHours: number;
  };
  firestoreConfig: {
    databaseId: string;
    concurrencyMode: string;
    pitrEnabled: boolean;
  };
  storageConfig: {
    bucketLocation: string;
    corsEnabled: boolean;
    maxUploadSizeBytes: number;
  };
  securityConfig: {
    appCheckEnforced: boolean;
    rulesVersion: string;
    tlsVersion: string;
  };
  validationStatus: 'VALID' | 'WARNING' | 'INVALID';
  validationErrors: string[];
  generatedAt: string;
}

export interface FirebaseBackupRecoveryPlan {
  id: string;
  projectId: string;
  firestoreBackupPlan: {
    frequency: string;
    scheduleCron: string;
    retentionDays: number;
    destinationBucket: string;
  };
  storageBackupPlan: {
    frequency: string;
    syncType: string;
    retentionDays: number;
  };
  authBackupStrategy: {
    exportFormat: string;
    encryptionKeyManaged: boolean;
    automatedExportEnabled: boolean;
  };
  recoveryWorkflowSteps: string[];
  recoveryReadinessScore: number; // 0-100
  generatedAt: string;
}

export interface FirebaseComplianceReport {
  id: string;
  projectId: string;
  securityCompliance: { status: 'COMPLIANT' | 'NON_COMPLIANT'; details: string };
  authCompliance: { status: 'COMPLIANT' | 'NON_COMPLIANT'; details: string };
  firestoreCompliance: { status: 'COMPLIANT' | 'NON_COMPLIANT'; details: string };
  storageCompliance: { status: 'COMPLIANT' | 'NON_COMPLIANT'; details: string };
  bestPracticeValidation: { rule: string; passed: boolean }[];
  complianceScore: number; // 0-100
  generatedAt: string;
}

export interface FirebaseExecutiveDashboardReport {
  id: string;
  projectId: string;
  overallFirebaseHealth: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  securityScore: number; // 0-100
  complianceScore: number; // 0-100
  backupReadinessScore: number; // 0-100
  configurationHealth: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
  executiveSummary: string;
  generatedAt: string;
}

// Memory & Knowledge Engine Part 1 Types (Prompt 8.1)
export interface MemoryItem {
  id: string;
  type: 'SHORT_TERM' | 'LONG_TERM' | 'SESSION' | 'WORKSPACE' | 'PROJECT';
  content: string;
  tags: string[];
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryManagerReport {
  id: string;
  workspaceId: string;
  shortTermMemory: MemoryItem[];
  longTermMemory: MemoryItem[];
  sessionMemory: MemoryItem[];
  workspaceMemory: MemoryItem[];
  projectMemory: MemoryItem[];
  generatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  collection: string;
  category: string;
  source: string;
  validated: boolean;
  summary: string;
  updatedAt: string;
}

export interface KnowledgeManagerReport {
  id: string;
  workspaceId: string;
  collections: string[];
  categories: string[];
  sources: string[];
  items: KnowledgeItem[];
  totalValidated: number;
  summary: string;
  generatedAt: string;
}

export interface MemoryClassification {
  id: string;
  memoryId: string;
  classificationType: 'CONVERSATION' | 'CODE' | 'PROJECT' | 'TASK' | 'KNOWLEDGE';
  confidence: number;
  rationale: string;
}

export interface MemoryClassificationReport {
  id: string;
  workspaceId: string;
  classifications: MemoryClassification[];
  summary: {
    conversationCount: number;
    codeCount: number;
    projectCount: number;
    taskCount: number;
    knowledgeCount: number;
  };
  generatedAt: string;
}

// Memory & Knowledge Engine Part 2 Types (Prompt 8.2)
export interface MemorySearchResult {
  id: string;
  memoryId: string;
  scope: 'GLOBAL' | 'SESSION' | 'WORKSPACE' | 'PROJECT';
  title: string;
  snippet: string;
  relevanceScore: number;
  rank: number;
  matchedFilters: string[];
  timestamp: string;
}

export interface MemorySearchReport {
  id: string;
  workspaceId: string;
  query: string;
  filtersApplied: { scope?: string; category?: string; minScore?: number };
  results: MemorySearchResult[];
  totalResults: number;
  searchLatencyMs: number;
  analytics: {
    topQueryCategories: string[];
    searchCountToday: number;
    avgRankScore: number;
  };
  generatedAt: string;
}

export interface ContextRetrievalItem {
  id: string;
  contextType: 'CONVERSATION' | 'PROJECT' | 'CODE' | 'TASK' | 'WORKSPACE';
  title: string;
  extractedPayload: string;
  tokenCount: number;
  relevanceRank: number;
}

export interface ContextRetrievalReport {
  id: string;
  workspaceId: string;
  conversationContext: ContextRetrievalItem[];
  projectContext: ContextRetrievalItem[];
  codeContext: ContextRetrievalItem[];
  taskContext: ContextRetrievalItem[];
  workspaceContext: ContextRetrievalItem[];
  totalTokensRetrieved: number;
  retrievalLatencyMs: number;
  generatedAt: string;
}

export interface KnowledgeIndexEntry {
  id: string;
  indexKey: string;
  category: string;
  tags: string[];
  references: string[];
  sourceMapping: {
    sourceName: string;
    sourceUrl: string;
    lastSyncedAt: string;
  };
  isValidated: boolean;
  validationErrors: string[];
}

export interface KnowledgeIndexReport {
  id: string;
  workspaceId: string;
  entries: KnowledgeIndexEntry[];
  totalEntries: number;
  categoriesCount: number;
  tagsCount: number;
  indexValidationStatus: 'VALID' | 'WARNING' | 'INVALID';
  generatedAt: string;
}

// Memory & Knowledge Engine Part 3 Types (Prompt 8.3)
export interface MemoryAnalyticsReport {
  id: string;
  workspaceId: string;
  memoryUsageStats: {
    totalItems: number;
    shortTermCount: number;
    longTermCount: number;
    episodicCount: number;
    semanticCount: number;
    workingCount: number;
  };
  sessionMetrics: {
    activeSessions: number;
    memoriesPerSessionAvg: number;
    sessionRetentionRate: number;
  };
  workspaceMetrics: {
    workspaceStorageUsedMb: number;
    indexedKnowledgeNodes: number;
    crossProjectLinksCount: number;
  };
  projectMetrics: {
    projectCount: number;
    topProjectMemoryDensity: string;
    avgMemoriesPerProject: number;
  };
  growthTrends: {
    period: string;
    dailyGrowthRatePercent: number;
    projectedMonthlyItems: number;
  };
  memoryHealthSummary: {
    status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
    score: number;
    recommendations: string[];
  };
  generatedAt: string;
}

export interface KnowledgeLink {
  id: string;
  sourceKey: string;
  targetKey: string;
  relationshipType: 'PARENT_CHILD' | 'CROSS_REFERENCE' | 'CATEGORY_DEPENDENCY' | 'RELATED';
  weight: number;
  description: string;
}

export interface KnowledgeRelationshipReport {
  id: string;
  workspaceId: string;
  links: KnowledgeLink[];
  parentChildCount: number;
  crossReferencesCount: number;
  categoryDependenciesCount: number;
  totalGraphNodes: number;
  generatedAt: string;
}

export interface ContextIntelligenceItem {
  id: string;
  contextKey: string;
  domain: 'CONVERSATION' | 'PROJECT' | 'CODE' | 'TASK' | 'WORKSPACE';
  prioritizationRank: number;
  relevanceScore: number;
  timelineTimestamp: string;
  summary: string;
  isAutoSelected: boolean;
}

export interface ContextIntelligenceReport {
  id: string;
  workspaceId: string;
  items: ContextIntelligenceItem[];
  intelligentSelectionSummary: string;
  topContextDomain: string;
  averageRelevanceScore: number;
  generatedAt: string;
}

export interface MemoryExecutiveInsightsReport {
  id: string;
  workspaceId: string;
  overallCognitiveHealthScore: number;
  executiveSummary: string;
  keyInsights: string[];
  strategicActionItems: string[];
  generatedAt: string;
}

// Memory & Knowledge Engine Part 4 Types (Prompt 8.4)
export interface MemoryLifecycleReport {
  id: string;
  workspaceId: string;
  activePolicies: {
    autoArchiveDays: number;
    autoExpireDays: number;
    cleanupSchedule: string;
    autoPruneStale: boolean;
  };
  lifecycleStats: {
    activeMemories: number;
    classifiedMemories: number;
    pendingUpdates: number;
    archivedMemories: number;
    expiredMemories: number;
  };
  recentLifecycleEvents: Array<{
    id: string;
    memoryId: string;
    eventType: 'CREATED' | 'CLASSIFIED' | 'UPDATED' | 'ARCHIVED' | 'EXPIRED' | 'CLEANED_UP';
    details: string;
    timestamp: string;
  }>;
  generatedAt: string;
}

export interface KnowledgeGovernanceReport {
  id: string;
  workspaceId: string;
  governanceMetrics: {
    totalValidated: number;
    pendingApproval: number;
    duplicateDetectedCount: number;
    qualityScore: number;
    healthStatus: 'HEALTHY' | 'NEEDS_AUDIT' | 'CRITICAL';
  };
  duplicateEntries: Array<{
    id: string;
    primaryKey: string;
    duplicateKey: string;
    similarityScore: number;
    recommendation: string;
  }>;
  governanceAuditLog: Array<{
    id: string;
    action: string;
    target: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    auditedAt: string;
  }>;
  generatedAt: string;
}

export interface MemoryMasterExecutiveDashboardReport {
  id: string;
  workspaceId: string;
  overallMemoryHealth: number;
  knowledgeHealth: number;
  contextQualityScore: number;
  memoryStatistics: {
    totalItems: number;
    activeSessions: number;
    memoryStorageUsedMb: number;
  };
  knowledgeStatistics: {
    totalEntries: number;
    totalCategories: number;
    totalRelationships: number;
  };
  executiveSummary: string;
  generatedAt: string;
}

// Prompt 9.1 RAG & Document Intelligence Types
export interface DocumentRecord {
  id: string;
  title: string;
  category: 'SPECIFICATION' | 'ARCHITECTURE' | 'CODE_DOC' | 'GUIDE' | 'COMPLIANCE' | 'GENERAL';
  fileType: 'PDF' | 'MD' | 'TXT' | 'DOCX' | 'JSON';
  sizeKb: number;
  workspaceId: string;
  projectId: string;
  tags: string[];
  collectionId: string;
  folderPath: string;
  registrationDate: string;
  status: 'REGISTERED' | 'PARSED' | 'PROCESSED' | 'FAILED';
  metadata: {
    author: string;
    version: string;
    language: string;
    checksum: string;
  };
}

export interface DocumentCollection {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  folderPath: string;
  tags: string[];
}

export interface DocumentProcessingJob {
  id: string;
  documentId: string;
  documentTitle: string;
  uploadQueueRank: number;
  parsingStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  processingStatus: 'QUEUED' | 'EXTRACTING' | 'INDEXING' | 'READY';
  validationStatus: 'VALIDATED' | 'REQUIRES_REVIEW' | 'INVALID';
  summary: string;
}

export interface DocumentWorkspaceReport {
  id: string;
  workspaceId: string;
  documents: DocumentRecord[];
  collections: DocumentCollection[];
  processingJobs: DocumentProcessingJob[];
  totalDocuments: number;
  totalCollections: number;
  pendingJobsCount: number;
  generatedAt: string;
}

// Prompt 9.2 Types (Parsing, Chunking & Index Planning)
export interface DocumentParserConfig {
  id: string;
  fileType: 'PDF' | 'DOCX' | 'MD' | 'TXT';
  parserName: string;
  status: 'ACTIVE' | 'STANDBY' | 'VALIDATED';
  isValidated: boolean;
  supportedFormats: string[];
  extractionCapabilities: string[];
}

export interface DocumentParserReport {
  id: string;
  workspaceId: string;
  parsers: DocumentParserConfig[];
  activeParsersCount: number;
  validationStatus: string;
  generatedAt: string;
}

export interface DocumentChunkSpec {
  id: string;
  documentId: string;
  chunkOrder: number;
  targetChunkSizeTokens: number;
  overlapTokens: number;
  chunkMetadata: {
    headingContext: string;
    pageNumber?: number;
    sectionType: string;
  };
  characterCount: number;
  tokenEstimate: number;
}

export interface DocumentChunkReport {
  id: string;
  workspaceId: string;
  defaultConfig: {
    maxChunkSizeTokens: number;
    overlapTokens: number;
    chunkingStrategy: string;
  };
  sampleChunks: DocumentChunkSpec[];
  totalChunksCount: number;
  avgChunkSizeTokens: number;
  generatedAt: string;
}

export interface KnowledgeIndexPlanEntry {
  id: string;
  documentId: string;
  indexTargetKey: string;
  metadataMapping: Record<string, string>;
  sourceMapping: {
    sourceType: string;
    uriOrPath: string;
  };
  tagMapping: string[];
  referenceMapping: string[];
  isValidated: boolean;
}

export interface KnowledgeIndexPlanReport {
  id: string;
  workspaceId: string;
  plans: KnowledgeIndexPlanEntry[];
  totalIndexPlans: number;
  validatedPlansCount: number;
  generatedAt: string;
}

export interface DocumentIntelligenceReport {
  id: string;
  workspaceId: string;
  parserReport: DocumentParserReport;
  chunkReport: DocumentChunkReport;
  indexPlanReport: KnowledgeIndexPlanReport;
  processingOverview: {
    totalDocumentsPlanned: number;
    totalChunksEstimated: number;
    indexPlanningHealthScore: number;
    status: 'OPTIMAL' | 'PLANNING_REQUIRED' | 'AUDIT_NEEDED';
  };
  generatedAt: string;
}

// Prompt 9.3 Types (Retrieval, Ranking & Citation Intelligence)
export interface RetrievalQueryResult {
  queryId: string;
  workspaceId: string;
  projectId: string;
  retrievedDocsCount: number;
  retrievedChunksCount: number;
  retrievalTimeMs: number;
  sources: string[];
  metadataMatches: Record<string, string>;
}

export interface RetrievalEngineReport {
  id: string;
  workspaceId: string;
  workspaceScope: string;
  projectScope: string;
  knowledgeScope: string;
  stats: {
    totalQueriesProcessed: number;
    avgRetrievalLatencyMs: number;
    cacheHitRatio: number;
  };
  recentQueries: RetrievalQueryResult[];
  generatedAt: string;
}

export interface ContextRankingItem {
  chunkId: string;
  docTitle: string;
  relevanceScore: number;
  priorityRank: number;
  filteringStatus: 'ACCEPTED' | 'FILTERED_OUT' | 'MARGINAL';
  confidenceScore: number;
  rationale: string;
}

export interface ContextRankingReport {
  id: string;
  workspaceId: string;
  rankingPipeline: string;
  rankedContexts: ContextRankingItem[];
  topPriorityCount: number;
  avgConfidence: number;
  generatedAt: string;
}

export interface CitationReference {
  citationId: string;
  docId: string;
  docTitle: string;
  sourcePath: string;
  pageOrSection: string;
  isValidated: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'INVALID';
}

export interface CitationIntelligenceReport {
  id: string;
  workspaceId: string;
  trackedSourcesCount: number;
  citations: CitationReference[];
  summary: string;
  validationPassRate: number;
  generatedAt: string;
}

export interface RetrievalWorkspaceReport {
  id: string;
  workspaceId: string;
  retrievalReport: RetrievalEngineReport;
  rankingReport: ContextRankingReport;
  citationReport: CitationIntelligenceReport;
  analytics: {
    totalRetrievalEvents: number;
    avgRankingLatencyMs: number;
    citationAccuracyScore: number;
  };
  generatedAt: string;
}

export interface DocumentGovernanceItem {
  docId: string;
  docTitle: string;
  validationStatus: 'PASSED' | 'WARNING' | 'FAILED';
  duplicateStatus: 'UNIQUE' | 'POTENTIAL_DUPLICATE' | 'DUPLICATE_RESOLVED';
  version: string;
  retentionPolicy: string;
  healthScore: number;
}

export interface DocumentGovernanceReport {
  id: string;
  workspaceId: string;
  validatedDocsCount: number;
  duplicatesDetected: number;
  activeVersionsCount: number;
  retentionComplianceScore: number;
  documentHealthScore: number;
  items: DocumentGovernanceItem[];
  generatedAt: string;
}

export interface KnowledgeQualityMetric {
  metricName: string;
  score: number;
  category: 'RETRIEVAL' | 'CITATION' | 'CONTEXT' | 'GOVERNANCE';
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADED';
  details: string;
}

export interface KnowledgeQualityReport {
  id: string;
  workspaceId: string;
  overallQualityScore: number;
  retrievalQualityScore: number;
  citationCoverageScore: number;
  contextQualityScore: number;
  qualityTrends: { date: string; score: number }[];
  executiveQualitySummary: string;
  metrics: KnowledgeQualityMetric[];
  generatedAt: string;
}

export interface RAGExecutiveMasterReport {
  id: string;
  workspaceId: string;
  overallDocumentHealth: number;
  retrievalHealth: number;
  citationHealth: number;
  knowledgeHealth: number;
  governanceScore: number;
  executiveSummary: string;
  governanceReport: DocumentGovernanceReport;
  knowledgeQualityReport: KnowledgeQualityReport;
  generatedAt: string;
}

// Prompt 10.1 Types (Multi-Agent Orchestration Foundation)
export interface AgentRegistryItem {
  agentId: string;
  name: string;
  category: 'EXECUTIVE' | 'ENGINEERING' | 'ANALYTICS' | 'OPERATIONS' | 'GOVERNANCE';
  version: string;
  status: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE';
  metadata: {
    author: string;
    description: string;
    createdAt: string;
  };
  isValidated: boolean;
}

export interface AgentRegistryReport {
  id: string;
  workspaceId: string;
  registeredAgentsCount: number;
  activeAgentsCount: number;
  agents: AgentRegistryItem[];
  registryValidationStatus: 'VALIDATED' | 'PENDING';
  generatedAt: string;
}

export interface AgentWorkspaceAssignment {
  agentId: string;
  agentName: string;
  workspaceId: string;
  projectId: string;
  ownerRole: string;
  visibility: 'PUBLIC_IN_WORKSPACE' | 'RESTRICTED' | 'EXECUTIVE_ONLY';
}

export interface AgentWorkspaceReport {
  id: string;
  workspaceId: string;
  totalAssignedAgents: number;
  assignments: AgentWorkspaceAssignment[];
  workspaceSummary: string;
  generatedAt: string;
}

export interface AgentCapabilityMap {
  agentId: string;
  agentName: string;
  supportedTasks: string[];
  supportedTools: string[];
  supportedIntegrations: string[];
  isValidated: boolean;
  validationNotes: string;
}

export interface AgentCapabilityReport {
  id: string;
  workspaceId: string;
  totalCapabilitiesMapped: number;
  capabilities: AgentCapabilityMap[];
  validationPassRate: number;
  generatedAt: string;
}

export interface MultiAgentOrchestrationMasterReport {
  id: string;
  workspaceId: string;
  registryReport: AgentRegistryReport;
  workspaceReport: AgentWorkspaceReport;
  capabilityReport: AgentCapabilityReport;
  overallStatus: 'OPERATIONAL' | 'DEGRADED';
  generatedAt: string;
}

// Prompt 10.2 Types (Agent Task Planning, Delegation & Coordination Engine)
export interface AgentTaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AgentTaskItem {
  taskId: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  dependencies: string[];
  subtasks: AgentTaskSubtask[];
  completionProgress: number;
}

export interface AgentTaskPlannerReport {
  id: string;
  workspaceId: string;
  totalTasks: number;
  completedTasks: number;
  tasks: AgentTaskItem[];
  generatedAt: string;
}

export interface AgentDelegationRecord {
  delegationId: string;
  taskId: string;
  taskTitle: string;
  assignedAgentId: string;
  assignedAgentName: string;
  capabilityMatchScore: number;
  delegationRuleApplied: string;
  validationStatus: 'VALIDATED' | 'PENDING';
  timestamp: string;
}

export interface AgentDelegationHistoryItem {
  timestamp: string;
  action: string;
  agentId: string;
  taskId: string;
}

export interface AgentDelegationReport {
  id: string;
  workspaceId: string;
  totalDelegations: number;
  records: AgentDelegationRecord[];
  history: AgentDelegationHistoryItem[];
  generatedAt: string;
}

export interface AgentExecutionStep {
  step: number;
  agentId: string;
  agentName: string;
  taskId: string;
  taskTitle: string;
  dependencies: string[];
}

export interface SharedContextEntry {
  key: string;
  value: string;
  lastUpdatedBy: string;
}

export interface ConflictDetectionStatus {
  hasConflict: boolean;
  activeConflicts: string[];
  resolutionRule: string;
}

export interface AgentTimelineEntry {
  timeSlot: string;
  agentName: string;
  taskTitle: string;
  status: 'SCHEDULED' | 'RUNNING' | 'FINISHED' | 'WAITING';
}

export interface AgentCoordinationPlan {
  id: string;
  workspaceId: string;
  coordinationStatus: 'ACTIVE_SYNCHRONIZED' | 'RESOLVING' | 'PAUSED';
  executionOrder: AgentExecutionStep[];
  sharedTaskContext: SharedContextEntry[];
  conflictDetection: ConflictDetectionStatus;
  timeline: AgentTimelineEntry[];
  generatedAt: string;
}

// Prompt 10.3 Types (Agent Execution Coordination, Approval & Handoff Engine)
export interface AgentExecutionStage {
  stageId: string;
  stageName: string;
  order: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  assignedAgentId: string;
  assignedAgentName: string;
  taskIds: string[];
}

export interface AgentExecutionCoordinatorReport {
  id: string;
  workspaceId: string;
  executionPlanId: string;
  stages: AgentExecutionStage[];
  currentStageIndex: number;
  completionPercentage: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'FAILED';
  generatedAt: string;
}

export interface AgentApprovalRequest {
  requestId: string;
  taskId: string;
  taskTitle: string;
  requestingAgentId: string;
  requestingAgentName: string;
  approverRole: string;
  approvalState: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalRulesApplied: string[];
  decisionNotes?: string;
  decisionTimestamp?: string;
}

export interface AgentApprovalHistoryItem {
  timestamp: string;
  requestId: string;
  taskId: string;
  action: 'REQUESTED' | 'APPROVED' | 'REJECTED';
  actorRole: string;
}

export interface AgentApprovalManagerReport {
  id: string;
  workspaceId: string;
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  requests: AgentApprovalRequest[];
  history: AgentApprovalHistoryItem[];
  generatedAt: string;
}

export interface AgentHandoffRecord {
  handoffId: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  taskId: string;
  taskTitle: string;
  contextDataKeys: string[];
  resultSummary: string;
  validationPassed: boolean;
  timestamp: string;
}

export interface AgentHandoffHistoryItem {
  timestamp: string;
  handoffId: string;
  fromAgentId: string;
  toAgentId: string;
  taskId: string;
  status: 'INITIATED' | 'VALIDATED' | 'COMPLETED' | 'FAILED';
}

export interface AgentHandoffManagerReport {
  id: string;
  workspaceId: string;
  totalHandoffs: number;
  records: AgentHandoffRecord[];
  history: AgentHandoffHistoryItem[];
  generatedAt: string;
}

export interface OrchestrationMonitoringStatus {
  id: string;
  workspaceId: string;
  overallStatus: 'OPTIMAL' | 'DEGRADED' | 'PAUSED' | 'CRITICAL';
  activeAgentTasksCount: number;
  failedBlockedTasksCount: number;
  executionTimeline: AgentTimelineEntry[];
  approvalTimeline: { timestamp: string; requestId: string; state: string }[];
  handoffTimeline: { timestamp: string; handoffId: string; fromAgent: string; toAgent: string }[];
  failedBlockedTasks: { taskId: string; title: string; reason: string; assignedAgent: string }[];
  generatedAt: string;
}

// ============================================
// Prompt 11.1 Workspace & Multi-Tenant Engine Types
// ============================================

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
export type WorkspaceMemberStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
export type WorkspaceStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface WorkspaceSettings {
  allowMemberInvite: boolean;
  maxMembers: number;
  defaultRole: WorkspaceRole;
  defaultProjectDomain?: string;
  enforcementMode: 'STRICT' | 'STANDARD';
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  name: string;
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
  joinedAt: string;
  invitedBy?: string;
}

export interface WorkspaceProfile {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: WorkspaceStatus;
  ownerUserId: string;
  ownerEmail: string;
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveWorkspaceContext {
  workspaceId: string;
  activeProjectId?: string;
  activeUser: {
    userId: string;
    email: string;
    name: string;
    role: WorkspaceRole;
  };
  isIsolated: boolean;
  permissions: string[];
}

export interface TenantIsolationGuardResult {
  workspaceId: string;
  recordId: string;
  isAccessible: boolean;
  isolationPassed: boolean;
  reason?: string;
}

export interface WorkspaceOverviewReport {
  workspace: WorkspaceProfile;
  membersCount: number;
  activeProjectsCount: number;
  activeAgentsCount: number;
  activeTasksCount: number;
  userRole: WorkspaceRole;
  context: ActiveWorkspaceContext;
  members: WorkspaceMember[];
}

// ============================================
// Prompt 11.2 Workspace RBAC, Permission & Access Engine Types
// ============================================

export type WorkspacePermissionCategory =
  | 'WORKSPACE'
  | 'MEMBER'
  | 'PROJECT'
  | 'AGENT'
  | 'TASK'
  | 'CHAT'
  | 'MEMORY'
  | 'KNOWLEDGE'
  | 'INTEGRATIONS'
  | 'TOOLS'
  | 'CODE_ENGINE'
  | 'DEPLOYMENT'
  | 'ACTIVITY_LOGS'
  | 'SETTINGS';

export type WorkspacePermissionKey =
  | 'workspace:manage'
  | 'workspace:view'
  | 'member:invite'
  | 'member:manage'
  | 'member:remove'
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'agent:manage'
  | 'agent:execute'
  | 'task:create'
  | 'task:execute'
  | 'task:approve'
  | 'chat:read'
  | 'chat:write'
  | 'memory:read'
  | 'memory:write'
  | 'knowledge:read'
  | 'knowledge:manage'
  | 'integration:manage'
  | 'tool:execute'
  | 'code:generate'
  | 'code:refactor'
  | 'deployment:trigger'
  | 'deployment:manage'
  | 'logs:read'
  | 'settings:manage';

export interface RBACRoleDefinition {
  role: WorkspaceRole;
  rank: number;
  inheritsFrom?: WorkspaceRole;
  defaultPermissions: WorkspacePermissionKey[];
  description: string;
}

export interface PermissionEvaluationRequest {
  workspaceId: string;
  userId: string;
  permission: WorkspacePermissionKey;
  resourceId?: string;
  resourceWorkspaceId?: string;
}

export interface PermissionEvaluationResult {
  allowed: boolean;
  role: WorkspaceRole;
  permission: WorkspacePermissionKey;
  workspaceId: string;
  reason: string;
  evaluatedAt: string;
}

export interface ResourceAccessGuardRequest {
  workspaceId: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  resourceWorkspaceId: string;
  requiredPermission: WorkspacePermissionKey;
}

export interface ResourceAccessGuardResult {
  granted: boolean;
  resourceType: string;
  resourceId: string;
  workspaceId: string;
  resourceWorkspaceId: string;
  userId: string;
  role: WorkspaceRole;
  denialReason?: string;
  timestamp: string;
}

export type PermissionAuditEventType =
  | 'PERMISSION_CHECK'
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED';

export interface PermissionAuditEvent {
  id: string;
  workspaceId: string;
  userId: string;
  eventType: PermissionAuditEventType;
  role: WorkspaceRole;
  permission?: WorkspacePermissionKey | string;
  resourceType?: string;
  resourceId?: string;
  details: string;
  timestamp: string;
}

export interface PermissionAuditSummary {
  workspaceId: string;
  totalEvents: number;
  totalGranted: number;
  totalDenied: number;
  roleChangesCount: number;
  recentEvents: PermissionAuditEvent[];
  generatedAt: string;
}

// ============================================
// Prompt 11.3 Workspace Resource Governance, Quotas & Usage Control Types
// ============================================

export type WorkspaceResourceType =
  | 'PROJECTS'
  | 'AGENTS'
  | 'TASKS'
  | 'TOOL_EXECUTIONS'
  | 'CODE_EXECUTIONS'
  | 'DEPLOYMENTS'
  | 'KNOWLEDGE_DOCS'
  | 'MEMORY_RECORDS'
  | 'STORAGE_MB'
  | 'ACTIVITY_RECORDS';

export type QuotaStatus = 'NORMAL' | 'WARNING' | 'EXCEEDED' | 'BLOCKED';

export interface ResourceQuotaLimit {
  resourceType: WorkspaceResourceType;
  limit: number;
  warningThresholdPercent: number; // e.g., 80%
  unit: string;
  description: string;
}

export interface WorkspaceGovernancePolicy {
  workspaceId: string;
  limits: Record<WorkspaceResourceType, ResourceQuotaLimit>;
  enforceStrictBlocking: boolean;
  autoAlertOnWarning: boolean;
  usageResetCycle: 'MONTHLY' | 'WEEKLY' | 'NEVER';
  updatedAt: string;
}

export interface WorkspaceResourceUsage {
  resourceType: WorkspaceResourceType;
  currentUsage: number;
  limit: number;
  usagePercent: number;
  status: QuotaStatus;
  lastUpdated: string;
}

export interface QuotaValidationResult {
  allowed: boolean;
  workspaceId: string;
  resourceType: WorkspaceResourceType;
  currentUsage: number;
  limit: number;
  usagePercent: number;
  status: QuotaStatus;
  reason: string;
  evaluatedAt: string;
}

export type UsageAlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface WorkspaceUsageAlert {
  id: string;
  workspaceId: string;
  resourceType: WorkspaceResourceType;
  severity: UsageAlertSeverity;
  usagePercent: number;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface WorkspaceUsageHistoryEntry {
  timestamp: string;
  resourceType: WorkspaceResourceType;
  delta: number;
  newUsage: number;
  triggeredByUserId?: string;
  actionContext?: string;
}

export interface WorkspaceGovernanceOverview {
  workspaceId: string;
  policy: WorkspaceGovernancePolicy;
  resourceUsages: WorkspaceResourceUsage[];
  quotaSummary: {
    totalResourcesTracked: number;
    resourcesInWarning: number;
    resourcesExceeded: number;
    overallStatus: QuotaStatus;
  };
  activeAlerts: WorkspaceUsageAlert[];
  recentHistory: WorkspaceUsageHistoryEntry[];
  generatedAt: string;
}

// ============================================
// Agent Conflict Resolution & Orchestration Types
// ============================================

export interface AgentConflictRecord {
  conflictId: string;
  conflictType: 'RESOURCE' | 'TASK' | 'STATE' | 'GOVERNANCE';
  conflictingEntities: string[];
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVING' | 'RESOLVED' | 'IGNORED';
  resolutionStrategy?: string;
  resolvedAt?: string;
}

export interface AgentConflictResolutionEntry {
  timestamp: string;
  conflictId: string;
  resolution: string;
  actor: string;
}

export interface AgentConflictResolutionReport {
  id: string;
  workspaceId: string;
  totalConflicts: number;
  openConflictsCount: number;
  resolvedConflictsCount: number;
  conflicts: AgentConflictRecord[];
  resolutionHistory: AgentConflictResolutionEntry[];
  generatedAt: string;
}

export interface ExecutiveDashboardReport {
  id: string;
  workspaceId: string;
  overallOrchestrationHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  activeAgentsCount: number;
  activeTasksCount: number;
  approvalStatusSummary: {
    pending: number;
    approved: number;
    rejected: number;
  };
  conflictStatusSummary: {
    open: number;
    resolved: number;
  };
  topPerformingAgents: { agentName: string; scorePercentage: number }[];
  overallExecutionSuccessRate: number;
  executiveSummaryText: string;
  generatedAt: string;
}

export interface AgentPerformanceMetric {
  agentId: string;
  agentName: string;
  tasksCompleted: number;
  successRatePercentage: number;
  avgExecutionTimeMinutes: number;
  delegationAccuracyPercentage: number;
  approvalPassRatePercentage: number;
}

export interface OrchestrationAnalyticsReport {
  id: string;
  workspaceId: string;
  agentPerformance: AgentPerformanceMetric[];
  taskCompletionStats: {
    total: number;
    completed: number;
    inProgress: number;
    failed: number;
  };
  delegationStats: {
    totalDelegated: number;
    autoMatched: number;
    manuallyAssigned: number;
  };
  approvalStats: {
    totalRequested: number;
    autoApproved: number;
    humanApproved: number;
    rejected: number;
  };
  handoffStats: {
    totalHandoffs: number;
    validatedHandoffs: number;
    failedHandoffs: number;
  };
  failureStats: {
    totalFailures: number;
    errorCategories: { category: string; count: number }[];
  };
  executionTrends: { date: string; completedTasks: number; activeAgents: number; errorCount: number }[];
  generatedAt: string;
}

export interface OrchestrationGovernancePolicy {
  policyId: string;
  policyName: string;
  agentCategory: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  allowedActions: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface OrchestrationGovernanceReport {
  id: string;
  workspaceId: string;
  policies: OrchestrationGovernancePolicy[];
  overallGovernanceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
  riskClassifications: {
    taskId: string;
    taskTitle: string;
    riskLevel: string;
    requiresApproval: boolean;
  }[];
  validationPassed: boolean;
  generatedAt: string;
}

// ============================================
// Phase 14: Autonomous Multi-Agent Workflow Engine Types
// ============================================

export type WorkflowStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'WAITING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type WorkflowStepStatus =
  | 'PENDING'
  | 'READY'
  | 'RUNNING'
  | 'WAITING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'CANCELLED';

export type AgentRole =
  | 'CEO_AGENT'
  | 'PLANNER_AGENT'
  | 'RESEARCH_AGENT'
  | 'DESIGN_AGENT'
  | 'CODING_AGENT'
  | 'DATABASE_AGENT'
  | 'TESTING_AGENT'
  | 'DEBUG_AGENT'
  | 'DEPLOYMENT_AGENT'
  | 'REVIEW_AGENT'
  | string;

export interface WorkflowRetryPolicy {
  maxAttempts: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  retryableErrors: string[];
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  agentId: string;
  name: string;
  description: string;
  status: WorkflowStepStatus;
  dependencies: string[];
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  toolId?: string;
  toolInput?: Record<string, unknown>;
  approvalRequired?: boolean;
  dangerLevel?: string;
  retryPolicy?: WorkflowRetryPolicy;
  timeout?: number;
  requiredCapabilities: string[];
}

export interface Workflow {
  id: string;
  workspaceId: string;
  projectId?: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workspaceId: string;
  userId: string;
  status: WorkflowStatus;
  currentStepId?: string;
  completedSteps: string[];
  failedSteps: string[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AgentAssignment {
  agentId: string;
  role: AgentRole;
  matchedCapabilities: string[];
  assignedAt: string;
  confidenceScore?: number;
  workspaceId: string;
}

export interface WorkflowDependency {
  stepId: string;
  dependsOnStepId: string;
  requiredStatus?: WorkflowStepStatus;
}

export interface WorkflowState {
  workflowId: string;
  workspaceId: string;
  userId: string;
  executionId: string;
  currentStepId?: string;
  completedSteps: string[];
  failedSteps: string[];
  artifacts: Record<string, unknown>;
  variables: Record<string, unknown>;
  agentOutputs: Record<string, unknown>;
  toolResults: Record<string, unknown>;
  errors: Array<{ stepId: string; message: string; timestamp: string }>;
  timestamps: {
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
  };
}

export type WorkflowEventType =
  | 'WORKFLOW_CREATED'
  | 'WORKFLOW_PLANNED'
  | 'WORKFLOW_STARTED'
  | 'STEP_READY'
  | 'STEP_BLOCKED'
  | 'STEP_STARTED'
  | 'STEP_WAITING'
  | 'STEP_COMPLETED'
  | 'STEP_FAILED'
  | 'STEP_RETRYING'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_DENIED'
  | 'WORKFLOW_PAUSED'
  | 'WORKFLOW_RESUMED'
  | 'WORKFLOW_COMPLETED'
  | 'WORKFLOW_FAILED'
  | 'WORKFLOW_CANCELLED';

export interface WorkflowResult {
  workflowId: string;
  executionId: string;
  success: boolean;
  status: WorkflowStatus;
  outputs: Record<string, unknown>;
  completedStepsCount: number;
  failedStepsCount: number;
  durationMs: number;
  error?: string;
}

// ============================================
// Phase 14.3: Dynamic AI Workflow Planner & Replanning Engine Types
// ============================================

export type WorkflowProjectType =
  | 'WEBSITE'
  | 'ECOMMERCE'
  | 'SAAS_DASHBOARD'
  | 'ADMIN_PANEL'
  | 'PORTFOLIO'
  | 'AI_APPLICATION'
  | 'FULLSTACK_APP'
  | 'DATABASE_MIGRATION'
  | 'API_BACKEND'
  | 'GENERIC_TASK';

export interface WorkflowRequirement {
  objective: string;
  projectType: WorkflowProjectType | string;
  features: string[];
  integrations: string[];
  databaseRequirements?: {
    type: 'firestore' | 'supabase' | 'postgres' | 'none' | string;
    isRequired: boolean;
    schemaHints?: string[];
  };
  authenticationRequirements?: {
    provider: 'firebase' | 'supabase' | 'custom' | 'none' | string;
    isRequired: boolean;
  };
  storageRequirements?: {
    provider: 'firebase' | 'supabase' | 's3' | 'none' | string;
    isRequired: boolean;
  };
  deploymentTarget?: {
    provider: 'vercel' | 'cloud_run' | 'github_pages' | 'custom' | 'none' | string;
    isRequired: boolean;
  };
  testingRequirements: {
    unitTests: boolean;
    linting: boolean;
    typeChecking: boolean;
    buildCheck: boolean;
  };
  securityRequirements: {
    rbac: boolean;
    secretRedaction: boolean;
    approvalGates: boolean;
  };
  userConstraints: string[];
}

export interface WorkflowCapabilityRequirement {
  capability: string;
  category: string;
  provider?: string;
  isAvailable: boolean;
  resolvedToolId?: string;
  riskLevel: string;
  requiresApproval: boolean;
}

export interface WorkflowPlannedStep {
  id: string;
  name: string;
  description: string;
  agentRole: AgentRole;
  assignedAgentId: string;
  toolId?: string;
  toolInput?: Record<string, unknown>;
  input: Record<string, unknown>;
  dependencies: string[];
  requiredCapabilities: string[];
  dangerLevel?: string;
  approvalRequired: boolean;
  parallelGroup?: string;
}

export interface WorkflowPlanningDecision {
  decisionId: string;
  category: string;
  rationale: string;
  tradeoffs?: string[];
  selectedOption: string;
}

export interface WorkflowPlanningRequest {
  workflowId?: string;
  objective?: string;
  prompt?: string;
  workspaceId: string;
  userId: string;
  userRole?: WorkspaceRole | UserRole;
  projectId?: string;
  name?: string;
  description?: string;
  constraints?: string[];
  preferences?: {
    database?: string;
    auth?: string;
    deployment?: string;
    uiFramework?: string;
    [key: string]: unknown;
  };
}

export type WorkflowPlanningStatus =
  | 'SUCCESS'
  | 'CAPABILITY_UNAVAILABLE'
  | 'AGENT_UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_GRAPH'
  | 'FAILED';

export interface WorkflowPlan {
  workflowId: string;
  workspaceId: string;
  objective: string;
  requirements: WorkflowRequirement;
  plannedSteps: WorkflowPlannedStep[];
  dependencies: Array<{ stepId: string; dependsOnStepId: string }>;
  assignedAgents: AgentAssignment[];
  selectedTools: string[];
  parallelGroups: Array<{ groupId: string; stepIds: string[] }>;
  approvalRequiredSteps: string[];
  estimatedExecutionInfo: {
    estimatedDurationMs: number;
    totalSteps: number;
    estimatedQuotaUsage: Record<string, number>;
  };
  planningStatus: WorkflowPlanningStatus;
  missingCapabilities?: string[];
  decisions: WorkflowPlanningDecision[];
  workflow: Workflow;
  failurePredictionReport?: WorkflowFailurePredictionReport;
  strategyComparison?: StrategyComparisonResult;
  agentTeam?: AgentTeam;
  confidenceAssessment?: ConfidenceAssessment;
  optimizedDAGDetails?: {
    stepsOptimizedCount: number;
    parallelBranchesCount: number;
    redundantStepsRemoved: number;
  };
}

export type ReplanningTriggerReason =
  | 'TOOL_FAILURE'
  | 'AGENT_FAILURE'
  | 'CAPABILITY_UNAVAILABLE'
  | 'DEPLOYMENT_FAILURE'
  | 'TEST_FAILURE'
  | 'VALIDATION_FAILURE'
  | 'QUOTA_EXCEEDED'
  | 'APPROVAL_DENIED';

export interface WorkflowReplanningRequest {
  workflow: Workflow;
  executionState?: WorkflowState;
  failedStepId: string;
  failureReason: string;
  failureCategory: ReplanningTriggerReason;
  workspaceId: string;
  userId: string;
  userRole?: WorkspaceRole | UserRole;
}

export interface WorkflowReplanningResult {
  success: boolean;
  originalWorkflowId: string;
  replannedWorkflow: Workflow;
  changesSummary: string[];
  strategyUsed: string;
  plan?: WorkflowPlan;
  error?: string;
}

// ============================================
// Phase 14.3.2: Multi-Agent Collaboration & Context Handoff Types
// ============================================

export type AgentMessageType =
  | 'REQUEST'
  | 'RESPONSE'
  | 'HANDOFF'
  | 'STATUS'
  | 'RESULT'
  | 'ERROR'
  | 'REVIEW_REQUEST'
  | 'REVIEW_RESPONSE'
  | 'APPROVAL_REQUEST'
  | 'APPROVAL_RESPONSE'
  | 'REPLAN_REQUEST';

export interface AgentMessage {
  id: string;
  workspaceId: string;
  workflowId: string;
  stepId?: string;
  sessionId: string;
  fromAgentId: string;
  fromAgentRole: AgentRole;
  toAgentId?: string;
  toAgentRole?: AgentRole;
  messageType: AgentMessageType;
  content: string;
  payload?: Record<string, unknown>;
  contextRef?: string;
  artifactIds?: string[];
  correlationId: string;
  parentMessageId?: string;
  timestamp: string;
}

export type AgentArtifactType =
  | 'SOURCE_CODE'
  | 'SCHEMA_MIGRATION'
  | 'TEST_REPORT'
  | 'BUILD_ARTIFACT'
  | 'DEPLOYMENT_METADATA'
  | 'GITHUB_COMMIT'
  | 'LIVE_URL'
  | 'CONFIG'
  | 'LOG'
  | 'PATCH'
  | 'ARCHITECTURE_SPEC'
  | string;

export interface AgentArtifact {
  artifactId: string;
  workspaceId: string;
  workflowId: string;
  stepId: string;
  producerAgent: string;
  producerRole: AgentRole;
  type: AgentArtifactType;
  name: string;
  description?: string;
  uri?: string;
  data?: Record<string, unknown>;
  checksum?: string;
  version?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AgentTaskContext {
  contextId: string;
  workspaceId: string;
  workflowId: string;
  version: number;
  snapshotId: string;
  sharedState: Record<string, unknown>;
  predecessorOutputs: Record<string, unknown>;
  artifacts: AgentArtifact[];
  lastUpdatedBy: string;
  updatedAt: string;
}

export type AgentHandoffStatus =
  | 'PENDING_VALIDATION'
  | 'VALIDATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED';

export interface AgentHandoff {
  handoffId: string;
  workspaceId: string;
  workflowId: string;
  fromStepId: string;
  toStepId: string;
  fromAgentId: string;
  fromAgentRole: AgentRole;
  toAgentId: string;
  toAgentRole: AgentRole;
  status: AgentHandoffStatus;
  contextId: string;
  requiredArtifactIds: string[];
  validationErrors: string[];
  requiresApproval: boolean;
  approvedBy?: string;
  approvalDecision?: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  resultSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCollaborationSession {
  sessionId: string;
  workspaceId: string;
  workflowId: string;
  activeAgentIds: string[];
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'TERMINATED';
  messagesCount: number;
  latestContextVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecutionContext {
  workspaceId: string;
  workflowId: string;
  stepId: string;
  agentId: string;
  role: AgentRole;
  taskContext: AgentTaskContext;
  availableTools: string[];
  grantedPermissions: string[];
}

export interface AgentDependency {
  stepId: string;
  dependsOnStepId: string;
  requiredArtifacts?: string[];
  satisfactionStatus: 'SATISFIED' | 'PENDING' | 'FAILED';
}

export type AgentDecisionAction =
  | 'RETRY'
  | 'REPLAN'
  | 'HANDOFF'
  | 'APPROVAL'
  | 'ABORT'
  | 'CONTINUE';

export interface AgentDecision {
  decisionId: string;
  workspaceId: string;
  workflowId: string;
  agentId: string;
  role: AgentRole;
  action: AgentDecisionAction;
  summary: string;
  rationale: string;
  confidence: number;
  timestamp: string;
}

export type AgentCollaborationEventType =
  | 'MESSAGE_SENT'
  | 'HANDOFF_REQUESTED'
  | 'HANDOFF_VALIDATED'
  | 'HANDOFF_APPROVED'
  | 'HANDOFF_REJECTED'
  | 'HANDOFF_EXECUTED'
  | 'CONTEXT_UPDATED'
  | 'REVIEW_REQUESTED'
  | 'REVIEW_COMPLETED'
  | 'DECISION_MADE';

export interface AgentCollaborationEvent {
  eventId: string;
  workspaceId: string;
  workflowId: string;
  sessionId: string;
  eventType: AgentCollaborationEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

export type AgentReviewState =
  | 'WAITING_REVIEW'
  | 'REVIEWING'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export interface AgentReviewRequest {
  reviewId: string;
  workspaceId: string;
  workflowId: string;
  targetStepId: string;
  reviewingAgentRole: AgentRole;
  reviewingAgentId: string;
  requestedByAgentRole: AgentRole;
  requestedByAgentId: string;
  status: AgentReviewState;
  artifactsToReview: string[];
  reviewNotes?: string;
  feedback?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Phase 14.3.3: Multi-Agent Long-Term Memory & Learning
// ==========================================

export type ExperienceEventType =
  | 'WORKFLOW_SUCCESS'
  | 'WORKFLOW_FAILURE'
  | 'TOOL_SUCCESS'
  | 'TOOL_FAILURE'
  | 'TOOL_EXECUTION'
  | 'STEP_EXECUTION'
  | 'DEPLOYMENT_SUCCESS'
  | 'DEPLOYMENT_FAILURE'
  | 'DEBUG_FIX'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'CEO_DECISION'
  | 'HUMAN_APPROVAL'
  | 'HUMAN_REJECTION'
  | 'AGENT_HANDOFF'
  | 'PERFORMANCE_METRIC';

export interface AgentExperienceRecord {
  id: string;
  workspaceId: string;
  workflowId?: string;
  projectId?: string;
  agentId?: string;
  agentRole?: AgentRole;
  stepId?: string;
  eventType: ExperienceEventType;
  inputSummary: string;
  actionSummary: string;
  resultSummary: string;
  success: boolean;
  errorCategory?: string;
  resolution?: string;
  confidence: number;
  tags: string[];
  embedding?: number[];
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface ExperienceQueryFilter {
  workspaceId: string;
  query?: string;
  eventType?: ExperienceEventType;
  agentRole?: AgentRole;
  successOnly?: boolean;
  errorCategory?: string;
  tags?: string[];
  minConfidence?: number;
  limit?: number;
}

export interface ExperienceSearchResult {
  experience: AgentExperienceRecord;
  similarity: number;
  score: number;
  matchReason: string;
}

export interface AgentExperienceRecommendation {
  query: string;
  similarExperiences: AgentExperienceRecord[];
  successfulStrategies: string[];
  failedStrategies: string[];
  knownErrors: string[];
  recommendedActions: string[];
  confidenceScore: number;
  relevanceScore: number;
  toolReliabilityNotice?: string;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  workspaceId: string;
  role: AgentRole;
  tasksCompleted: number;
  tasksFailed: number;
  successRate: number;
  avgExecutionTimeMs: number;
  reviewApprovalRate: number;
  handoffSuccessRate: number;
  selfHealingSuccessRate: number;
  totalTokensUsed: number;
  lastActiveAt: string;
  updatedAt: string;
}

export type ToolProviderType =
  | 'GITHUB'
  | 'VERCEL'
  | 'FIREBASE'
  | 'SUPABASE'
  | 'GOOGLE'
  | 'ANTHROPIC'
  | 'OPENAI'
  | 'OPENROUTER'
  | 'MCP_TOOLS'
  | 'CUSTOM';

export interface ToolReliabilityRecord {
  id: string;
  workspaceId: string;
  provider: ToolProviderType;
  toolId: string;
  toolName: string;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgLatencyMs: number;
  recentHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE';
  failureCategories: Record<string, number>;
  workspaceSpecificFailures: Record<string, number>;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  updatedAt: string;
}

export interface ToolReliabilityReport {
  workspaceId: string;
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  providerMetrics: Record<ToolProviderType, {
    totalCalls: number;
    successRate: number;
    avgLatencyMs: number;
    health: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE';
  }>;
  topFailingTools: Array<{ toolId: string; failureRate: number; failureCount: number }>;
  generatedAt: string;
}

export interface LearningScoreBreakdown {
  experienceId: string;
  baseScore: number;
  recencyWeight: number;
  similarityWeight: number;
  agentPerformanceWeight: number;
  toolReliabilityWeight: number;
  humanApprovalBonus: number;
  finalScore: number;
}

// ==========================================
// Phase 14.3.4: Advanced Multi-Agent Intelligence & Decision Optimization
// ==========================================

export interface AgentCandidateScoreBreakdown {
  capabilityScore: number;
  roleMatchScore: number;
  historicalSuccessRate: number;
  performanceScore: number;
  workloadScore: number;
  latencyScore: number;
  reliabilityScore: number;
  experienceRelevanceScore: number;
  riskAdjustment: number;
  quotaScore: number;
}

export interface AgentCandidateRanking {
  agentId: string;
  role: AgentRole;
  score: number; // 0.0 to 1.0
  breakdown: AgentCandidateScoreBreakdown;
  confidence: number;
  reasons: string[];
  isEligible: boolean;
  rejectionReason?: string;
}

export interface AgentRankingResult {
  workspaceId: string;
  role: AgentRole;
  requiredCapabilities: string[];
  candidates: AgentCandidateRanking[];
  selectedAgent: AgentCandidateRanking;
  generatedAt: string;
}

export interface AgentTeamMember {
  agentId: string;
  role: AgentRole;
  assignedSteps: string[];
  dependencies: string[];
  capabilities: string[];
  status: 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface AgentTeam {
  teamId: string;
  workspaceId: string;
  workflowId?: string;
  name: string;
  members: AgentTeamMember[];
  hierarchy: Array<{ parentRole: AgentRole; childRoles: AgentRole[] }>;
  parallelBranches: string[][];
  status: 'FORMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  quotaApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTeamFormationRequest {
  workspaceId: string;
  workflowId?: string;
  name?: string;
  requiredRoles?: AgentRole[];
  steps?: WorkflowPlannedStep[];
  userId?: string;
}

export interface AgentTeamFormationResult {
  team: AgentTeam;
  success: boolean;
  memberCount: number;
  parallelBranchesCount: number;
  error?: string;
}

export type ExecutionStrategyType =
  | 'FAST_PROTOTYPE'
  | 'STANDARD_MODULAR'
  | 'ENTERPRISE_ROBUST'
  | 'SERVERLESS_FIREBASE'
  | 'FULLSTACK_SUPABASE'
  | 'CUSTOM_PIPELINE';

export interface StrategyCostEstimate {
  tokenCost: number;
  toolCalls: number;
  agentExecutions: number;
  estimatedTimeMs: number;
}

export interface WorkflowStrategy {
  strategyId: string;
  strategyType: ExecutionStrategyType;
  name: string;
  description: string;
  expectedSuccessProbability: number; // 0.0 to 1.0
  estimatedExecutionTimeMs: number;
  estimatedCost: StrategyCostEstimate;
  riskScore: number; // 0.0 to 1.0 (lower is safer)
  reliabilityScore: number; // 0.0 to 1.0
  previousExperienceScore: number; // 0.0 to 1.0
  complexityScore: number; // 0.0 to 1.0
  weightedDecisionScore: number; // 0.0 to 1.0
  pros: string[];
  cons: string[];
  suggestedTools: string[];
  steps: WorkflowPlannedStep[];
}

export interface StrategyScoringWeights {
  successProbabilityWeight: number;
  reliabilityWeight: number;
  experienceWeight: number;
  riskInversionWeight: number;
  costInversionWeight: number;
  timeInversionWeight: number;
}

export interface StrategyComparisonResult {
  workspaceId: string;
  workflowId?: string;
  strategies: WorkflowStrategy[];
  selectedStrategyId: string;
  selectedStrategy: WorkflowStrategy;
  selectionRationale: string;
  confidence: number;
  confidenceFactors: Record<string, number>;
  evaluatedAt: string;
}

export interface PreventiveActionRecommendation {
  actionId: string;
  action: string;
  riskMitigated: string;
  confidence: number;
  automatedFixAvailable: boolean;
}

export interface FailurePrediction {
  stepId?: string;
  stepName?: string;
  toolId?: string;
  agentRole?: AgentRole;
  predictedRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  possibleFailureReasons: string[];
  recommendedPreventiveActions: string[];
  preventiveActionDetails?: PreventiveActionRecommendation[];
  historicalFailureCount: number;
  providerHealthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  preExecutionChecks: Array<{ checkName: string; required: boolean; description: string }>;
}

export interface WorkflowFailurePredictionReport {
  workspaceId: string;
  workflowId?: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  stepPredictions: FailurePrediction[];
  highRiskStepCount: number;
  preventiveActionsRequired: string[];
  generatedAt: string;
}

export interface AgentReviewRound {
  roundNumber: number;
  agentRole: AgentRole;
  agentId: string;
  perspective: 'STRATEGY' | 'RISK_ASSESSMENT' | 'SECURITY' | 'EXECUTIVE_DECISION';
  evaluation: 'APPROVED' | 'OBJECTED' | 'MODIFIED';
  objections: string[];
  suggestedModifications: string[];
  confidence: number;
  supportingExperienceIds?: string[];
  timestamp: string;
}

export interface MultiAgentDecisionReview {
  reviewId: string;
  workspaceId: string;
  workflowId?: string;
  decisionTopic: string;
  primaryProposal: {
    strategyId: string;
    strategyType: ExecutionStrategyType;
    summary: string;
    proposedByRole: AgentRole;
    proposedByAgentId: string;
  };
  rounds: AgentReviewRound[];
  ceoDecision: {
    decision: 'APPROVE_STRATEGY' | 'MODIFY_STRATEGY' | 'REJECT_STRATEGY' | 'REQUEST_HUMAN_APPROVAL';
    confidence: number;
    rationale: string;
    finalStrategyId: string;
    strategicDirective: string;
  };
  completedAt: string;
}

export interface ConfidenceFactors {
  experienceSimilarity: number;
  historicalSuccessRate: number;
  toolReliability: number;
  agentPerformance: number;
  strategyAgreement: number;
  failurePredictionCertainty: number;
  dataCompleteness: number;
}

export interface ConfidenceAssessment {
  overallConfidence: number; // 0.0 to 1.0
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidenceCount: number;
  confidenceFactors: ConfidenceFactors;
  requiresAdditionalReview: boolean;
  requiresHumanApproval: boolean;
  explanation: string;
}

// ==========================================
// Phase 14.3.5: Autonomous Reliability, Recovery & Observability
// ==========================================

export type CheckpointTransitionEvent =
  | 'PENDING'
  | 'READY'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'PAUSED'
  | 'RETRYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'WORKFLOW_STARTED'
  | 'WORKFLOW_COMPLETED'
  | 'WORKFLOW_FAILED'
  | 'STEP_STARTED'
  | 'STEP_COMPLETED'
  | 'STEP_FAILED'
  | 'REPLAN_TRIGGERED'
  | 'RECOVERY_RESUMED';

export interface WorkflowStepCheckpointState {
  stepId: string;
  name?: string;
  status: WorkflowStepStatus;
  dependencies?: string[];
  output?: Record<string, unknown>;
  toolResult?: Record<string, unknown>;
  attempts?: number;
  retryCount?: number;
  agentId?: string;
  agentRole?: AgentRole;
  completedAt?: string;
  error?: string;
}

export interface WorkflowCheckpoint {
  id: string;
  workflowId: string;
  workspaceId: string;
  executionId: string;
  transitionEvent: CheckpointTransitionEvent;
  stepId?: string;
  status: WorkflowStatus;
  stepStates: Record<string, WorkflowStepCheckpointState>;
  variables: Record<string, unknown>;
  agentOutputs: Record<string, unknown>;
  toolResults: Record<string, unknown>;
  artifacts: Record<string, unknown>;
  pendingApprovals: string[];
  activeAgentAssignments: Record<string, { agentId: string; role: AgentRole }>;
  retryCounters: Record<string, number>;
  replanCount: number;
  repairAttemptsCount: number;
  checksum: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type IdempotencyStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface IdempotencyRecord {
  id: string;
  workspaceId: string;
  workflowExecutionId: string;
  stepExecutionId: string;
  idempotencyKey: string;
  correlationId: string;
  operationType:
    | 'GITHUB_COMMIT'
    | 'GITHUB_PR'
    | 'VERCEL_DEPLOYMENT'
    | 'FIREBASE_WRITE'
    | 'SUPABASE_MIGRATION'
    | 'GOOGLE_FILE_CREATE'
    | 'GOOGLE_GMAIL_SEND'
    | 'GOOGLE_CALENDAR_EVENT'
    | 'FILE_SYSTEM_WRITE'
    | 'GENERIC_TOOL_EXECUTION'
    | 'TOOL_EXECUTION';
  targetResource?: string;
  requestPayloadHash: string;
  status: IdempotencyStatus;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerRecord {
  id: string;
  workspaceId: string;
  provider: string;
  toolId?: string;
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  consecutiveFailures: number;
  lastFailureAt?: string;
  lastSuccessAt?: string;
  nextRetryAllowedAt?: string;
  cooldownPeriodMs: number;
  failureThreshold: number;
  updatedAt: string;
}

export type TimeoutCategory = 'SOFT_TIMEOUT' | 'HARD_TIMEOUT' | 'PROVIDER_TIMEOUT' | 'WORKFLOW_TIMEOUT';

export interface TimeoutConfig {
  agentExecutionMs: number;
  toolExecutionMs: number;
  stepExecutionMs: number;
  workflowExecutionMs: number;
  providerApiMs: number;
  deploymentVerificationMs: number;
}

export type AutonomousErrorCategory =
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'TOOL_ERROR'
  | 'DATABASE_ERROR'
  | 'BUILD_ERROR'
  | 'TEST_FAILURE'
  | 'DEPLOYMENT_FAILURE'
  | 'UNKNOWN_ERROR';

export type AutonomousRecoveryStrategy =
  | 'RETRY_WITH_BACKOFF'
  | 'FALLBACK_TOOL'
  | 'REPLAN_WORKFLOW'
  | 'REQUEST_CREDENTIALS'
  | 'REQUEST_HUMAN_APPROVAL'
  | 'ABORT_SAFE';

export interface ErrorClassification {
  category: AutonomousErrorCategory;
  isRetryable: boolean;
  recommendedStrategy: AutonomousRecoveryStrategy;
  reason: string;
  suggestedDelayMs: number;
  retryAfterSeconds?: number;
  confidence: number;
}

export interface SelfHealingSafetyLimits {
  maxRepairAttempts: number;
  maxReplans: number;
  maxTotalExecutionTimeMs: number;
  maxToolCalls: number;
  maxAgentExecutions: number;
}

export interface DeadlockUnresolvedDependency {
  stepId: string;
  waitingOn: string;
  waitingOnStatus: string;
}

export interface DeadlockDiagnosticReport {
  isDeadlocked: boolean;
  reason: string;
  blockedSteps: string[];
  cycleDetected: boolean;
  missingCapabilities: string[];
  unresolvedDependencies: DeadlockUnresolvedDependency[];
  recommendedAction: string;
}

export interface HeartbeatRecord {
  id: string;
  workspaceId: string;
  workflowId: string;
  executionId: string;
  entityType: 'WORKFLOW' | 'STEP' | 'AGENT' | 'TOOL';
  entityId: string;
  status: string;
  lastHeartbeatAt: string;
  metadata?: Record<string, unknown>;
}

export interface OrphanRecoveryReport {
  workspaceId: string;
  recoveredExecutionsCount: number;
  recoveredStepsCount: number;
  actionsTaken: string[];
  diagnostics: Array<{ executionId: string; reason: string; action: string }>;
}

export interface ExecutionTraceSpan {
  spanId: string;
  name: string;
  entityType: 'WORKFLOW' | 'PLANNER' | 'AGENT' | 'STEP' | 'TOOL' | 'PROVIDER' | 'RECOVERY';
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  error?: string;
  metadata?: Record<string, unknown>;
  children?: ExecutionTraceSpan[];
}

export interface AutonomousExecutionMetrics {
  workspaceId: string;
  workflowSuccessRate: number;
  meanExecutionTimeMs: number;
  p95ExecutionTimeMs: number;
  meanRecoveryTimeMs: number;
  retryRate: number;
  replanRate: number;
  failureRate: number;
  providerFailureRate: Record<string, number>;
  agentFailureRate: Record<string, number>;
  deploymentSuccessRate: number;
  totalExecutions: number;
  totalRecoveries: number;
}

export interface RecoveryAuditRecord {
  id: string;
  workspaceId: string;
  workflowId: string;
  executionId: string;
  stepId?: string;
  eventType:
    | 'CRASH_DETECTED'
    | 'CHECKPOINT_LOADED'
    | 'CHECKPOINT_RESTORED'
    | 'STATE_RECONCILED'
    | 'RESUME_INITIATED'
    | 'STEP_DEDUPLICATED'
    | 'DEADLOCK_RESOLVED'
    | 'CIRCUIT_TRIPPED'
    | 'LIMIT_REACHED'
    | 'INTEGRITY_CHECK_FAILED';
  failureCategory?: AutonomousErrorCategory;
  recoveryAction: string;
  attemptNumber: number;
  actor: string;
  agent?: string;
  result: 'SUCCESS' | 'FAILED';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowRecoveryResult {
  workflowId: string;
  executionId: string;
  workspaceId: string;
  checkpointLoaded: boolean;
  integrityValid: boolean;
  alreadyCompletedSteps: string[];
  resumedSteps: string[];
  status: WorkflowStatus;
  actionsTaken: string[];
  workflowResult?: WorkflowResult;
  error?: string;
}
