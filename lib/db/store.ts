import {
  Project,
  CodeProjectRecord,
  GeneratedFolderRecord,
  GeneratedFileRecord,
  CodePatchRecord,
  CodeDiffRecord,
  FileHistoryRecord,
  RollbackHistoryRecord,
  RefactorLogRecord,
  CodeConflictIssue,
  ProjectMemoryItem,
  SupportedLanguage,
  SupportedFramework,
  AuditEvent,
  ApprovalRequest,
  ToolExecutionContext,
  ExecutionHistoryItem,
  ExecutionMetrics,
  ToolExecution,
  ExecutionProgressReport,
  ExecutionResult,
  PluginRegistryItem,
  ExecutionPlan,
  FormattedExecutionResult,
  GitHubConnection,
  GitHubOAuthSession,
  GitHubRepositoryMetadata,
  GitBranchInfo,
  CommitPlan,
  GitChangeAnalysis,
  PullRequestPlan,
  GitHubActionsPlan,
  ReleasePlan,
  RepoSecurityAnalysis,
  RepoExplorerOverview,
  BranchOperationPlan,
  GitHubActivityTimeline,
  WorkspaceSearchResult,
  VercelDeploymentPlan,
  VercelEnvironmentConfig,
  VercelProjectConfigAnalysis,
  VercelDeploymentReadinessReport,
  VercelPipelinePlan,
  VercelBuildValidationReport,
  VercelDeploymentRiskAnalysis,
  VercelRollbackPlan,
  VercelDeploymentHistoryEntry,
  VercelDeploymentLog,
  VercelDeploymentMonitoringMetrics,
  VercelDeploymentInsights,
  VercelDeploymentApprovalRecord,
  VercelDeploymentPolicyCompliance,
  VercelDeploymentRecoveryPlan,
  VercelDeploymentExecutiveDashboard,
  FirebaseProjectSummary,
  FirebaseAuthReadinessReport,
  FirestorePlannerReport,
  FirebaseStoragePlannerReport,
  FirestoreCollectionManagerReport,
  FirestoreRulesManagerReport,
  FirebaseAuthManagerReport,
  FirebaseSecurityDashboardReport,
  FirebaseActivityManagerReport,
  FirebaseMonitoringEngineReport,
  FirebaseAnalyticsEngineReport,
  FirebaseConfigurationManagerReport,
  FirebaseBackupRecoveryPlan,
  FirebaseComplianceReport,
  FirebaseExecutiveDashboardReport,
  MemoryManagerReport,
  KnowledgeManagerReport,
  MemoryClassificationReport,
  MemorySearchReport,
  ContextRetrievalReport,
  KnowledgeIndexReport,
  MemoryAnalyticsReport,
  KnowledgeRelationshipReport,
  ContextIntelligenceReport,
  MemoryExecutiveInsightsReport,
  MemoryLifecycleReport,
  KnowledgeGovernanceReport,
  MemoryMasterExecutiveDashboardReport,
  DocumentWorkspaceReport,
  DocumentIntelligenceReport,
  RetrievalWorkspaceReport,
  RAGExecutiveMasterReport,
  MultiAgentOrchestrationMasterReport,
  AgentTaskPlannerReport,
  AgentDelegationReport,
  AgentCoordinationPlan,
  AgentExecutionCoordinatorReport,
  AgentApprovalManagerReport,
  AgentHandoffManagerReport,
  OrchestrationMonitoringStatus,
  WorkspaceProfile,
  WorkspaceMember,
  WorkspaceRole,
  ActiveWorkspaceContext,
  PermissionAuditEvent,
  PermissionAuditSummary,
  WorkspaceGovernancePolicy,
  WorkspaceResourceType,
  WorkspaceUsageAlert,
  WorkspaceUsageHistoryEntry,
  AgentConflictResolutionReport,
  ExecutiveDashboardReport,
  OrchestrationAnalyticsReport,
  OrchestrationGovernanceReport
} from '@/packages/types/src';

export interface WorkspaceRecord {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
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

export interface AIUsageRecord {
  projectId: string;
  totalTokens: number;
  totalRequests: number;
  totalLatencyMs: number;
  estimatedCostUsd: number;
}

export interface ProjectTaskRecord {
  id: string;
  projectId: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

export interface ProjectLogRecord {
  id: string;
  projectId: string;
  level: string;
  module: string;
  message: string;
  timestamp: string;
}

export interface WorkspaceActivityRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  eventType: string;
  title: string;
  description?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface WorkflowRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  conversationId: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface WorkflowEventRecord {
  id: string;
  workflowId: string;
  title: string;
  details: string;
  timestamp: string;
}

export class PlatformDatabaseStore {
  private workspaces = new Map<string, WorkspaceRecord>();
  private projects = new Map<string, Project>();
  private codeProjects = new Map<string, CodeProjectRecord>();
  private folders = new Map<string, GeneratedFolderRecord>();
  private files = new Map<string, GeneratedFileRecord>();
  private patches = new Map<string, CodePatchRecord>();
  private diffs = new Map<string, CodeDiffRecord>();
  private fileHistory = new Map<string, FileHistoryRecord[]>();
  private rollbackHistory = new Map<string, RollbackHistoryRecord>();
  private refactorLogs = new Map<string, RefactorLogRecord>();
  private conflictIssues = new Map<string, CodeConflictIssue>();

  private aiSessions = new Map<string, AISessionRecord>();
  private aiStates = new Map<string, string>();
  private aiUsages = new Map<string, AIUsageRecord>();
  private tasks = new Map<string, ProjectTaskRecord[]>();
  private logs = new Map<string, ProjectLogRecord[]>();
  private activities: WorkspaceActivityRecord[] = [];
  private workflows = new Map<string, WorkflowRecord>();
  private workflowEvents = new Map<string, WorkflowEventRecord[]>();
  private modelActionLogs: { model: string; action: string; status: string; details: string; timestamp: string }[] = [];
  private chatMessages = new Map<string, { id: string; sender: string; name: string; text: string; timestamp: string }[]>();
  private memories = new Map<string, ProjectMemoryItem[]>();
  private approvalRequests = new Map<string, ApprovalRequest>();
  private toolExecutionContexts = new Map<string, ToolExecutionContext>();
  private executionHistory: ExecutionHistoryItem[] = [];
  private toolExecutions = new Map<string, ToolExecution>();
  private executionMetrics = new Map<string, ExecutionMetrics>();
  private plugins = new Map<string, PluginRegistryItem>();
  private executionPlans = new Map<string, ExecutionPlan>();
  private formattedResults = new Map<string, FormattedExecutionResult>();
  private githubConnections = new Map<string, GitHubConnection>();
  private githubOAuthSessions = new Map<string, GitHubOAuthSession>();
  private githubRepoMetadata = new Map<string, GitHubRepositoryMetadata>();
  private gitBranches = new Map<string, GitBranchInfo[]>(); // repoFullName -> branches
  private commitPlans = new Map<string, CommitPlan>();
  private gitChangeAnalyses = new Map<string, GitChangeAnalysis>();
  private pullRequestPlans = new Map<string, PullRequestPlan>();
  private githubActionsPlans = new Map<string, GitHubActionsPlan>();
  private releasePlans = new Map<string, ReleasePlan>();
  private repoSecurityAnalyses = new Map<string, RepoSecurityAnalysis>();
  private repoExplorerOverviews = new Map<string, RepoExplorerOverview>();
  private branchOperationPlans = new Map<string, BranchOperationPlan>();
  private githubActivityTimelines = new Map<string, GitHubActivityTimeline>();
  private vercelDeploymentPlans = new Map<string, VercelDeploymentPlan>();
  private vercelEnvironmentConfigs = new Map<string, VercelEnvironmentConfig>();
  private vercelProjectConfigAnalyses = new Map<string, VercelProjectConfigAnalysis>();
  private vercelDeploymentReadinessReports = new Map<string, VercelDeploymentReadinessReport>();
  private vercelPipelinePlans = new Map<string, VercelPipelinePlan>();
  private vercelBuildValidationReports = new Map<string, VercelBuildValidationReport>();
  private vercelDeploymentRiskAnalyses = new Map<string, VercelDeploymentRiskAnalysis>();
  private vercelRollbackPlans = new Map<string, VercelRollbackPlan>();
  private vercelDeploymentHistories = new Map<string, VercelDeploymentHistoryEntry[]>();
  private vercelDeploymentLogs = new Map<string, VercelDeploymentLog[]>();
  private vercelDeploymentMonitoringMetrics = new Map<string, VercelDeploymentMonitoringMetrics>();
  private vercelDeploymentInsights = new Map<string, VercelDeploymentInsights>();
  private vercelDeploymentApprovalRecords = new Map<string, VercelDeploymentApprovalRecord>();
  private vercelDeploymentPolicyCompliances = new Map<string, VercelDeploymentPolicyCompliance>();
  private vercelDeploymentRecoveryPlans = new Map<string, VercelDeploymentRecoveryPlan>();
  private vercelDeploymentExecutiveDashboards = new Map<string, VercelDeploymentExecutiveDashboard>();
  private firebaseProjectSummaries = new Map<string, FirebaseProjectSummary>();
  private firebaseAuthReadinessReports = new Map<string, FirebaseAuthReadinessReport>();
  private firestorePlannerReports = new Map<string, FirestorePlannerReport>();
  private firebaseStoragePlannerReports = new Map<string, FirebaseStoragePlannerReport>();
  private firestoreCollectionManagerReports = new Map<string, FirestoreCollectionManagerReport>();
  private firestoreRulesManagerReports = new Map<string, FirestoreRulesManagerReport>();
  private firebaseAuthManagerReports = new Map<string, FirebaseAuthManagerReport>();
  private firebaseSecurityDashboardReports = new Map<string, FirebaseSecurityDashboardReport>();
  private firebaseActivityManagerReports = new Map<string, FirebaseActivityManagerReport>();
  private firebaseMonitoringEngineReports = new Map<string, FirebaseMonitoringEngineReport>();
  private firebaseAnalyticsEngineReports = new Map<string, FirebaseAnalyticsEngineReport>();
  private firebaseConfigurationManagerReports = new Map<string, FirebaseConfigurationManagerReport>();
  private firebaseBackupRecoveryPlans = new Map<string, FirebaseBackupRecoveryPlan>();
  private firebaseComplianceReports = new Map<string, FirebaseComplianceReport>();
  private firebaseExecutiveDashboardReports = new Map<string, FirebaseExecutiveDashboardReport>();
  private memoryManagerReports = new Map<string, MemoryManagerReport>();
  private knowledgeManagerReports = new Map<string, KnowledgeManagerReport>();
  private memoryClassificationReports = new Map<string, MemoryClassificationReport>();
  private memorySearchReports = new Map<string, MemorySearchReport>();
  private contextRetrievalReports = new Map<string, ContextRetrievalReport>();
  private knowledgeIndexReports = new Map<string, KnowledgeIndexReport>();
  private memoryAnalyticsReports = new Map<string, MemoryAnalyticsReport>();
  private knowledgeRelationshipReports = new Map<string, KnowledgeRelationshipReport>();
  private contextIntelligenceReports = new Map<string, ContextIntelligenceReport>();
  private memoryExecutiveInsightsReports = new Map<string, MemoryExecutiveInsightsReport>();
  private memoryLifecycleReports = new Map<string, MemoryLifecycleReport>();
  private knowledgeGovernanceReports = new Map<string, KnowledgeGovernanceReport>();
  private memoryMasterExecutiveDashboardReports = new Map<string, MemoryMasterExecutiveDashboardReport>();
  private documentWorkspaceReports = new Map<string, DocumentWorkspaceReport>();
  private documentIntelligenceReports = new Map<string, DocumentIntelligenceReport>();
  private retrievalWorkspaceReports = new Map<string, RetrievalWorkspaceReport>();
  private ragExecutiveMasterReports = new Map<string, RAGExecutiveMasterReport>();
  private multiAgentOrchestrationReports = new Map<string, MultiAgentOrchestrationMasterReport>();
  private agentTaskPlannerReports = new Map<string, AgentTaskPlannerReport>();
  private agentDelegationReports = new Map<string, AgentDelegationReport>();
  private agentCoordinationPlans = new Map<string, AgentCoordinationPlan>();
  private agentExecutionCoordinatorReports = new Map<string, AgentExecutionCoordinatorReport>();
  private agentApprovalManagerReports = new Map<string, AgentApprovalManagerReport>();
  private agentHandoffManagerReports = new Map<string, AgentHandoffManagerReport>();
  private orchestrationMonitoringStatuses = new Map<string, OrchestrationMonitoringStatus>();
  private workspaceProfiles = new Map<string, WorkspaceProfile>();
  private workspaceMembersMap = new Map<string, WorkspaceMember[]>();
  private activeWorkspaceContexts = new Map<string, ActiveWorkspaceContext>();
  private permissionAuditEventsMap = new Map<string, PermissionAuditEvent[]>();
  private workspaceGovernancePolicies = new Map<string, WorkspaceGovernancePolicy>();
  private workspaceUsagesMap = new Map<string, Record<WorkspaceResourceType, number>>();
  private workspaceUsageAlertsMap = new Map<string, WorkspaceUsageAlert[]>();
  private workspaceUsageHistoryMap = new Map<string, WorkspaceUsageHistoryEntry[]>();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const defaultWs: WorkspaceRecord = {
      id: 'ws_default_01',
      name: 'Primary Workspace',
      description: 'Default AI Studio CEO Workspace',
      ownerId: 'usr_ceo_001',
      createdAt: new Date().toISOString()
    };
    this.workspaces.set(defaultWs.id, defaultWs);

