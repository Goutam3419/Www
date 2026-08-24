import {
  WorkspaceProfile,
  WorkspaceMember,
  Project,
  Workflow,
  WorkflowExecution,
  WorkflowEvent,
  AgentExperienceRecord,
  ExperienceQueryFilter,
  AgentPerformanceMetrics,
  ToolReliabilityRecord,
  WorkflowCheckpoint,
  IdempotencyRecord,
  CircuitBreakerRecord,
  HeartbeatRecord,
  RecoveryAuditRecord,
} from '@/packages/types/src';

export interface IWorkflowRepository {
  get(id: string): Promise<Workflow | null>;
  listByWorkspace(workspaceId: string): Promise<Workflow[]>;
  create(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }): Promise<Workflow>;
  update(id: string, data: Partial<Workflow>): Promise<Workflow | null>;
  delete(id: string): Promise<boolean>;
  createExecution(data: Omit<WorkflowExecution, 'id' | 'startedAt' | 'updatedAt'> & { id?: string }): Promise<WorkflowExecution>;
  getExecution(id: string): Promise<WorkflowExecution | null>;
  updateExecution(id: string, data: Partial<WorkflowExecution>): Promise<WorkflowExecution | null>;
  logEvent(event: Omit<WorkflowEvent, 'id' | 'timestamp'> & { id?: string }): Promise<WorkflowEvent>;
  listEvents(workflowId: string): Promise<WorkflowEvent[]>;
}

export interface IWorkspaceRepository {
  get(id: string): Promise<WorkspaceProfile | null>;
  list(): Promise<WorkspaceProfile[]>;
  create(data: Omit<WorkspaceProfile, 'id' | 'slug' | 'ownerEmail' | 'settings' | 'createdAt' | 'updatedAt'> & Partial<WorkspaceProfile>): Promise<WorkspaceProfile>;
  update(id: string, data: Partial<WorkspaceProfile>): Promise<WorkspaceProfile | null>;
  delete(id: string): Promise<boolean>;
}

export interface IWorkspaceMemberRepository {
  getByWorkspace(workspaceId: string): Promise<WorkspaceMember[]>;
  addMember(workspaceId: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt'> & Partial<WorkspaceMember>): Promise<WorkspaceMember>;
  removeMember(workspaceId: string, userId: string): Promise<boolean>;
  updateRole(workspaceId: string, userId: string, role: WorkspaceMember['role']): Promise<WorkspaceMember | null>;
}

export interface IProjectRepository {
  get(id: string): Promise<Project | null>;
  listByWorkspace(workspaceId: string): Promise<Project[]>;
  create(data: Omit<Project, 'id' | 'createdAt'> & Partial<Project>): Promise<Project>;
  update(id: string, data: Partial<Project>): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
}

export interface IAgentRecord {
  id: string;
  workspaceId: string;
  name: string;
  role: string;
  type: string;
  status: 'IDLE' | 'ACTIVE' | 'PAUSED' | 'ERROR';
  capabilities: string[];
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAgentRepository {
  get(id: string): Promise<IAgentRecord | null>;
  listByWorkspace(workspaceId: string): Promise<IAgentRecord[]>;
  create(data: Omit<IAgentRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }): Promise<IAgentRecord>;
  update(id: string, data: Partial<IAgentRecord>): Promise<IAgentRecord | null>;
  delete(id: string): Promise<boolean>;
}

export interface ITaskRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  assignedAgentId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
}

export interface ITaskRepository {
  get(id: string): Promise<ITaskRecord | null>;
  listByWorkspace(workspaceId: string): Promise<ITaskRecord[]>;
  create(data: Omit<ITaskRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }): Promise<ITaskRecord>;
  update(id: string, data: Partial<ITaskRecord>): Promise<ITaskRecord | null>;
  delete(id: string): Promise<boolean>;
}

export interface IMemoryRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  key: string;
  content: string;
  type: 'FACT' | 'DECISION' | 'CODE_SNIPPET' | 'PROJECT_CONTEXT' | 'USER_PREFERENCE';
  embedding?: number[];
  tags: string[];
  createdAt: string;
}

export interface IMemoryRepository {
  get(id: string): Promise<IMemoryRecord | null>;
  listByWorkspace(workspaceId: string): Promise<IMemoryRecord[]>;
  create(data: Omit<IMemoryRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<IMemoryRecord>;
  query(workspaceId: string, filter?: { type?: string; tag?: string }): Promise<IMemoryRecord[]>;
  delete(id: string): Promise<boolean>;
}

export interface IToolExecutionRecord {
  id: string;
  workspaceId: string;
  toolId: string;
  toolName: string;
  executedBy: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'APPROVAL_REQUIRED' | 'REJECTED';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorMessage?: string;
  executionTimeMs?: number;
  timestamp: string;
}

export interface IToolExecutionRepository {
  get(id: string): Promise<IToolExecutionRecord | null>;
  listByWorkspace(workspaceId: string, limit?: number): Promise<IToolExecutionRecord[]>;
  create(data: Omit<IToolExecutionRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<IToolExecutionRecord>;
  updateStatus(id: string, status: IToolExecutionRecord['status'], result?: { output?: Record<string, unknown>; errorMessage?: string }): Promise<IToolExecutionRecord | null>;
}

export interface IDeploymentRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  target: 'VERCEL' | 'FIREBASE' | 'DOCKER' | 'SUPABASE';
  status: 'QUEUED' | 'BUILDING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK';
  url?: string;
  commitHash?: string;
  logs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IDeploymentRepository {
  get(id: string): Promise<IDeploymentRecord | null>;
  listByWorkspace(workspaceId: string): Promise<IDeploymentRecord[]>;
  create(data: Omit<IDeploymentRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }): Promise<IDeploymentRecord>;
  update(id: string, data: Partial<IDeploymentRecord>): Promise<IDeploymentRecord | null>;
}

export interface IActivityLogRecord {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface IActivityLogRepository {
  log(event: Omit<IActivityLogRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<IActivityLogRecord>;
  listByWorkspace(workspaceId: string, limit?: number): Promise<IActivityLogRecord[]>;
}

export interface IGovernancePolicyRecord {
  id: string;
  workspaceId: string;
  dataClassification: string;
  allowedToolCategories: string[];
  requireApprovalForDanger: boolean;
  maxDailyTokenBudget: number;
  ipWhitelist: string[];
  updatedAt: string;
}

export interface IGovernanceRepository {
  getPolicy(workspaceId: string): Promise<IGovernancePolicyRecord | null>;
  updatePolicy(workspaceId: string, data: Partial<IGovernancePolicyRecord>): Promise<IGovernancePolicyRecord>;
}

export interface IResourceQuotaRecord {
  id: string;
  workspaceId: string;
  resourceType: string;
  limitValue: number;
  usedValue: number;
  period: 'DAILY' | 'MONTHLY' | 'TOTAL';
  updatedAt: string;
}

export interface IQuotaRepository {
  getQuotas(workspaceId: string): Promise<IResourceQuotaRecord[]>;
  updateUsage(workspaceId: string, resourceType: string, incrementAmount: number): Promise<IResourceQuotaRecord>;
}

export interface IAgentExperienceRepository {
  get(id: string): Promise<AgentExperienceRecord | null>;
  listByWorkspace(workspaceId: string, limit?: number): Promise<AgentExperienceRecord[]>;
  create(data: Omit<AgentExperienceRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<AgentExperienceRecord>;
  query(filter: ExperienceQueryFilter): Promise<AgentExperienceRecord[]>;
  delete(id: string): Promise<boolean>;
}

export interface IAgentPerformanceRepository {
  get(agentId: string, workspaceId: string): Promise<AgentPerformanceMetrics | null>;
  listByWorkspace(workspaceId: string): Promise<AgentPerformanceMetrics[]>;
  upsert(metrics: AgentPerformanceMetrics): Promise<AgentPerformanceMetrics>;
  recordTaskOutcome(workspaceId: string, agentId: string, success: boolean, durationMs: number, tokensUsed?: number): Promise<AgentPerformanceMetrics>;
}

export interface IToolReliabilityRepository {
  get(workspaceId: string, toolId: string): Promise<ToolReliabilityRecord | null>;
  listByWorkspace(workspaceId: string): Promise<ToolReliabilityRecord[]>;
  recordExecution(
    workspaceId: string,
    toolId: string,
    toolName: string,
    provider: ToolReliabilityRecord['provider'],
    success: boolean,
    latencyMs: number,
    errorCategory?: string
  ): Promise<ToolReliabilityRecord>;
}

export interface ICheckpointRepository {
  create(data: Omit<WorkflowCheckpoint, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<WorkflowCheckpoint>;
  get(id: string): Promise<WorkflowCheckpoint | null>;
  getLatestByExecution(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint | null>;
  listByExecution(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint[]>;
  listByWorkflow(workflowId: string, workspaceId: string): Promise<WorkflowCheckpoint[]>;
  deleteByExecution(executionId: string, workspaceId: string): Promise<boolean>;
}

export interface IIdempotencyRepository {
  get(workspaceId: string, idempotencyKey: string): Promise<IdempotencyRecord | null>;
  create(data: Omit<IdempotencyRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<IdempotencyRecord>;
  update(workspaceId: string, idempotencyKey: string, data: Partial<IdempotencyRecord>): Promise<IdempotencyRecord | null>;
  delete(workspaceId: string, idempotencyKey: string): Promise<boolean>;
}

export interface ICircuitBreakerRepository {
  get(workspaceId: string, provider: string, toolId?: string): Promise<CircuitBreakerRecord | null>;
  list(workspaceId: string): Promise<CircuitBreakerRecord[]>;
  listByWorkspace(workspaceId: string): Promise<CircuitBreakerRecord[]>;
  upsert(record: Omit<CircuitBreakerRecord, 'id' | 'updatedAt'> & { id?: string; updatedAt?: string }): Promise<CircuitBreakerRecord>;
}

export interface IHeartbeatRepository {
  upsertHeartbeat(data: Omit<HeartbeatRecord, 'id' | 'lastHeartbeatAt'> & { id?: string; lastHeartbeatAt?: string }): Promise<HeartbeatRecord>;
  get(workspaceId: string, executionId: string, entityType: string, entityId: string): Promise<HeartbeatRecord | null>;
  listExpired(workspaceId: string, expiredBeforeIso: string): Promise<HeartbeatRecord[]>;
  delete(workspaceId: string, executionId: string): Promise<boolean>;
}

export interface IRecoveryAuditRepository {
  log(record: Omit<RecoveryAuditRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<RecoveryAuditRecord>;
  list(workspaceId: string, limit?: number): Promise<RecoveryAuditRecord[]>;
  listByWorkspace(workspaceId: string, limit?: number): Promise<RecoveryAuditRecord[]>;
  listByWorkflow(workspaceId: string, workflowId: string): Promise<RecoveryAuditRecord[]>;
  listByExecution(workspaceId: string, executionId: string): Promise<RecoveryAuditRecord[]>;
}

export interface RepositorySuite {
  workspaces: IWorkspaceRepository;
  workspaceMembers: IWorkspaceMemberRepository;
  projects: IProjectRepository;
  agents: IAgentRepository;
  tasks: ITaskRepository;
  memories: IMemoryRepository;
  toolExecutions: IToolExecutionRepository;
  deployments: IDeploymentRepository;
  activityLogs: IActivityLogRepository;
  governance: IGovernanceRepository;
  quotas: IQuotaRepository;
  workflows: IWorkflowRepository;
  agentExperiences: IAgentExperienceRepository;
  agentPerformance: IAgentPerformanceRepository;
  toolReliability: IToolReliabilityRepository;
  checkpoints: ICheckpointRepository;
  idempotency: IIdempotencyRepository;
  circuitBreakers: ICircuitBreakerRepository;
  heartbeats: IHeartbeatRepository;
  recoveryAudit: IRecoveryAuditRepository;
}