    const defaultProj: Project = {
      id: 'proj_enterprise_01',
      name: 'AI Agent Enterprise Platform',
      workspaceId: 'ws_default_01',
      description: 'Production AI CEO & Coding Engine Architecture',
      createdAt: new Date().toISOString()
    };
    this.projects.set(defaultProj.id, defaultProj);

    // Seed Prompt 11.1 Workspace Profiles & Members
    const ws1: WorkspaceProfile = {
      id: 'ws_enterprise_01',
      name: 'Global AI Enterprise Platform',
      slug: 'enterprise-global',
      description: 'Primary Workspace for Multi-Agent Orchestration & Core Architecture',
      status: 'ACTIVE',
      ownerUserId: 'usr_ceo_001',
      ownerEmail: 'ceo@aistudio.io',
      settings: {
        allowMemberInvite: true,
        maxMembers: 50,
        defaultRole: 'MEMBER',
        defaultProjectDomain: 'enterprise.aistudio.internal',
        enforcementMode: 'STRICT'
      },
      createdAt: new Date('2026-01-01').toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.workspaceProfiles.set(ws1.id, ws1);

    const ws2: WorkspaceProfile = {
      id: 'ws_startup_02',
      name: 'NextGen FinTech Accelerator Workspace',
      slug: 'fintech-nextgen',
      description: 'Secondary Isolated Workspace for Autonomous Financial Services',
      status: 'ACTIVE',
      ownerUserId: 'usr_ceo_001',
      ownerEmail: 'ceo@aistudio.io',
      settings: {
        allowMemberInvite: true,
        maxMembers: 10,
        defaultRole: 'MEMBER',
        enforcementMode: 'STANDARD'
      },
      createdAt: new Date('2026-02-15').toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.workspaceProfiles.set(ws2.id, ws2);

    const membersWs1: WorkspaceMember[] = [
      {
        id: 'mem_01',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_ceo_001',
        email: 'ceo@aistudio.io',
        name: 'Goutam (AI CEO Owner)',
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date('2026-01-01').toISOString()
      },
      {
        id: 'mem_02',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_eng_002',
        email: 'alex@aistudio.io',
        name: 'Alex Rivera (Lead Architect)',
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: new Date('2026-01-02').toISOString()
      },
      {
        id: 'mem_03',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_pm_003',
        email: 'sarah@aistudio.io',
        name: 'Sarah Chen (Product Manager)',
        role: 'MANAGER',
        status: 'ACTIVE',
        joinedAt: new Date('2026-01-05').toISOString()
      },
      {
        id: 'mem_04',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_dev_004',
        email: 'david@aistudio.io',
        name: 'David Kim (Senior Software Engineer)',
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date('2026-01-10').toISOString()
      },
      {
        id: 'mem_05',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_qa_005',
        email: 'elena@aistudio.io',
        name: 'Elena Rostova (Compliance Auditor)',
        role: 'VIEWER',
        status: 'ACTIVE',
        joinedAt: new Date('2026-01-12').toISOString()
      }
    ];
    this.workspaceMembersMap.set('ws_enterprise_01', membersWs1);

    const membersWs2: WorkspaceMember[] = [
      {
        id: 'mem_10',
        workspaceId: 'ws_startup_02',
        userId: 'usr_ceo_001',
        email: 'ceo@aistudio.io',
        name: 'Goutam (AI CEO Owner)',
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date('2026-02-15').toISOString()
      },
      {
        id: 'mem_11',
        workspaceId: 'ws_startup_02',
        userId: 'usr_dev_004',
        email: 'david@aistudio.io',
        name: 'David Kim (Senior Software Engineer)',
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date('2026-02-16').toISOString()
      }
    ];
    this.workspaceMembersMap.set('ws_startup_02', membersWs2);

    this.activeWorkspaceContexts.set('usr_ceo_001', {
      workspaceId: 'ws_enterprise_01',
      activeProjectId: 'proj_enterprise_01',
      activeUser: {
        userId: 'usr_ceo_001',
        email: 'ceo@aistudio.io',
        name: 'Goutam (AI CEO Owner)',
        role: 'OWNER'
      },
      isIsolated: true,
      permissions: ['ALL_PERMISSIONS', 'MANAGE_WORKSPACE', 'MANAGE_MEMBERS', 'EXECUTE_AGENTS', 'DEPLOY_APPS']
    });

    // Seed Prompt 11.2 Permission Audit Events
    const initialAuditEvents: PermissionAuditEvent[] = [
      {
        id: 'audit_001',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_ceo_001',
        eventType: 'ACCESS_GRANTED',
        role: 'OWNER',
        permission: 'workspace:manage',
        resourceType: 'WORKSPACE',
        resourceId: 'ws_enterprise_01',
        details: 'Evaluated permission workspace:manage for OWNER usr_ceo_001. Access GRANTED.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'audit_002',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_dev_004',
        eventType: 'ACCESS_DENIED',
        role: 'MEMBER',
        permission: 'member:remove',
        resourceType: 'MEMBER',
        resourceId: 'mem_02',
        details: 'Evaluated permission member:remove for MEMBER usr_dev_004. Access DENIED (insufficient role hierarchy rank).',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'audit_003',
        workspaceId: 'ws_enterprise_01',
        userId: 'usr_eng_002',
        eventType: 'ROLE_CHANGED',
        role: 'ADMIN',
        permission: 'member:manage',
        resourceType: 'MEMBER',
        resourceId: 'mem_02',
        details: 'User usr_eng_002 role updated to ADMIN by OWNER usr_ceo_001.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ];
    this.permissionAuditEventsMap.set('ws_enterprise_01', initialAuditEvents);

    // Seed Prompt 11.3 Workspace Governance Policies & Usages
    const enterprisePolicy: WorkspaceGovernancePolicy = {
      workspaceId: 'ws_enterprise_01',
      enforceStrictBlocking: true,
      autoAlertOnWarning: true,
      usageResetCycle: 'MONTHLY',
      updatedAt: new Date().toISOString(),
      limits: {
        PROJECTS: { resourceType: 'PROJECTS', limit: 25, warningThresholdPercent: 80, unit: 'projects', description: 'Maximum active projects in workspace' },
        AGENTS: { resourceType: 'AGENTS', limit: 50, warningThresholdPercent: 80, unit: 'agents', description: 'Maximum autonomous AI agent workers' },
        TASKS: { resourceType: 'TASKS', limit: 200, warningThresholdPercent: 85, unit: 'tasks', description: 'Maximum active concurrent execution tasks' },
        TOOL_EXECUTIONS: { resourceType: 'TOOL_EXECUTIONS', limit: 10000, warningThresholdPercent: 90, unit: 'executions', description: 'Monthly tool execution calls' },
        CODE_EXECUTIONS: { resourceType: 'CODE_EXECUTIONS', limit: 5000, warningThresholdPercent: 85, unit: 'runs', description: 'Sandbox code generation & execution runs' },
        DEPLOYMENTS: { resourceType: 'DEPLOYMENTS', limit: 100, warningThresholdPercent: 80, unit: 'deployments', description: 'Monthly Cloud Run & Vercel deployments' },
        KNOWLEDGE_DOCS: { resourceType: 'KNOWLEDGE_DOCS', limit: 1000, warningThresholdPercent: 80, unit: 'documents', description: 'Indexed vector knowledge documents' },
        MEMORY_RECORDS: { resourceType: 'MEMORY_RECORDS', limit: 50000, warningThresholdPercent: 90, unit: 'records', description: 'Episodic memory store records' },
        STORAGE_MB: { resourceType: 'STORAGE_MB', limit: 10240, warningThresholdPercent: 85, unit: 'MB', description: 'Allocated workspace storage volume in MB' },
        ACTIVITY_RECORDS: { resourceType: 'ACTIVITY_RECORDS', limit: 100000, warningThresholdPercent: 90, unit: 'logs', description: 'Audit and activity log entries' }
      }
    };
    this.workspaceGovernancePolicies.set('ws_enterprise_01', enterprisePolicy);

    const enterpriseUsages: Record<WorkspaceResourceType, number> = {
      PROJECTS: 18,
      AGENTS: 32,
      TASKS: 145,
      TOOL_EXECUTIONS: 8200,
      CODE_EXECUTIONS: 3400,
      DEPLOYMENTS: 62,
      KNOWLEDGE_DOCS: 780,
      MEMORY_RECORDS: 32000,
      STORAGE_MB: 8400,
      ACTIVITY_RECORDS: 45000
    };
    this.workspaceUsagesMap.set('ws_enterprise_01', enterpriseUsages);

    const initialAlerts: WorkspaceUsageAlert[] = [
      {
        id: 'alert_001',
        workspaceId: 'ws_enterprise_01',
        resourceType: 'TOOL_EXECUTIONS',
        severity: 'WARNING',
        usagePercent: 82,
        message: 'Tool Executions usage reached 82% (8,200 / 10,000 executions)',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert_002',
        workspaceId: 'ws_enterprise_01',
        resourceType: 'STORAGE_MB',
        severity: 'WARNING',
        usagePercent: 82,
        message: 'Storage Usage reached 82% (8,400 MB / 10,240 MB)',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        acknowledged: false
      }
    ];
    this.workspaceUsageAlertsMap.set('ws_enterprise_01', initialAlerts);

    const initialHistory: WorkspaceUsageHistoryEntry[] = [
      {
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        resourceType: 'TOOL_EXECUTIONS',
        delta: 250,
        newUsage: 8200,
        triggeredByUserId: 'usr_eng_002',
        actionContext: 'Batch agent tool invocation'
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        resourceType: 'DEPLOYMENTS',
        delta: 1,
        newUsage: 62,
        triggeredByUserId: 'usr_ceo_001',
        actionContext: 'Production Cloud Run deployment'
      }
    ];
    this.workspaceUsageHistoryMap.set('ws_enterprise_01', initialHistory);
  }

  // Workspaces
  public getWorkspaces(): WorkspaceRecord[] {
    return Array.from(this.workspaces.values());
  }

  public getWorkspace(id: string): WorkspaceRecord | undefined {
    return this.workspaces.get(id);
  }

  public createWorkspace(data: { name: string; description?: string; ownerId?: string }): WorkspaceRecord {
    const ws: WorkspaceRecord = {
      id: `ws_${Date.now()}`,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId || 'usr_ceo_001',
      createdAt: new Date().toISOString()
    };
    this.workspaces.set(ws.id, ws);
    return ws;
  }

  // Projects
  public getProjects(workspaceId?: string): Project[] {
    const all = Array.from(this.projects.values());
    if (workspaceId) {
      return all.filter(p => p.workspaceId === workspaceId);
    }
    return all;
  }

  public getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  public getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  public createProject(data: {
    name: string;
    workspaceId: string;
    description?: string;
    framework?: string;
    language?: string;
    ownerId?: string;
    gitRepository?: string | null;
  }): Project {
    const proj: Project = {
      id: `proj_${Date.now()}`,
      name: data.name,
      workspaceId: data.workspaceId,
      description: data.description || '',
      createdAt: new Date().toISOString()
    };
    this.projects.set(proj.id, proj);
    return proj;
  }

  public updateProject(id: string, data: Partial<Project>): Project | undefined {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.projects.set(id, updated);
    return updated;
  }

  public deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  // Tasks, Logs, Memories, Connections, Statistics
  public getProjectTasks(projectId: string): ProjectTaskRecord[] {
    return this.tasks.get(projectId) || [
      { id: 't1', projectId, title: 'Initialize System Core Architecture', status: 'DONE', priority: 'HIGH', createdAt: new Date().toISOString() },
      { id: 't2', projectId, title: 'Verify Multi-File Code Generation Engine', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: new Date().toISOString() }
    ];
  }

  public addProjectTask(projectId: string, data: { title: string; description?: string; status?: string; priority?: string; assignedRole?: string; createdBy?: string; updatedBy?: string }) {
    const list = this.tasks.get(projectId) || [];
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      title: data.title,
      description: data.description || '',
      status: (data.status as 'TODO' | 'IN_PROGRESS' | 'DONE') || 'TODO',
      priority: (data.priority as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
      assignedRole: data.assignedRole || 'Engineer',
      createdBy: data.createdBy || 'system',
      updatedBy: data.updatedBy || 'system',
      createdAt: new Date().toISOString()
    };
    list.push(newTask);
    this.tasks.set(projectId, list);
    return newTask;
  }

  public getProjectMemories(projectId: string) {
    return this.memories?.get(projectId) || [
      {
        id: 'mem_1',
        projectId,
        category: 'ARCHITECTURE',
        title: 'Next.js 15 App Router',
        content: 'Project initialized with clean Next.js 15 App Router architecture.',
        tags: ['nextjs', 'architecture'],
        createdBy: 'system',
        createdAt: new Date().toISOString()
      }
    ];
  }

  public addProjectMemory(projectId: string, data: { category: string; title: string; content: string; tags?: string[]; createdBy?: string }) {
    if (!this.memories) {
      this.memories = new Map();
    }
    const list = this.memories.get(projectId) || [];
    const newMem = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      category: (data.category as ProjectMemoryItem['category']) || 'NOTES',
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      createdBy: data.createdBy || 'system',
      createdAt: new Date().toISOString()
    };
    list.push(newMem);
    this.memories.set(projectId, list);
    return newMem;
  }

  public getProjectSettings(projectId: string) {
    const project = this.projects.get(projectId);
    return {
      projectId,
      framework: project?.framework || 'Next.js',
      language: project?.language || 'TypeScript',
      autoRefactor: true,
      autoValidate: true,
      model: 'gemini-2.5-flash',
      gitRepository: project?.gitRepository || null
    };
  }

  public updateProjectSettings(projectId: string, data: Record<string, unknown>) {
    const project = this.projects.get(projectId);
    if (project) {
      if (typeof data.framework === 'string') project.framework = data.framework;
      if (typeof data.language === 'string') project.language = data.language;
    }
    return this.getProjectSettings(projectId);
  }

  public getWorkspaceNotifications(_workspaceId: string) {
    return [
      {
        id: 'notif_1',
        workspaceId: _workspaceId,
        type: 'info',
        title: 'System Initialized',
        message: 'Workspace environment ready.',
        read: false,
        timestamp: new Date().toISOString()
      }
    ];
  }

  public createWorkspaceNotification(data: { workspaceId: string; type: string; title: string; message: string; actionUrl?: string }) {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      read: false,
      timestamp: new Date().toISOString()
    };
  }

  public markWorkspaceNotificationRead(id: string) {
    return {
      id,
      read: true,
      timestamp: new Date().toISOString()
    };
  }

  public getWorkspaceState(workspaceId: string) {
    return {
      workspaceId,
      openProjectId: 'proj_coffeeshop_01',
      openTabs: ['OVERVIEW'],
      chatPosition: { x: 0, y: 0, width: 400, height: 600 },
      panelSizes: { leftSidebarWidth: 260, rightSidebarWidth: 320, bottomPanelHeight: 280 },
      filters: {},
      updatedAt: new Date().toISOString()
    };
  }

  public globalSearch(query: string, _workspaceId: string): WorkspaceSearchResult[] {
    if (!query) return [];
    const qLower = query.toLowerCase();
    const results: WorkspaceSearchResult[] = [];

    for (const proj of this.projects.values()) {
      if (proj.name.toLowerCase().includes(qLower) || proj.description?.toLowerCase().includes(qLower)) {
        results.push({
          id: `res_proj_${proj.id}`,
          type: 'PROJECT',
          title: proj.name,
          subtitle: proj.description,
          url: `/projects/${proj.id}`
        });
      }
    }

    for (const file of this.files.values()) {
      if (file.path.toLowerCase().includes(qLower)) {
        results.push({
          id: `res_file_${file.id}`,
          type: 'FILE',
          title: file.path,
          subtitle: `Language: ${file.language}`,
          url: `/files/${file.id}`
        });
      }
    }

    return results;
  }

  public getWorkspaceShortcuts() {
    return [
      { keyCombo: 'Ctrl+Shift+P', action: 'Open Command Palette', category: 'Navigation' },
      { keyCombo: 'Ctrl+Shift+F', action: 'Global Code Search', category: 'Search' },
      { keyCombo: 'Ctrl+Enter', action: 'Execute Refactor/Prompt', category: 'Action' },
      { keyCombo: 'Ctrl+B', action: 'Toggle Sidebar Panel', category: 'Layout' }
    ];
  }

  public saveWorkspaceState(data: Record<string, unknown>) {
    return {
      workspaceId: 'ws_default_01',
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  public getWorkspaceLayout(userId: string, workspaceId: string) {
    return {
      userId,
      workspaceId,
      leftPanelOpen: true,
      rightPanelOpen: true,
      activeTab: 'OVERVIEW',
      theme: 'dark'
    };
  }

  public updateWorkspaceLayout(userId: string, workspaceId: string, layout: Record<string, unknown>) {
    return {
      userId,
      workspaceId,
      ...layout
    };
  }

  public getProjectConnections(_projectId: string): { id: string; name: string; status: string }[] {
    return [{ id: 'c1', name: 'Google Gemini Pro 2.5', status: 'CONNECTED' }];
  }

  public upsertProjectConnection(projectId: string, provider: string, config: Record<string, unknown>) {
    return {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      name: provider,
      provider,
      config,
      status: 'CONNECTED',
      updatedAt: new Date().toISOString()
    };
  }

  public getProjectStatistics(_projectId: string) {
    return { filesCount: Array.from(this.files.values()).length, totalLines: 1250, patchesApplied: this.patches.size };
  }

  public getProjectLogs(projectId: string): ProjectLogRecord[] {
    return this.logs.get(projectId) || [];
  }

  public addLog(projectId: string, level: string, module: string, message: string, details?: unknown) {
    const list = this.logs.get(projectId) || [];
    const logItem = { id: `log_${Date.now()}`, projectId, level, module, message, details, timestamp: new Date().toISOString() };
    list.push(logItem);
    this.logs.set(projectId, list);
    return logItem;
  }

  // AI Session, Usage, State
  public getAISession(projectId: string): AISessionRecord {
    let session = this.aiSessions.get(projectId);
    if (!session) {
      session = {
        id: `session_${projectId}_01`,
        workspaceId: 'ws_default_01',
        projectId,
        conversationId: `conv_${projectId}_01`,
        currentModel: 'gemini-2.5-flash',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.aiSessions.set(projectId, session);
    }
    return session;
  }

  public getAIUsage(projectId: string): AIUsageRecord {
    return this.aiUsages.get(projectId) || { projectId, totalTokens: 15400, totalRequests: 12, totalLatencyMs: 3400, estimatedCostUsd: 0.002 };
  }

  public recordAIUsage(data: {
    workspaceId?: string;
    projectId: string;
    sessionId?: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    latencyMs?: number;
    estimatedCostUsd?: number;
  }) {
    const current = this.aiUsages.get(data.projectId) || {
      projectId: data.projectId,
      totalTokens: 0,
      totalRequests: 0,
      totalLatencyMs: 0,
      estimatedCostUsd: 0
    };
    current.totalTokens += data.totalTokens || 0;
    current.totalRequests += 1;
    current.totalLatencyMs += data.latencyMs || 0;
    current.estimatedCostUsd += data.estimatedCostUsd || 0;
    this.aiUsages.set(data.projectId, current);
    return current;
  }

  public getAIState(projectId: string): string {
    return this.aiStates.get(projectId) || 'Idle';
  }

  public setAIState(projectId: string, state: string) {
    this.aiStates.set(projectId, state);
  }

  public logAIModelAction(model: string, action: string, status: string, details: string) {
    this.modelActionLogs.push({ model, action, status, details, timestamp: new Date().toISOString() });
  }

  public addAIRequest(data: { sessionId: string; workspaceId: string; projectId: string; prompt: string; model: string; intent: string }) {
    return { id: `req_${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  }

  public addAIResponse(data: Record<string, unknown>) {
    return { id: `res_${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  }

  public getProjectChat(projectId: string) {
    return this.chatMessages.get(projectId) || [];
  }

  public getProjectChats(projectId: string) {
    return this.getProjectChat(projectId);
  }

  public getAIDecisions(projectId: string) {
    return [
      { id: 'dec_1', projectId, decision: 'Adopted Next.js 15 App Router architecture', reason: 'Modern, scalable full-stack framework with App Router support', category: 'ARCHITECTURE', timestamp: new Date().toISOString() }
    ];
  }

  public getConversationSummary(projectId: string) {
    return {
      projectId,
      summary: 'Initial project setup and architecture planning phase.',
      updatedAt: new Date().toISOString()
    };
  }

  public setConversationSummary(projectId: string, conversationId: string, summary: string, _keyPoints?: string[], _decisions?: string[]) {
    return {
      projectId,
      conversationId,
      summary,
      updatedAt: new Date().toISOString()
    };
  }

  public getMemorySummary(projectId: string) {
    const mems = this.memories.get(projectId) || [];
    return {
      projectId,
      totalMemories: mems.length,
      categoriesCount: new Set(mems.map(m => m.category)).size
    };
  }

  public addChatMessage(projectId: string, _role: string, senderName: string, text: string, _tokens?: number, _model?: string) {
    const list = this.chatMessages.get(projectId) || [];
    const msg = { id: `msg_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, sender: _role, name: senderName, text, timestamp: new Date().toISOString() };
    list.push(msg);
    this.chatMessages.set(projectId, list);
    return msg;
  }

  // Workflows
  public createWorkflow(workspaceId: string, projectId: string, conversationId: string, type: string): WorkflowRecord {
    const wf: WorkflowRecord = {
      id: `wf_${Date.now()}`,
      workspaceId,
      projectId,
      conversationId,
      type,
      status: 'RUNNING',
      createdAt: new Date().toISOString()
    };
    this.workflows.set(wf.id, wf);
    return wf;
  }

  public updateWorkflow(id: string, updates: Partial<WorkflowRecord>) {
    const wf = this.workflows.get(id);
    if (wf) {
      Object.assign(wf, updates);
      this.workflows.set(id, wf);
    }
    return wf;
  }

  public addWorkflowEvent(workflowId: string, eventType: string, details: string) {
    const list = this.workflowEvents.get(workflowId) || [];
    const evt: WorkflowEventRecord = {
      id: `wfe_${Date.now()}`,
      workflowId,
      title: eventType,
      details,
      timestamp: new Date().toISOString()
    };
    list.push(evt);
    this.workflowEvents.set(workflowId, list);
    return evt;
  }

  public getWorkflow(id: string): WorkflowRecord | undefined {
    return this.workflows.get(id);
  }

  public getWorkflowEvents(id: string): WorkflowEventRecord[] {
    return this.workflowEvents.get(id) || [];
  }

  public getProjectWorkflows(projectId: string): WorkflowRecord[] {
    return Array.from(this.workflows.values()).filter(w => w.projectId === projectId);
  }

  // Workspace Activities
  public getWorkspaceActivities(workspaceId: string, projectId?: string): WorkspaceActivityRecord[] {
    return this.activities.filter(a => a.workspaceId === workspaceId && (!projectId || a.projectId === projectId));
  }

  public logWorkspaceActivity(data: {
    workspaceId: string;
    projectId?: string;
    eventType: string;
    title: string;
    description?: string;
    details?: Record<string, unknown>;
  }): WorkspaceActivityRecord {
    const rec: WorkspaceActivityRecord = {
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...data
    };
    this.activities.unshift(rec);
    return rec;
  }

  public logAuditEvent(data: {
    workspaceId: string;
    projectId?: string;
    userId: string;
    action: string;
    details?: Record<string, unknown>;
  }): AuditEvent {
    const act = this.logWorkspaceActivity({
      workspaceId: data.workspaceId,
      projectId: data.projectId,
      eventType: 'AUDIT',
      title: data.action,
      details: data.details
    });
    return {
      id: act.id,
      workspaceId: act.workspaceId,
      projectId: act.projectId,
      userId: data.userId,
      action: data.action,
      details: data.details,
      timestamp: act.timestamp
    };
  }

  public getAuditEvents(workspaceId: string): AuditEvent[] {
    return this.activities
      .filter(a => a.workspaceId === workspaceId && a.eventType === 'AUDIT')
      .map(a => ({
        id: a.id,
        workspaceId: a.workspaceId,
        projectId: a.projectId,
        userId: 'usr_default',
        action: a.title,
        details: a.details,
        timestamp: a.timestamp
      }));
  }

  public getAuditLogs() {
    return this.activities;
  }

  // Approval Requests
  public createApprovalRequest(data: Omit<ApprovalRequest, 'id' | 'requestedAt'> & { id?: string }): ApprovalRequest {
    const req: ApprovalRequest = {
      id: data.id || `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requestedAt: new Date().toISOString(),
      ...data
    };
    this.approvalRequests.set(req.id, req);
    return req;
  }

  public getApprovalRequest(id: string): ApprovalRequest | undefined {
    return this.approvalRequests.get(id);
  }

  public updateApprovalRequest(
    id: string,
    updatesOrStatus: 'APPROVED' | 'REJECTED' | 'PENDING' | Partial<ApprovalRequest>,
    reviewerId?: string
  ): ApprovalRequest | undefined {
    const req = this.approvalRequests.get(id);
    if (req) {
      if (typeof updatesOrStatus === 'string') {
        req.status = updatesOrStatus;
        if (reviewerId) req.reviewedBy = reviewerId;
      } else {
        Object.assign(req, updatesOrStatus);
      }
      this.approvalRequests.set(id, req);
    }
    return req;
  }

  public getApprovalRequests(workspaceId?: string): ApprovalRequest[] {
    const list = Array.from(this.approvalRequests.values());
    if (workspaceId) {
      return list.filter(r => r.workspaceId === workspaceId);
    }
    return list;
  }

  // Execution Context
  public saveToolExecutionContext(ctx: ToolExecutionContext): ToolExecutionContext {
    this.toolExecutionContexts.set(ctx.executionId, ctx);
    return ctx;
  }

  public getToolExecutionContext(executionId: string): ToolExecutionContext | undefined {
    return this.toolExecutionContexts.get(executionId);
  }

  // Execution History
  public recordExecutionHistory(item: Omit<ExecutionHistoryItem, 'id'>): ExecutionHistoryItem {
    const entry: ExecutionHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...item
    };
    this.executionHistory.unshift(entry);
    return entry;
  }

  public getExecutionHistory(toolId?: string, workspaceId?: string): ExecutionHistoryItem[] {
    return this.executionHistory.filter(item => {
      if (toolId && item.toolId !== toolId) return false;
      return true;
    });
  }

  // Execution Metrics
  public recordExecutionMetrics(metrics: Omit<ExecutionMetrics, 'id' | 'createdAt'>): ExecutionMetrics {
    const entry: ExecutionMetrics = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...metrics
    };
    if (metrics.executionId) {
      this.executionMetrics.set(metrics.executionId, entry);
    } else {
      this.executionMetrics.set(entry.id!, entry);
    }
    return entry;
  }

  public getExecutionMetrics(executionId: string): ExecutionMetrics | undefined {
    return this.executionMetrics.get(executionId);
  }

  // Tool Executions
  public createToolExecution(data: Omit<ToolExecution, 'id'> & { id?: string }): ToolExecution {
    const exec: ToolExecution = {
      id: data.id || `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...data
    };
    this.toolExecutions.set(exec.id, exec);
    return exec;
  }

  public getToolExecution(id: string): ToolExecution | undefined {
    return this.toolExecutions.get(id);
  }

  public getToolExecutions(workspaceId?: string, projectId?: string): ToolExecution[] {
    const list = Array.from(this.toolExecutions.values());
    return list.filter(e => {
      if (workspaceId && e.workspaceId !== workspaceId) return false;
      if (projectId && e.projectId !== projectId) return false;
      return true;
    });
  }

  public updateToolExecution(id: string, updates: Partial<ToolExecution>): ToolExecution | undefined {
    const exec = this.toolExecutions.get(id);
    if (exec) {
      Object.assign(exec, updates);
      this.toolExecutions.set(id, exec);
    }
    return exec;
  }

  public addExecutionProgressReport(report: ExecutionProgressReport): ExecutionProgressReport {
    const exec = this.toolExecutions.get(report.executionId);
    if (exec) {
      exec.progressPercent = report.progressPercent;
      exec.stepMessage = report.stepMessage;
      this.toolExecutions.set(report.executionId, exec);
    }
    return report;
  }

  public getExecutionProgressReports(executionId: string): ExecutionProgressReport[] {
    const exec = this.toolExecutions.get(executionId);
    if (!exec) return [];
    return [{
      executionId,
      progressPercent: exec.progressPercent ?? exec.progress ?? 0,
      stepMessage: exec.stepMessage,
      status: exec.status
    }];
  }

  public saveExecutionResult(result: ExecutionResult): ExecutionResult {
    if (result.executionId) {
      const exec = this.toolExecutions.get(result.executionId);
      if (exec) {
        exec.outputs = result.outputs;
        exec.error = result.error;
        exec.status = result.success ? 'COMPLETED' : 'FAILED';
        this.toolExecutions.set(result.executionId, exec);
      }
    }
    return result;
  }

  public getExecutionResult(executionId: string): ExecutionResult | undefined {
    const exec = this.toolExecutions.get(executionId);
    if (!exec) return undefined;
    return {
      success: exec.status === 'COMPLETED' || exec.status === 'Completed',
      outputs: exec.outputs || exec.result,
      error: exec.error,
      logs: exec.logs
    };
  }

  // Plugins
  public getPlugins(): PluginRegistryItem[] {
    return Array.from(this.plugins.values());
  }

  public registerPlugin(plugin: Omit<PluginRegistryItem, 'id' | 'installedAt'> & { id?: string }): PluginRegistryItem {
    const item: PluginRegistryItem = {
      id: plugin.id || `plug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      installedAt: new Date().toISOString(),
      ...plugin
    };
    this.plugins.set(item.id, item);
    return item;
  }

  public togglePlugin(id: string, enabled: boolean): PluginRegistryItem | undefined {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = enabled;
      this.plugins.set(id, plugin);
    }
    return plugin;
  }

  // Execution Plans
  public saveExecutionPlan(plan: ExecutionPlan): ExecutionPlan {
    this.executionPlans.set(plan.id, plan);
    return plan;
  }

  public getExecutionPlan(id: string): ExecutionPlan | undefined {
    return this.executionPlans.get(id);
  }

  public getExecutionPlans(workspaceId?: string): ExecutionPlan[] {
    const list = Array.from(this.executionPlans.values());
    if (workspaceId) {
      return list.filter(p => !p.workspaceId || p.workspaceId === workspaceId);
    }
    return list;
  }

  // Formatted Execution Results
  public saveFormattedResult(result: FormattedExecutionResult): FormattedExecutionResult {
    this.formattedResults.set(result.executionId, result);
    return result;
  }

  public getFormattedResult(executionId: string): FormattedExecutionResult | undefined {
    return this.formattedResults.get(executionId);
  }

  // Code Projects
  public createCodeProject(data: {
    workspaceId: string;
    projectId: string;
    name: string;
    language: SupportedLanguage;
    framework: SupportedFramework;
    architecture?: string;
    rootPath: string;
    packageManager: string;
  }): CodeProjectRecord {
    const cp: CodeProjectRecord = {
      id: `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId: data.workspaceId,
      projectId: data.projectId,
      name: data.name,
      language: data.language,
      framework: data.framework,
      rootPath: data.rootPath,
      packageManager: (data.packageManager as CodeProjectRecord['packageManager']) || 'npm',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.codeProjects.set(cp.id, cp);
    return cp;
  }

  public getCodeProject(id: string): CodeProjectRecord | undefined {
    return this.codeProjects.get(id);
  }

  public getCodeProjectByProjectId(projectId: string): CodeProjectRecord | undefined {
    return Array.from(this.codeProjects.values()).find(cp => cp.projectId === projectId);
  }

  public setCodeProject(cp: CodeProjectRecord) {
    this.codeProjects.set(cp.id, cp);
  }

  // Folders & Files
  public saveGeneratedFolder(data: {
    codeProjectId: string;
    projectId?: string;
    workspaceId?: string;
    path: string;
    name: string;
    parentPath?: string;
  }): GeneratedFolderRecord {
    const rec: GeneratedFolderRecord = {
      id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      codeProjectId: data.codeProjectId,
      name: data.name,
      path: data.path,
      parentPath: data.parentPath,
      createdAt: new Date().toISOString()
    };
    this.folders.set(rec.id, rec);
    return rec;
  }

  public getGeneratedFolders(codeProjectId: string): GeneratedFolderRecord[] {
    return this.getFoldersForCodeProject(codeProjectId);
  }

  public getFoldersForCodeProject(codeProjectId: string): GeneratedFolderRecord[] {
    return Array.from(this.folders.values()).filter(f => f.codeProjectId === codeProjectId);
  }

  public setFolder(folder: GeneratedFolderRecord) {
    this.folders.set(folder.id, folder);
  }

  public getFilesForCodeProject(codeProjectId: string): GeneratedFileRecord[] {
    return Array.from(this.files.values()).filter(f => f.codeProjectId === codeProjectId);
  }

  public createGeneratedFile(file: GeneratedFileRecord) {
    this.files.set(file.id, file);
  }

  public updateGeneratedFile(file: GeneratedFileRecord) {
    this.files.set(file.id, file);
  }

  public deleteGeneratedFile(fileId: string) {
    this.files.delete(fileId);
  }

  // Patches
  public createCodePatch(patch: CodePatchRecord) {
    this.patches.set(patch.patchId, patch);
  }

  public getCodePatch(patchId: string): CodePatchRecord | undefined {
    return this.patches.get(patchId);
  }

  public getPatchesForCodeProject(codeProjectId: string): CodePatchRecord[] {
    return Array.from(this.patches.values())
      .filter(p => p.codeProjectId === codeProjectId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  // Diffs
  public createCodeDiff(diff: CodeDiffRecord) {
    this.diffs.set(diff.diffId, diff);
  }

  public getDiffsForPatch(patchId: string): CodeDiffRecord[] {
    return Array.from(this.diffs.values()).filter(d => d.patchId === patchId);
  }

  // File History
  public createFileHistory(snapshot: FileHistoryRecord) {
    const list = this.fileHistory.get(snapshot.filePath) || [];
    list.push(snapshot);
    this.fileHistory.set(snapshot.filePath, list);
  }

  public getFileHistory(filePath: string): FileHistoryRecord[] {
    return this.fileHistory.get(filePath) || [];
  }

  // Rollback History
  public createRollbackRecord(record: RollbackHistoryRecord) {
    this.rollbackHistory.set(record.id, record);
  }

  public getRollbackHistoryForCodeProject(codeProjectId: string): RollbackHistoryRecord[] {
    return Array.from(this.rollbackHistory.values())
      .filter(r => r.codeProjectId === codeProjectId)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  // Refactor Logs
  public createRefactorLog(log: RefactorLogRecord) {
    this.refactorLogs.set(log.id, log);
  }

  public getRefactorLogsForCodeProject(codeProjectId: string): RefactorLogRecord[] {
    return Array.from(this.refactorLogs.values())
      .filter(r => r.codeProjectId === codeProjectId)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  // Conflicts
  public createConflictIssue(issue: CodeConflictIssue) {
    this.conflictIssues.set(issue.id, issue);
  }

  public getConflictsForCodeProject(_codeProjectId: string): CodeConflictIssue[] {
    return Array.from(this.conflictIssues.values());
  }

  // GitHub Store Methods (Prompt 5.1)
  public saveGitHubConnection(conn: GitHubConnection): GitHubConnection {
    this.githubConnections.set(conn.userId, conn);
    return conn;
  }

  public getGitHubConnection(userId: string): GitHubConnection | undefined {
    return this.githubConnections.get(userId);
  }

  public saveGitHubOAuthSession(session: GitHubOAuthSession): GitHubOAuthSession {
    this.githubOAuthSessions.set(session.id, session);
    return session;
  }

  public getGitHubOAuthSession(sessionId: string): GitHubOAuthSession | undefined {
    return this.githubOAuthSessions.get(sessionId);
  }

  public saveGitHubRepoMetadata(meta: GitHubRepositoryMetadata): GitHubRepositoryMetadata {
    this.githubRepoMetadata.set(meta.fullName.toLowerCase(), meta);
    return meta;
  }

  public getGitHubRepoMetadata(fullName: string): GitHubRepositoryMetadata | undefined {
    return this.githubRepoMetadata.get(fullName.toLowerCase());
  }

  // GitHub Store Methods (Prompt 5.2)
  public saveGitBranch(branch: GitBranchInfo): GitBranchInfo {
    const key = branch.repoFullName.toLowerCase();
    const existing = this.gitBranches.get(key) || [];
    const idx = existing.findIndex(b => b.name === branch.name);
    if (idx >= 0) {
      existing[idx] = branch;
    } else {
      existing.push(branch);
    }
    this.gitBranches.set(key, existing);
    return branch;
  }

  public getGitBranches(repoFullName: string): GitBranchInfo[] {
    return this.gitBranches.get(repoFullName.toLowerCase()) || [];
  }

  public saveCommitPlan(plan: CommitPlan): CommitPlan {
    this.commitPlans.set(plan.id, plan);
    return plan;
  }

  public getCommitPlan(id: string): CommitPlan | undefined {
    return this.commitPlans.get(id);
  }

  public getCommitPlans(repoFullName?: string): CommitPlan[] {
    const plans = Array.from(this.commitPlans.values());
    if (repoFullName) {
      return plans.filter(p => p.repoFullName.toLowerCase() === repoFullName.toLowerCase());
    }
    return plans;
  }

  public saveGitChangeAnalysis(analysis: GitChangeAnalysis): GitChangeAnalysis {
    this.gitChangeAnalyses.set(analysis.id, analysis);
    return analysis;
  }

  public getGitChangeAnalysis(id: string): GitChangeAnalysis | undefined {
    return this.gitChangeAnalyses.get(id);
  }

  public getLatestGitChangeAnalysis(repoFullName: string): GitChangeAnalysis | undefined {
    const list = Array.from(this.gitChangeAnalyses.values())
      .filter(a => a.repoFullName.toLowerCase() === repoFullName.toLowerCase())
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
    return list[0];
  }

  // GitHub Store Methods (Prompt 5.3)
  public savePullRequestPlan(plan: PullRequestPlan): PullRequestPlan {
    this.pullRequestPlans.set(plan.id, plan);
    return plan;
  }

  public getLatestPullRequestPlan(repoFullName: string): PullRequestPlan | undefined {
    const list = Array.from(this.pullRequestPlans.values())
      .filter(p => p.repoFullName.toLowerCase() === repoFullName.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0];
  }

  public saveGitHubActionsPlan(plan: GitHubActionsPlan): GitHubActionsPlan {
    this.githubActionsPlans.set(plan.id, plan);
    return plan;
  }

  public getLatestGitHubActionsPlan(repoFullName: string): GitHubActionsPlan | undefined {
    const list = Array.from(this.githubActionsPlans.values())
      .filter(p => p.repoFullName.toLowerCase() === repoFullName.toLowerCase())
      .sort((a, b) => new Date(b.plannedAt).getTime() - new Date(a.plannedAt).getTime());
    return list[0];
  }

  public saveReleasePlan(plan: ReleasePlan): ReleasePlan {
    this.releasePlans.set(plan.id, plan);
    return plan;
  }

  public getLatestReleasePlan(repoFullName: string): ReleasePlan | undefined {
    const list = Array.from(this.releasePlans.values())
      .filter(p => p.repoFullName.toLowerCase() === repoFullName.toLowerCase())
      .sort((a, b) => new Date(b.plannedAt).getTime() - new Date(a.plannedAt).getTime());
    return list[0];
  }

  public saveRepoSecurityAnalysis(analysis: RepoSecurityAnalysis): RepoSecurityAnalysis {
    this.repoSecurityAnalyses.set(analysis.id, analysis);
    return analysis;
  }

  public getLatestRepoSecurityAnalysis(repoFullName: string): RepoSecurityAnalysis | undefined {
    const list = Array.from(this.repoSecurityAnalyses.values())
      .filter(a => a.repoFullName.toLowerCase() === repoFullName.toLowerCase())
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
    return list[0];
  }

  // GitHub Store Methods (Prompt 5.4)
  public saveRepoExplorerOverview(overview: RepoExplorerOverview): RepoExplorerOverview {
    this.repoExplorerOverviews.set(overview.repoFullName.toLowerCase(), overview);
    return overview;
  }

  public getRepoExplorerOverview(repoFullName: string): RepoExplorerOverview | undefined {
    return this.repoExplorerOverviews.get(repoFullName.toLowerCase());
  }

  public saveBranchOperationPlan(plan: BranchOperationPlan): BranchOperationPlan {
    this.branchOperationPlans.set(plan.id, plan);
    return plan;
  }

  public getBranchOperationPlans(repoFullName: string): BranchOperationPlan[] {
    return Array.from(this.branchOperationPlans.values())
      .filter(p => p.repoFullName.toLowerCase() === repoFullName.toLowerCase())
      .sort((a, b) => new Date(b.plannedAt).getTime() - new Date(a.plannedAt).getTime());
  }

  public saveGitHubActivityTimeline(timeline: GitHubActivityTimeline): GitHubActivityTimeline {
    this.githubActivityTimelines.set(timeline.id, timeline);
    return timeline;
  }

  public getLatestGitHubActivityTimeline(repoFullName: string): GitHubActivityTimeline | undefined {
    const list = Array.from(this.githubActivityTimelines.values())
      .filter(t => t.repoFullName.toLowerCase() === repoFullName.toLowerCase())
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    return list[0];
  }

  // Vercel Store Methods (Prompt 6.1)
  public saveVercelDeploymentPlan(plan: VercelDeploymentPlan): VercelDeploymentPlan {
    this.vercelDeploymentPlans.set(plan.id, plan);
    return plan;
  }

  public getLatestVercelDeploymentPlan(projectId: string): VercelDeploymentPlan | undefined {
    const list = Array.from(this.vercelDeploymentPlans.values())
      .filter(p => p.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.plannedAt).getTime() - new Date(a.plannedAt).getTime());
    return list[0];
  }

  public saveVercelEnvironmentConfig(config: VercelEnvironmentConfig): VercelEnvironmentConfig {
    this.vercelEnvironmentConfigs.set(config.id, config);
    return config;
  }

  public getLatestVercelEnvironmentConfig(projectId: string): VercelEnvironmentConfig | undefined {
    const list = Array.from(this.vercelEnvironmentConfigs.values())
      .filter(c => c.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
    return list[0];
  }

  public saveVercelProjectConfigAnalysis(analysis: VercelProjectConfigAnalysis): VercelProjectConfigAnalysis {
    this.vercelProjectConfigAnalyses.set(analysis.id, analysis);
    return analysis;
  }

  public getLatestVercelProjectConfigAnalysis(projectId: string): VercelProjectConfigAnalysis | undefined {
    const list = Array.from(this.vercelProjectConfigAnalyses.values())
      .filter(a => a.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
    return list[0];
  }

  public saveVercelDeploymentReadinessReport(report: VercelDeploymentReadinessReport): VercelDeploymentReadinessReport {
    this.vercelDeploymentReadinessReports.set(report.id, report);
    return report;
  }

  public getLatestVercelDeploymentReadinessReport(projectId: string): VercelDeploymentReadinessReport | undefined {
    const list = Array.from(this.vercelDeploymentReadinessReports.values())
      .filter(r => r.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    return list[0];
  }

  // Prompt 6.2 Store Methods
  public saveVercelPipelinePlan(plan: VercelPipelinePlan): VercelPipelinePlan {
    this.vercelPipelinePlans.set(plan.id, plan);
    return plan;
  }

  public getLatestVercelPipelinePlan(projectId: string): VercelPipelinePlan | undefined {
    const list = Array.from(this.vercelPipelinePlans.values())
      .filter(p => p.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0];
  }

  public saveVercelBuildValidationReport(report: VercelBuildValidationReport): VercelBuildValidationReport {
    this.vercelBuildValidationReports.set(report.id, report);
    return report;
  }

  public getLatestVercelBuildValidationReport(projectId: string): VercelBuildValidationReport | undefined {
    const list = Array.from(this.vercelBuildValidationReports.values())
      .filter(r => r.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime());
    return list[0];
  }

  public saveVercelDeploymentRiskAnalysis(analysis: VercelDeploymentRiskAnalysis): VercelDeploymentRiskAnalysis {
    this.vercelDeploymentRiskAnalyses.set(analysis.id, analysis);
    return analysis;
  }

  public getLatestVercelDeploymentRiskAnalysis(projectId: string): VercelDeploymentRiskAnalysis | undefined {
    const list = Array.from(this.vercelDeploymentRiskAnalyses.values())
      .filter(a => a.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
    return list[0];
  }

  public saveVercelRollbackPlan(plan: VercelRollbackPlan): VercelRollbackPlan {
    this.vercelRollbackPlans.set(plan.id, plan);
    return plan;
  }

  public getLatestVercelRollbackPlan(projectId: string): VercelRollbackPlan | undefined {
    const list = Array.from(this.vercelRollbackPlans.values())
      .filter(p => p.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.plannedAt).getTime() - new Date(a.plannedAt).getTime());
    return list[0];
  }

  // Prompt 6.3 Store Methods
  public saveVercelDeploymentHistory(projectId: string, history: VercelDeploymentHistoryEntry[]): VercelDeploymentHistoryEntry[] {
    this.vercelDeploymentHistories.set(projectId.toLowerCase(), history);
    return history;
  }

  public getVercelDeploymentHistory(projectId: string): VercelDeploymentHistoryEntry[] {
    return this.vercelDeploymentHistories.get(projectId.toLowerCase()) || [];
  }

  public saveVercelDeploymentLogs(projectId: string, logs: VercelDeploymentLog[]): VercelDeploymentLog[] {
    this.vercelDeploymentLogs.set(projectId.toLowerCase(), logs);
    return logs;
  }

  public getVercelDeploymentLogs(projectId: string): VercelDeploymentLog[] {
    return this.vercelDeploymentLogs.get(projectId.toLowerCase()) || [];
  }

  public saveVercelDeploymentMonitoringMetrics(metrics: VercelDeploymentMonitoringMetrics): VercelDeploymentMonitoringMetrics {
    this.vercelDeploymentMonitoringMetrics.set(metrics.projectId.toLowerCase(), metrics);
    return metrics;
  }

  public getLatestVercelDeploymentMonitoringMetrics(projectId: string): VercelDeploymentMonitoringMetrics | undefined {
    return this.vercelDeploymentMonitoringMetrics.get(projectId.toLowerCase());
  }

  public saveVercelDeploymentInsights(insights: VercelDeploymentInsights): VercelDeploymentInsights {
    this.vercelDeploymentInsights.set(insights.projectId.toLowerCase(), insights);
    return insights;
  }

  public getLatestVercelDeploymentInsights(projectId: string): VercelDeploymentInsights | undefined {
    return this.vercelDeploymentInsights.get(projectId.toLowerCase());
  }

  // Prompt 6.4 Store Methods
  public saveVercelDeploymentApprovalRecord(record: VercelDeploymentApprovalRecord): VercelDeploymentApprovalRecord {
    this.vercelDeploymentApprovalRecords.set(record.id, record);
    return record;
  }

  public getLatestVercelDeploymentApprovalRecord(projectId: string): VercelDeploymentApprovalRecord | undefined {
    const list = Array.from(this.vercelDeploymentApprovalRecords.values())
      .filter(r => r.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.decisionAt).getTime() - new Date(a.decisionAt).getTime());
    return list[0];
  }

  public saveVercelDeploymentPolicyCompliance(compliance: VercelDeploymentPolicyCompliance): VercelDeploymentPolicyCompliance {
    this.vercelDeploymentPolicyCompliances.set(compliance.projectId.toLowerCase(), compliance);
    return compliance;
  }

  public getLatestVercelDeploymentPolicyCompliance(projectId: string): VercelDeploymentPolicyCompliance | undefined {
    return this.vercelDeploymentPolicyCompliances.get(projectId.toLowerCase());
  }

  public saveVercelDeploymentRecoveryPlan(plan: VercelDeploymentRecoveryPlan): VercelDeploymentRecoveryPlan {
    this.vercelDeploymentRecoveryPlans.set(plan.id, plan);
    return plan;
  }

  public getLatestVercelDeploymentRecoveryPlan(projectId: string): VercelDeploymentRecoveryPlan | undefined {
    const list = Array.from(this.vercelDeploymentRecoveryPlans.values())
      .filter(p => p.projectId.toLowerCase() === projectId.toLowerCase())
      .sort((a, b) => new Date(b.plannedAt).getTime() - new Date(a.plannedAt).getTime());
    return list[0];
  }

  public saveVercelDeploymentExecutiveDashboard(dashboard: VercelDeploymentExecutiveDashboard): VercelDeploymentExecutiveDashboard {
    this.vercelDeploymentExecutiveDashboards.set(dashboard.projectId.toLowerCase(), dashboard);
    return dashboard;
  }

  public getLatestVercelDeploymentExecutiveDashboard(projectId: string): VercelDeploymentExecutiveDashboard | undefined {
    return this.vercelDeploymentExecutiveDashboards.get(projectId.toLowerCase());
  }

  // Prompt 7.1 Store Methods
  public saveFirebaseProjectSummary(summary: FirebaseProjectSummary): FirebaseProjectSummary {
    this.firebaseProjectSummaries.set(summary.projectId.toLowerCase(), summary);
    return summary;
  }

  public getLatestFirebaseProjectSummary(projectId: string): FirebaseProjectSummary | undefined {
    return this.firebaseProjectSummaries.get(projectId.toLowerCase());
  }

  public saveFirebaseAuthReadinessReport(report: FirebaseAuthReadinessReport): FirebaseAuthReadinessReport {
    this.firebaseAuthReadinessReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseAuthReadinessReport(projectId: string): FirebaseAuthReadinessReport | undefined {
    return this.firebaseAuthReadinessReports.get(projectId.toLowerCase());
  }

  public saveFirestorePlannerReport(report: FirestorePlannerReport): FirestorePlannerReport {
    this.firestorePlannerReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirestorePlannerReport(projectId: string): FirestorePlannerReport | undefined {
    return this.firestorePlannerReports.get(projectId.toLowerCase());
  }

  public saveFirebaseStoragePlannerReport(report: FirebaseStoragePlannerReport): FirebaseStoragePlannerReport {
    this.firebaseStoragePlannerReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseStoragePlannerReport(projectId: string): FirebaseStoragePlannerReport | undefined {
    return this.firebaseStoragePlannerReports.get(projectId.toLowerCase());
  }

  // Prompt 7.2 Store Methods
  public saveFirestoreCollectionManagerReport(report: FirestoreCollectionManagerReport): FirestoreCollectionManagerReport {
    this.firestoreCollectionManagerReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirestoreCollectionManagerReport(projectId: string): FirestoreCollectionManagerReport | undefined {
    return this.firestoreCollectionManagerReports.get(projectId.toLowerCase());
  }

  public saveFirestoreRulesManagerReport(report: FirestoreRulesManagerReport): FirestoreRulesManagerReport {
    this.firestoreRulesManagerReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirestoreRulesManagerReport(projectId: string): FirestoreRulesManagerReport | undefined {
    return this.firestoreRulesManagerReports.get(projectId.toLowerCase());
  }

  public saveFirebaseAuthManagerReport(report: FirebaseAuthManagerReport): FirebaseAuthManagerReport {
    this.firebaseAuthManagerReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseAuthManagerReport(projectId: string): FirebaseAuthManagerReport | undefined {
    return this.firebaseAuthManagerReports.get(projectId.toLowerCase());
  }

  public saveFirebaseSecurityDashboardReport(report: FirebaseSecurityDashboardReport): FirebaseSecurityDashboardReport {
    this.firebaseSecurityDashboardReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseSecurityDashboardReport(projectId: string): FirebaseSecurityDashboardReport | undefined {
    return this.firebaseSecurityDashboardReports.get(projectId.toLowerCase());
  }

  // Prompt 7.3 Store Methods
  public saveFirebaseActivityManagerReport(report: FirebaseActivityManagerReport): FirebaseActivityManagerReport {
    this.firebaseActivityManagerReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseActivityManagerReport(projectId: string): FirebaseActivityManagerReport | undefined {
    return this.firebaseActivityManagerReports.get(projectId.toLowerCase());
  }

  public saveFirebaseMonitoringEngineReport(report: FirebaseMonitoringEngineReport): FirebaseMonitoringEngineReport {
    this.firebaseMonitoringEngineReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseMonitoringEngineReport(projectId: string): FirebaseMonitoringEngineReport | undefined {
    return this.firebaseMonitoringEngineReports.get(projectId.toLowerCase());
  }

  public saveFirebaseAnalyticsEngineReport(report: FirebaseAnalyticsEngineReport): FirebaseAnalyticsEngineReport {
    this.firebaseAnalyticsEngineReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseAnalyticsEngineReport(projectId: string): FirebaseAnalyticsEngineReport | undefined {
    return this.firebaseAnalyticsEngineReports.get(projectId.toLowerCase());
  }

  // Prompt 7.4 Store Methods
  public saveFirebaseConfigurationManagerReport(report: FirebaseConfigurationManagerReport): FirebaseConfigurationManagerReport {
    this.firebaseConfigurationManagerReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseConfigurationManagerReport(projectId: string): FirebaseConfigurationManagerReport | undefined {
    return this.firebaseConfigurationManagerReports.get(projectId.toLowerCase());
  }

  public saveFirebaseBackupRecoveryPlan(plan: FirebaseBackupRecoveryPlan): FirebaseBackupRecoveryPlan {
    this.firebaseBackupRecoveryPlans.set(plan.projectId.toLowerCase(), plan);
    return plan;
  }

  public getLatestFirebaseBackupRecoveryPlan(projectId: string): FirebaseBackupRecoveryPlan | undefined {
    return this.firebaseBackupRecoveryPlans.get(projectId.toLowerCase());
  }

  public saveFirebaseComplianceReport(report: FirebaseComplianceReport): FirebaseComplianceReport {
    this.firebaseComplianceReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseComplianceReport(projectId: string): FirebaseComplianceReport | undefined {
    return this.firebaseComplianceReports.get(projectId.toLowerCase());
  }

  public saveFirebaseExecutiveDashboardReport(report: FirebaseExecutiveDashboardReport): FirebaseExecutiveDashboardReport {
    this.firebaseExecutiveDashboardReports.set(report.projectId.toLowerCase(), report);
    return report;
  }

  public getLatestFirebaseExecutiveDashboardReport(projectId: string): FirebaseExecutiveDashboardReport | undefined {
    return this.firebaseExecutiveDashboardReports.get(projectId.toLowerCase());
  }

  // Prompt 8.1 Store Methods
  public saveMemoryManagerReport(report: MemoryManagerReport): MemoryManagerReport {
    this.memoryManagerReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMemoryManagerReport(workspaceId: string): MemoryManagerReport | undefined {
    return this.memoryManagerReports.get(workspaceId.toLowerCase());
  }

  public saveKnowledgeManagerReport(report: KnowledgeManagerReport): KnowledgeManagerReport {
    this.knowledgeManagerReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestKnowledgeManagerReport(workspaceId: string): KnowledgeManagerReport | undefined {
    return this.knowledgeManagerReports.get(workspaceId.toLowerCase());
  }

  public saveMemoryClassificationReport(report: MemoryClassificationReport): MemoryClassificationReport {
    this.memoryClassificationReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMemoryClassificationReport(workspaceId: string): MemoryClassificationReport | undefined {
    return this.memoryClassificationReports.get(workspaceId.toLowerCase());
  }

  // Prompt 8.2 Store Methods
  public saveMemorySearchReport(report: MemorySearchReport): MemorySearchReport {
    this.memorySearchReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMemorySearchReport(workspaceId: string): MemorySearchReport | undefined {
    return this.memorySearchReports.get(workspaceId.toLowerCase());
  }

  public saveContextRetrievalReport(report: ContextRetrievalReport): ContextRetrievalReport {
    this.contextRetrievalReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestContextRetrievalReport(workspaceId: string): ContextRetrievalReport | undefined {
    return this.contextRetrievalReports.get(workspaceId.toLowerCase());
  }

  public saveKnowledgeIndexReport(report: KnowledgeIndexReport): KnowledgeIndexReport {
    this.knowledgeIndexReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestKnowledgeIndexReport(workspaceId: string): KnowledgeIndexReport | undefined {
    return this.knowledgeIndexReports.get(workspaceId.toLowerCase());
  }

  // Prompt 8.3 Store Methods
  public saveMemoryAnalyticsReport(report: MemoryAnalyticsReport): MemoryAnalyticsReport {
    this.memoryAnalyticsReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMemoryAnalyticsReport(workspaceId: string): MemoryAnalyticsReport | undefined {
    return this.memoryAnalyticsReports.get(workspaceId.toLowerCase());
  }

  public saveKnowledgeRelationshipReport(report: KnowledgeRelationshipReport): KnowledgeRelationshipReport {
    this.knowledgeRelationshipReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestKnowledgeRelationshipReport(workspaceId: string): KnowledgeRelationshipReport | undefined {
    return this.knowledgeRelationshipReports.get(workspaceId.toLowerCase());
  }

  public saveContextIntelligenceReport(report: ContextIntelligenceReport): ContextIntelligenceReport {
    this.contextIntelligenceReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestContextIntelligenceReport(workspaceId: string): ContextIntelligenceReport | undefined {
    return this.contextIntelligenceReports.get(workspaceId.toLowerCase());
  }

  public saveMemoryExecutiveInsightsReport(report: MemoryExecutiveInsightsReport): MemoryExecutiveInsightsReport {
    this.memoryExecutiveInsightsReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMemoryExecutiveInsightsReport(workspaceId: string): MemoryExecutiveInsightsReport | undefined {
    return this.memoryExecutiveInsightsReports.get(workspaceId.toLowerCase());
  }

  // Prompt 8.4 Store Methods
  public saveMemoryLifecycleReport(report: MemoryLifecycleReport): MemoryLifecycleReport {
    this.memoryLifecycleReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMemoryLifecycleReport(workspaceId: string): MemoryLifecycleReport | undefined {
    return this.memoryLifecycleReports.get(workspaceId.toLowerCase());
  }

  public saveKnowledgeGovernanceReport(report: KnowledgeGovernanceReport): KnowledgeGovernanceReport {
    this.knowledgeGovernanceReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestKnowledgeGovernanceReport(workspaceId: string): KnowledgeGovernanceReport | undefined {
    return this.knowledgeGovernanceReports.get(workspaceId.toLowerCase());
  }

  public saveMemoryMasterExecutiveDashboardReport(report: MemoryMasterExecutiveDashboardReport): MemoryMasterExecutiveDashboardReport {
    this.memoryMasterExecutiveDashboardReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMemoryMasterExecutiveDashboardReport(workspaceId: string): MemoryMasterExecutiveDashboardReport | undefined {
    return this.memoryMasterExecutiveDashboardReports.get(workspaceId.toLowerCase());
  }

  // Prompt 9.1 Store Methods
  public saveDocumentWorkspaceReport(report: DocumentWorkspaceReport): DocumentWorkspaceReport {
    this.documentWorkspaceReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestDocumentWorkspaceReport(workspaceId: string): DocumentWorkspaceReport | undefined {
    return this.documentWorkspaceReports.get(workspaceId.toLowerCase());
  }

  // Prompt 9.2 Store Methods
  public saveDocumentIntelligenceReport(report: DocumentIntelligenceReport): DocumentIntelligenceReport {
    this.documentIntelligenceReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestDocumentIntelligenceReport(workspaceId: string): DocumentIntelligenceReport | undefined {
    return this.documentIntelligenceReports.get(workspaceId.toLowerCase());
  }

  // Prompt 9.3 Store Methods
  public saveRetrievalWorkspaceReport(report: RetrievalWorkspaceReport): RetrievalWorkspaceReport {
    this.retrievalWorkspaceReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestRetrievalWorkspaceReport(workspaceId: string): RetrievalWorkspaceReport | undefined {
    return this.retrievalWorkspaceReports.get(workspaceId.toLowerCase());
  }

  // Prompt 9.4 Store Methods
  public saveRAGExecutiveMasterReport(report: RAGExecutiveMasterReport): RAGExecutiveMasterReport {
    this.ragExecutiveMasterReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestRAGExecutiveMasterReport(workspaceId: string): RAGExecutiveMasterReport | undefined {
    return this.ragExecutiveMasterReports.get(workspaceId.toLowerCase());
  }

  // Prompt 10.1 Store Methods
  public saveMultiAgentOrchestrationMasterReport(report: MultiAgentOrchestrationMasterReport): MultiAgentOrchestrationMasterReport {
    this.multiAgentOrchestrationReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestMultiAgentOrchestrationMasterReport(workspaceId: string): MultiAgentOrchestrationMasterReport | undefined {
    return this.multiAgentOrchestrationReports.get(workspaceId.toLowerCase());
  }

  // Prompt 10.2 Store Methods
  public saveAgentTaskPlannerReport(report: AgentTaskPlannerReport): AgentTaskPlannerReport {
    this.agentTaskPlannerReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestAgentTaskPlannerReport(workspaceId: string): AgentTaskPlannerReport | undefined {
    return this.agentTaskPlannerReports.get(workspaceId.toLowerCase());
  }

  public saveAgentDelegationReport(report: AgentDelegationReport): AgentDelegationReport {
    this.agentDelegationReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestAgentDelegationReport(workspaceId: string): AgentDelegationReport | undefined {
    return this.agentDelegationReports.get(workspaceId.toLowerCase());
  }

  public saveAgentCoordinationPlan(plan: AgentCoordinationPlan): AgentCoordinationPlan {
    this.agentCoordinationPlans.set(plan.workspaceId.toLowerCase(), plan);
    return plan;
  }

  public getLatestAgentCoordinationPlan(workspaceId: string): AgentCoordinationPlan | undefined {
    return this.agentCoordinationPlans.get(workspaceId.toLowerCase());
  }

  // Prompt 10.3 Store Methods
  public saveAgentExecutionCoordinatorReport(report: AgentExecutionCoordinatorReport): AgentExecutionCoordinatorReport {
    this.agentExecutionCoordinatorReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestAgentExecutionCoordinatorReport(workspaceId: string): AgentExecutionCoordinatorReport | undefined {
    return this.agentExecutionCoordinatorReports.get(workspaceId.toLowerCase());
  }

  public saveAgentApprovalManagerReport(report: AgentApprovalManagerReport): AgentApprovalManagerReport {
    this.agentApprovalManagerReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestAgentApprovalManagerReport(workspaceId: string): AgentApprovalManagerReport | undefined {
    return this.agentApprovalManagerReports.get(workspaceId.toLowerCase());
  }

  public saveAgentHandoffManagerReport(report: AgentHandoffManagerReport): AgentHandoffManagerReport {
    this.agentHandoffManagerReports.set(report.workspaceId.toLowerCase(), report);
    return report;
  }

  public getLatestAgentHandoffManagerReport(workspaceId: string): AgentHandoffManagerReport | undefined {
    return this.agentHandoffManagerReports.get(workspaceId.toLowerCase());
  }

  public saveOrchestrationMonitoringStatus(status: OrchestrationMonitoringStatus): OrchestrationMonitoringStatus {
    this.orchestrationMonitoringStatuses.set(status.workspaceId.toLowerCase(), status);
    return status;
  }

  public getLatestOrchestrationMonitoringStatus(workspaceId: string): OrchestrationMonitoringStatus | undefined {
    return this.orchestrationMonitoringStatuses.get(workspaceId.toLowerCase());
  }

  // Prompt 11.1 Workspace & Multi-Tenant Store Methods
  public getWorkspaceProfile(workspaceId: string): WorkspaceProfile | undefined {
    return this.workspaceProfiles.get(workspaceId) || this.workspaceProfiles.get(workspaceId.toLowerCase());
  }

  public getAllWorkspaceProfiles(): WorkspaceProfile[] {
    return Array.from(this.workspaceProfiles.values());
  }

  public saveWorkspaceProfile(profile: WorkspaceProfile): WorkspaceProfile {
    this.workspaceProfiles.set(profile.id, profile);
    this.workspaceProfiles.set(profile.id.toLowerCase(), profile);
    return profile;
  }

  public getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    const list = this.workspaceMembersMap.get(workspaceId) || this.workspaceMembersMap.get(workspaceId.toLowerCase());
    return list || [];
  }

  public addWorkspaceMember(
    workspaceId: string,
    memberData: Omit<WorkspaceMember, 'id' | 'workspaceId' | 'joinedAt'>
  ): WorkspaceMember {
    const members = this.getWorkspaceMembers(workspaceId);
    const newMember: WorkspaceMember = {
      ...memberData,
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      workspaceId,
      joinedAt: new Date().toISOString()
    };
    members.push(newMember);
    this.workspaceMembersMap.set(workspaceId, members);
    this.workspaceMembersMap.set(workspaceId.toLowerCase(), members);
    return newMember;
  }

  public updateWorkspaceMemberRole(workspaceId: string, memberId: string, newRole: WorkspaceRole): WorkspaceMember | undefined {
    const members = this.getWorkspaceMembers(workspaceId);
    const member = members.find(m => m.id === memberId || m.userId === memberId);
    if (member) {
      member.role = newRole;
      this.workspaceMembersMap.set(workspaceId, members);
      this.workspaceMembersMap.set(workspaceId.toLowerCase(), members);
    }
    return member;
  }

  public removeWorkspaceMember(workspaceId: string, memberId: string): boolean {
    const members = this.getWorkspaceMembers(workspaceId);
    const initialLen = members.length;
    const filtered = members.filter(m => m.id !== memberId && m.userId !== memberId);
    if (filtered.length < initialLen) {
      this.workspaceMembersMap.set(workspaceId, filtered);
      this.workspaceMembersMap.set(workspaceId.toLowerCase(), filtered);
      return true;
    }
    return false;
  }

  public getActiveWorkspaceContext(userId: string = 'usr_ceo_001'): ActiveWorkspaceContext {
    let ctx = this.activeWorkspaceContexts.get(userId);
    if (!ctx) {
      ctx = {
        workspaceId: 'ws_enterprise_01',
        activeProjectId: 'proj_enterprise_01',
        activeUser: {
          userId,
          email: 'ceo@aistudio.io',
          name: 'Goutam (AI CEO Owner)',
          role: 'OWNER'
        },
        isIsolated: true,
        permissions: ['ALL_PERMISSIONS', 'MANAGE_WORKSPACE', 'MANAGE_MEMBERS', 'EXECUTE_AGENTS', 'DEPLOY_APPS']
      };
      this.activeWorkspaceContexts.set(userId, ctx);
    }
    return ctx;
  }

  public setActiveWorkspaceContext(userId: string, context: ActiveWorkspaceContext): ActiveWorkspaceContext {
    this.activeWorkspaceContexts.set(userId, context);
    return context;
  }

  // Prompt 11.2 Permission Audit Store Methods
  public recordPermissionAuditEvent(eventData: Omit<PermissionAuditEvent, 'id' | 'timestamp'>): PermissionAuditEvent {
    const list = this.permissionAuditEventsMap.get(eventData.workspaceId) || [];
    const event: PermissionAuditEvent = {
      ...eventData,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    list.unshift(event); // newest first
    this.permissionAuditEventsMap.set(eventData.workspaceId, list);
    this.permissionAuditEventsMap.set(eventData.workspaceId.toLowerCase(), list);
    return event;
  }

  public getPermissionAuditEvents(workspaceId: string): PermissionAuditEvent[] {
    const list = this.permissionAuditEventsMap.get(workspaceId) || this.permissionAuditEventsMap.get(workspaceId.toLowerCase());
    return list || [];
  }

  public getPermissionAuditSummary(workspaceId: string): PermissionAuditSummary {
    const events = this.getPermissionAuditEvents(workspaceId);
    const totalEvents = events.length;
    const totalGranted = events.filter(e => e.eventType === 'ACCESS_GRANTED').length;
    const totalDenied = events.filter(e => e.eventType === 'ACCESS_DENIED').length;
    const roleChangesCount = events.filter(e => e.eventType === 'ROLE_CHANGED').length;

    return {
      workspaceId,
      totalEvents,
      totalGranted,
      totalDenied,
      roleChangesCount,
      recentEvents: events.slice(0, 20),
      generatedAt: new Date().toISOString()
    };
  }

  // Prompt 11.3 Workspace Governance & Quota Store Methods
  public getWorkspaceGovernancePolicy(workspaceId: string): WorkspaceGovernancePolicy {
    const wsId = workspaceId || 'ws_default';
    const existing = this.workspaceGovernancePolicies.get(wsId) || (wsId ? this.workspaceGovernancePolicies.get(wsId.toLowerCase()) : undefined);
    if (existing) return existing;

    // Return default policy if none set
    const defaultPolicy: WorkspaceGovernancePolicy = {
      workspaceId,
      enforceStrictBlocking: true,
      autoAlertOnWarning: true,
      usageResetCycle: 'MONTHLY',
      updatedAt: new Date().toISOString(),
      limits: {
        PROJECTS: { resourceType: 'PROJECTS', limit: 10, warningThresholdPercent: 80, unit: 'projects', description: 'Maximum active projects' },
        AGENTS: { resourceType: 'AGENTS', limit: 20, warningThresholdPercent: 80, unit: 'agents', description: 'Maximum autonomous AI agent workers' },
        TASKS: { resourceType: 'TASKS', limit: 100, warningThresholdPercent: 80, unit: 'tasks', description: 'Maximum active concurrent execution tasks' },
        TOOL_EXECUTIONS: { resourceType: 'TOOL_EXECUTIONS', limit: 5000, warningThresholdPercent: 85, unit: 'executions', description: 'Monthly tool execution calls' },
        CODE_EXECUTIONS: { resourceType: 'CODE_EXECUTIONS', limit: 2000, warningThresholdPercent: 80, unit: 'runs', description: 'Code sandbox generation & execution runs' },
        DEPLOYMENTS: { resourceType: 'DEPLOYMENTS', limit: 50, warningThresholdPercent: 80, unit: 'deployments', description: 'Monthly Cloud Run & Vercel deployments' },
        KNOWLEDGE_DOCS: { resourceType: 'KNOWLEDGE_DOCS', limit: 500, warningThresholdPercent: 80, unit: 'documents', description: 'Indexed vector knowledge documents' },
        MEMORY_RECORDS: { resourceType: 'MEMORY_RECORDS', limit: 25000, warningThresholdPercent: 85, unit: 'records', description: 'Episodic memory store records' },
        STORAGE_MB: { resourceType: 'STORAGE_MB', limit: 5120, warningThresholdPercent: 85, unit: 'MB', description: 'Allocated storage volume in MB' },
        ACTIVITY_RECORDS: { resourceType: 'ACTIVITY_RECORDS', limit: 50000, warningThresholdPercent: 90, unit: 'logs', description: 'Audit and activity log entries' }
      }
    };
    this.workspaceGovernancePolicies.set(workspaceId, defaultPolicy);
    return defaultPolicy;
  }

  public saveWorkspaceGovernancePolicy(policy: WorkspaceGovernancePolicy): void {
    this.workspaceGovernancePolicies.set(policy.workspaceId, policy);
    this.workspaceGovernancePolicies.set(policy.workspaceId.toLowerCase(), policy);
  }

  public getWorkspaceUsages(workspaceId: string): Record<WorkspaceResourceType, number> {
    const wsId = workspaceId || 'ws_default';
    const existing = this.workspaceUsagesMap.get(wsId) || (wsId ? this.workspaceUsagesMap.get(wsId.toLowerCase()) : undefined);
    if (existing) return existing;

    const defaultUsages: Record<WorkspaceResourceType, number> = {
      PROJECTS: 1,
      AGENTS: 2,
      TASKS: 5,
      TOOL_EXECUTIONS: 50,
      CODE_EXECUTIONS: 20,
      DEPLOYMENTS: 2,
      KNOWLEDGE_DOCS: 10,
      MEMORY_RECORDS: 100,
      STORAGE_MB: 256,
      ACTIVITY_RECORDS: 150
    };
    this.workspaceUsagesMap.set(workspaceId, defaultUsages);
    return defaultUsages;
  }

  public incrementWorkspaceUsage(
    workspaceId: string,
    resourceType: WorkspaceResourceType,
    delta: number,
    userId?: string,
    actionContext?: string
  ): number {
    const usages = this.getWorkspaceUsages(workspaceId);
    const current = usages[resourceType] || 0;
    const newUsage = Math.max(0, current + delta);
    usages[resourceType] = newUsage;

    this.workspaceUsagesMap.set(workspaceId, usages);
    this.workspaceUsagesMap.set(workspaceId.toLowerCase(), usages);

    // Record history
    const history = this.getWorkspaceUsageHistory(workspaceId);
    history.unshift({
      timestamp: new Date().toISOString(),
      resourceType,
      delta,
      newUsage,
      triggeredByUserId: userId,
      actionContext
    });
    this.workspaceUsageHistoryMap.set(workspaceId, history.slice(0, 100)); // keep last 100

    return newUsage;
  }

  public getWorkspaceUsageAlerts(workspaceId: string): WorkspaceUsageAlert[] {
    const list = this.workspaceUsageAlertsMap.get(workspaceId) || this.workspaceUsageAlertsMap.get(workspaceId.toLowerCase());
    return list || [];
  }

  public recordWorkspaceUsageAlert(
    alertData: Omit<WorkspaceUsageAlert, 'id' | 'timestamp' | 'acknowledged'>
  ): WorkspaceUsageAlert {
    const list = this.getWorkspaceUsageAlerts(alertData.workspaceId);
    const alert: WorkspaceUsageAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    list.unshift(alert);
    this.workspaceUsageAlertsMap.set(alertData.workspaceId, list);
    return alert;
  }

  public getWorkspaceUsageHistory(workspaceId: string): WorkspaceUsageHistoryEntry[] {
    const history = this.workspaceUsageHistoryMap.get(workspaceId) || this.workspaceUsageHistoryMap.get(workspaceId.toLowerCase());
    return history || [];
  }

  private conflictReportsMap = new Map<string, AgentConflictResolutionReport>();
  private executiveDashboardReportsMap = new Map<string, ExecutiveDashboardReport>();
  private orchestrationAnalyticsReportsMap = new Map<string, OrchestrationAnalyticsReport>();
  private orchestrationGovernanceReportsMap = new Map<string, OrchestrationGovernanceReport>();

  public getLatestAgentConflictResolutionReport(workspaceId: string): AgentConflictResolutionReport | null {
    return this.conflictReportsMap.get(workspaceId) || this.conflictReportsMap.get(workspaceId.toLowerCase()) || null;
  }

  public saveAgentConflictResolutionReport(report: AgentConflictResolutionReport): void {
    this.conflictReportsMap.set(report.workspaceId, report);
    this.conflictReportsMap.set(report.workspaceId.toLowerCase(), report);
  }

  public getLatestExecutiveDashboardReport(workspaceId: string): ExecutiveDashboardReport | null {
    return this.executiveDashboardReportsMap.get(workspaceId) || this.executiveDashboardReportsMap.get(workspaceId.toLowerCase()) || null;
  }

  public saveExecutiveDashboardReport(report: ExecutiveDashboardReport): void {
    this.executiveDashboardReportsMap.set(report.workspaceId, report);
    this.executiveDashboardReportsMap.set(report.workspaceId.toLowerCase(), report);
  }

  public getLatestOrchestrationAnalyticsReport(workspaceId: string): OrchestrationAnalyticsReport | null {
    return this.orchestrationAnalyticsReportsMap.get(workspaceId) || this.orchestrationAnalyticsReportsMap.get(workspaceId.toLowerCase()) || null;
  }

  public saveOrchestrationAnalyticsReport(report: OrchestrationAnalyticsReport): void {
    this.orchestrationAnalyticsReportsMap.set(report.workspaceId, report);
    this.orchestrationAnalyticsReportsMap.set(report.workspaceId.toLowerCase(), report);
  }

  public getLatestOrchestrationGovernanceReport(workspaceId: string): OrchestrationGovernanceReport | null {
    return this.orchestrationGovernanceReportsMap.get(workspaceId) || this.orchestrationGovernanceReportsMap.get(workspaceId.toLowerCase()) || null;
  }

  public saveOrchestrationGovernanceReport(report: OrchestrationGovernanceReport): void {
    this.orchestrationGovernanceReportsMap.set(report.workspaceId, report);
    this.orchestrationGovernanceReportsMap.set(report.workspaceId.toLowerCase(), report);
  }
}

export const dbStore = new PlatformDatabaseStore();
export const db = dbStore;
