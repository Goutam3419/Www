import { dbStore } from '@/lib/db/store';
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
import {
  RepositorySuite,
  IWorkspaceRepository,
  IWorkspaceMemberRepository,
  IProjectRepository,
  IAgentRepository,
  IAgentRecord,
  ITaskRepository,
  ITaskRecord,
  IMemoryRepository,
  IMemoryRecord,
  IToolExecutionRepository,
  IToolExecutionRecord,
  IDeploymentRepository,
  IDeploymentRecord,
  IActivityLogRepository,
  IActivityLogRecord,
  IGovernanceRepository,
  IGovernancePolicyRecord,
  IQuotaRepository,
  IResourceQuotaRecord,
  IWorkflowRepository,
  IAgentExperienceRepository,
  IAgentPerformanceRepository,
  IToolReliabilityRepository,
  ICheckpointRepository,
  IIdempotencyRepository,
  ICircuitBreakerRepository,
  IHeartbeatRepository,
  IRecoveryAuditRepository,
} from './contracts';

// In-Memory storage fallbacks for entities not directly stored in dbStore
const inMemoryAgents = new Map<string, IAgentRecord>();
const inMemoryTasks = new Map<string, ITaskRecord>();
const inMemoryMemories = new Map<string, IMemoryRecord>();
const inMemoryToolExecutions = new Map<string, IToolExecutionRecord>();
const inMemoryDeployments = new Map<string, IDeploymentRecord>();
const inMemoryActivityLogs: IActivityLogRecord[] = [];
const inMemoryAgentExperiences = new Map<string, AgentExperienceRecord>();
const inMemoryAgentPerformance = new Map<string, AgentPerformanceMetrics>();
const inMemoryToolReliability = new Map<string, ToolReliabilityRecord>();
const inMemoryGovernance = new Map<string, IGovernancePolicyRecord>();
const inMemoryQuotas = new Map<string, IResourceQuotaRecord[]>();
const inMemoryWorkflows = new Map<string, Workflow>();
const inMemoryExecutions = new Map<string, WorkflowExecution>();
const inMemoryEvents = new Map<string, WorkflowEvent[]>();

class InMemoryWorkspaceRepository implements IWorkspaceRepository {
  async get(id: string): Promise<WorkspaceProfile | null> {
    return dbStore.getWorkspaceProfile(id) || null;
  }

  async list(): Promise<WorkspaceProfile[]> {
    return dbStore.getAllWorkspaceProfiles();
  }

  async create(data: Omit<WorkspaceProfile, 'id'> & { id?: string }): Promise<WorkspaceProfile> {
    const id = data.id || `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const workspace: WorkspaceProfile = {
      id,
      name: data.name || 'Untitled Workspace',
      slug: data.slug || id,
      description: data.description || 'Workspace description',
      status: data.status || 'ACTIVE',
      ownerUserId: data.ownerUserId || 'usr_ceo_001',
      ownerEmail: data.ownerEmail || 'ceo@company.com',
      settings: data.settings || {
        allowMemberInvite: true,
        maxMembers: 50,
        defaultRole: 'MEMBER',
        enforcementMode: 'STANDARD',
      },
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    dbStore.saveWorkspaceProfile(workspace);
    return workspace;
  }

  async update(id: string, data: Partial<WorkspaceProfile>): Promise<WorkspaceProfile | null> {
    const existing = dbStore.getWorkspaceProfile(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    dbStore.saveWorkspaceProfile(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = dbStore.getWorkspaceProfile(id);
    if (!existing) return false;
    dbStore.saveWorkspaceProfile({ ...existing, status: 'SUSPENDED' });
    return true;
  }
}

class InMemoryWorkspaceMemberRepository implements IWorkspaceMemberRepository {
  async getByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    return dbStore.getWorkspaceMembers(workspaceId);
  }

  async addMember(workspaceId: string, member: Omit<WorkspaceMember, 'id'> & { id?: string }): Promise<WorkspaceMember> {
    return dbStore.addWorkspaceMember(workspaceId, {
      userId: member.userId || `usr_${Date.now()}`,
      email: member.email || 'user@workspace.com',
      name: member.name || 'Workspace Member',
      role: member.role || 'MEMBER',
      status: member.status || 'ACTIVE',
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    return dbStore.removeWorkspaceMember(workspaceId, userId);
  }

  async updateRole(workspaceId: string, userId: string, role: WorkspaceMember['role']): Promise<WorkspaceMember | null> {
    return dbStore.updateWorkspaceMemberRole(workspaceId, userId, role) || null;
  }
}

class InMemoryProjectRepository implements IProjectRepository {
  async get(id: string): Promise<Project | null> {
    return dbStore.getProject(id) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<Project[]> {
    return dbStore.getProjects(workspaceId);
  }

  async create(data: Omit<Project, 'id'> & { id?: string }): Promise<Project> {
    const project = dbStore.createProject({
      name: data.name,
      workspaceId: data.workspaceId,
      description: data.description,
      framework: data.framework,
      language: data.language,
    });
    return project;
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const updated = dbStore.updateProject(id, data);
    return updated || null;
  }

  async delete(id: string): Promise<boolean> {
    return dbStore.deleteProject(id);
  }
}

class InMemoryAgentRepository implements IAgentRepository {
  async get(id: string): Promise<IAgentRecord | null> {
    return inMemoryAgents.get(id) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<IAgentRecord[]> {
    return Array.from(inMemoryAgents.values()).filter((a) => a.workspaceId === workspaceId);
  }

  async create(data: Omit<IAgentRecord, 'id'> & { id?: string }): Promise<IAgentRecord> {
    const id = data.id || `agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: IAgentRecord = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    inMemoryAgents.set(id, record);
    return record;
  }

  async update(id: string, data: Partial<IAgentRecord>): Promise<IAgentRecord | null> {
    const existing = inMemoryAgents.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    inMemoryAgents.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return inMemoryAgents.delete(id);
  }
}

class InMemoryTaskRepository implements ITaskRepository {
  async get(id: string): Promise<ITaskRecord | null> {
    return inMemoryTasks.get(id) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<ITaskRecord[]> {
    return Array.from(inMemoryTasks.values()).filter((t) => t.workspaceId === workspaceId);
  }

  async create(data: Omit<ITaskRecord, 'id'> & { id?: string }): Promise<ITaskRecord> {
    const id = data.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: ITaskRecord = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    inMemoryTasks.set(id, record);
    return record;
  }

  async update(id: string, data: Partial<ITaskRecord>): Promise<ITaskRecord | null> {
    const existing = inMemoryTasks.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    inMemoryTasks.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return inMemoryTasks.delete(id);
  }
}

class InMemoryMemoryRepository implements IMemoryRepository {
  async get(id: string): Promise<IMemoryRecord | null> {
    return inMemoryMemories.get(id) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<IMemoryRecord[]> {
    return Array.from(inMemoryMemories.values()).filter((m) => m.workspaceId === workspaceId);
  }

  async create(data: Omit<IMemoryRecord, 'id'> & { id?: string }): Promise<IMemoryRecord> {
    const id = data.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: IMemoryRecord = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    inMemoryMemories.set(id, record);
    return record;
  }

  async query(workspaceId: string, filter?: { type?: string; tag?: string }): Promise<IMemoryRecord[]> {
    return Array.from(inMemoryMemories.values()).filter((m) => {
      if (m.workspaceId !== workspaceId) return false;
      if (filter?.type && m.type !== filter.type) return false;
      if (filter?.tag && !m.tags.includes(filter.tag)) return false;
      return true;
    });
  }

  async delete(id: string): Promise<boolean> {
    return inMemoryMemories.delete(id);
  }
}

class InMemoryToolExecutionRepository implements IToolExecutionRepository {
  async get(id: string): Promise<IToolExecutionRecord | null> {
    return inMemoryToolExecutions.get(id) || null;
  }

  async listByWorkspace(workspaceId: string, limit = 50): Promise<IToolExecutionRecord[]> {
    return Array.from(inMemoryToolExecutions.values())
      .filter((e) => e.workspaceId === workspaceId)
      .slice(0, limit);
  }

  async create(data: Omit<IToolExecutionRecord, 'id'> & { id?: string }): Promise<IToolExecutionRecord> {
    const id = data.id || `texec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: IToolExecutionRecord = {
      ...data,
      id,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    inMemoryToolExecutions.set(id, record);
    return record;
  }

  async updateStatus(
    id: string,
    status: IToolExecutionRecord['status'],
    result?: { output?: Record<string, unknown>; errorMessage?: string }
  ): Promise<IToolExecutionRecord | null> {
    const existing = inMemoryToolExecutions.get(id);
    if (!existing) return null;
    const updated: IToolExecutionRecord = {
      ...existing,
      status,
      output: result?.output || existing.output,
      errorMessage: result?.errorMessage || existing.errorMessage,
    };
    inMemoryToolExecutions.set(id, updated);
    return updated;
  }
}

class InMemoryDeploymentRepository implements IDeploymentRepository {
  async get(id: string): Promise<IDeploymentRecord | null> {
    return inMemoryDeployments.get(id) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<IDeploymentRecord[]> {
    return Array.from(inMemoryDeployments.values()).filter((d) => d.workspaceId === workspaceId);
  }

  async create(data: Omit<IDeploymentRecord, 'id'> & { id?: string }): Promise<IDeploymentRecord> {
    const id = data.id || `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: IDeploymentRecord = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    inMemoryDeployments.set(id, record);
    return record;
  }

  async update(id: string, data: Partial<IDeploymentRecord>): Promise<IDeploymentRecord | null> {
    const existing = inMemoryDeployments.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    inMemoryDeployments.set(id, updated);
    return updated;
  }
}

class InMemoryActivityLogRepository implements IActivityLogRepository {
  async log(event: Omit<IActivityLogRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<IActivityLogRecord> {
    const record: IActivityLogRecord = {
      ...event,
      id: event.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    inMemoryActivityLogs.unshift(record);
    return record;
  }

  async listByWorkspace(workspaceId: string, limit = 50): Promise<IActivityLogRecord[]> {
    return inMemoryActivityLogs.filter((a) => a.workspaceId === workspaceId).slice(0, limit);
  }
}

class InMemoryGovernanceRepository implements IGovernanceRepository {
  async getPolicy(workspaceId: string): Promise<IGovernancePolicyRecord | null> {
    return (
      inMemoryGovernance.get(workspaceId) || {
        id: `gov_${workspaceId}`,
        workspaceId,
        dataClassification: 'Internal',
        allowedToolCategories: ['GitHub', 'Vercel', 'Firebase', 'Supabase', 'System', 'AI'],
        requireApprovalForDanger: true,
        maxDailyTokenBudget: 500000,
        ipWhitelist: [],
        updatedAt: new Date().toISOString(),
      }
    );
  }

  async updatePolicy(workspaceId: string, data: Partial<IGovernancePolicyRecord>): Promise<IGovernancePolicyRecord> {
    const current = (await this.getPolicy(workspaceId))!;
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    inMemoryGovernance.set(workspaceId, updated);
    return updated;
  }
}

class InMemoryQuotaRepository implements IQuotaRepository {
  async getQuotas(workspaceId: string): Promise<IResourceQuotaRecord[]> {
    return (
      inMemoryQuotas.get(workspaceId) || [
        {
          id: `q_tokens_${workspaceId}`,
          workspaceId,
          resourceType: 'TOKENS',
          limitValue: 1000000,
          usedValue: 150000,
          period: 'DAILY',
          updatedAt: new Date().toISOString(),
        },
        {
          id: `q_tools_${workspaceId}`,
          workspaceId,
          resourceType: 'TOOL_EXECUTIONS',
          limitValue: 5000,
          usedValue: 240,
          period: 'DAILY',
          updatedAt: new Date().toISOString(),
        },
      ]
    );
  }

  async updateUsage(workspaceId: string, resourceType: string, incrementAmount: number): Promise<IResourceQuotaRecord> {
    const currentQuotas = await this.getQuotas(workspaceId);
    let target = currentQuotas.find((q) => q.resourceType === resourceType);

    if (!target) {
      target = {
        id: `q_${resourceType.toLowerCase()}_${workspaceId}`,
        workspaceId,
        resourceType,
        limitValue: 10000,
        usedValue: 0,
        period: 'DAILY',
        updatedAt: new Date().toISOString(),
      };
      currentQuotas.push(target);
    }

    target.usedValue += incrementAmount;
    target.updatedAt = new Date().toISOString();
    inMemoryQuotas.set(workspaceId, currentQuotas);
    return target;
  }
}

class InMemoryWorkflowRepository implements IWorkflowRepository {
  async get(id: string): Promise<Workflow | null> {
    return inMemoryWorkflows.get(id) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<Workflow[]> {
    return Array.from(inMemoryWorkflows.values()).filter(
      (w) => w.workspaceId === workspaceId
    );
  }

  async create(
    data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }
  ): Promise<Workflow> {
    const id = data.id || `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const workflow: Workflow = {
      id,
      workspaceId: data.workspaceId,
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      status: data.status || 'DRAFT',
      steps: data.steps || [],
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    inMemoryWorkflows.set(id, workflow);
    return workflow;
  }

  async update(id: string, data: Partial<Workflow>): Promise<Workflow | null> {
    const existing = inMemoryWorkflows.get(id);
    if (!existing) return null;
    const updated: Workflow = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    inMemoryWorkflows.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return inMemoryWorkflows.delete(id);
  }

  async createExecution(
    data: Omit<WorkflowExecution, 'id' | 'startedAt' | 'updatedAt'> & { id?: string }
  ): Promise<WorkflowExecution> {
    const id = data.id || `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const exec: WorkflowExecution = {
      id,
      workflowId: data.workflowId,
      workspaceId: data.workspaceId,
      userId: data.userId,
      status: data.status || 'RUNNING',
      currentStepId: data.currentStepId,
      completedSteps: data.completedSteps || [],
      failedSteps: data.failedSteps || [],
      startedAt: now,
      updatedAt: now,
    };
    inMemoryExecutions.set(id, exec);
    return exec;
  }

  async getExecution(id: string): Promise<WorkflowExecution | null> {
    return inMemoryExecutions.get(id) || null;
  }

  async updateExecution(id: string, data: Partial<WorkflowExecution>): Promise<WorkflowExecution | null> {
    const existing = inMemoryExecutions.get(id);
    if (!existing) return null;
    const updated: WorkflowExecution = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    inMemoryExecutions.set(id, updated);
    return updated;
  }

  async logEvent(
    eventData: Omit<WorkflowEvent, 'id' | 'timestamp'> & { id?: string }
  ): Promise<WorkflowEvent> {
    const id = eventData.id || `wfe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const event: WorkflowEvent = {
      id,
      workflowId: eventData.workflowId,
      workspaceId: eventData.workspaceId,
      eventType: eventData.eventType,
      stepId: eventData.stepId,
      agentId: eventData.agentId,
      details: eventData.details,
      timestamp: new Date().toISOString(),
    };
    const list = inMemoryEvents.get(eventData.workflowId) || [];
    list.push(event);
    inMemoryEvents.set(eventData.workflowId, list);
    return event;
  }

  async listEvents(workflowId: string): Promise<WorkflowEvent[]> {
    return inMemoryEvents.get(workflowId) || [];
  }
}

class InMemoryAgentExperienceRepository implements IAgentExperienceRepository {
  async get(id: string): Promise<AgentExperienceRecord | null> {
    return inMemoryAgentExperiences.get(id) || null;
  }

  async listByWorkspace(workspaceId: string, limit = 50): Promise<AgentExperienceRecord[]> {
    return Array.from(inMemoryAgentExperiences.values())
      .filter((e) => e.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async create(data: Omit<AgentExperienceRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<AgentExperienceRecord> {
    const id = data.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: AgentExperienceRecord = {
      ...data,
      id,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    inMemoryAgentExperiences.set(id, record);
    return record;
  }

  async query(filter: ExperienceQueryFilter): Promise<AgentExperienceRecord[]> {
    return Array.from(inMemoryAgentExperiences.values()).filter((e) => {
      if (e.workspaceId !== filter.workspaceId) return false;
      if (filter.eventType && e.eventType !== filter.eventType) return false;
      if (filter.agentRole && e.agentRole !== filter.agentRole) return false;
      if (filter.successOnly !== undefined && e.success !== filter.successOnly) return false;
      if (filter.errorCategory && e.errorCategory !== filter.errorCategory) return false;
      if (filter.minConfidence !== undefined && e.confidence < filter.minConfidence) return false;
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some((t) => e.tags.includes(t));
        if (!hasTag) return false;
      }
      return true;
    }).slice(0, filter.limit || 50);
  }

  async delete(id: string): Promise<boolean> {
    return inMemoryAgentExperiences.delete(id);
  }
}

class InMemoryAgentPerformanceRepository implements IAgentPerformanceRepository {
  async get(agentId: string, workspaceId: string): Promise<AgentPerformanceMetrics | null> {
    const key = `${workspaceId}_${agentId}`;
    return inMemoryAgentPerformance.get(key) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<AgentPerformanceMetrics[]> {
    return Array.from(inMemoryAgentPerformance.values()).filter((p) => p.workspaceId === workspaceId);
  }

  async upsert(metrics: AgentPerformanceMetrics): Promise<AgentPerformanceMetrics> {
    const key = `${metrics.workspaceId}_${metrics.agentId}`;
    inMemoryAgentPerformance.set(key, metrics);
    return metrics;
  }

  async recordTaskOutcome(
    workspaceId: string,
    agentId: string,
    success: boolean,
    durationMs: number,
    tokensUsed = 0
  ): Promise<AgentPerformanceMetrics> {
    const key = `${workspaceId}_${agentId}`;
    const existing = inMemoryAgentPerformance.get(key) || {
      agentId,
      workspaceId,
      role: 'FULLSTACK_DEVELOPER_AGENT',
      tasksCompleted: 0,
      tasksFailed: 0,
      successRate: 1.0,
      avgExecutionTimeMs: 0,
      reviewApprovalRate: 1.0,
      handoffSuccessRate: 1.0,
      selfHealingSuccessRate: 1.0,
      totalTokensUsed: 0,
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const completed = success ? existing.tasksCompleted + 1 : existing.tasksCompleted;
    const failed = !success ? existing.tasksFailed + 1 : existing.tasksFailed;
    const total = completed + failed;
    const successRate = total > 0 ? completed / total : 1.0;
    const avgDuration = total > 0 ? (existing.avgExecutionTimeMs * (total - 1) + durationMs) / total : durationMs;

    const updated: AgentPerformanceMetrics = {
      ...existing,
      tasksCompleted: completed,
      tasksFailed: failed,
      successRate,
      avgExecutionTimeMs: Math.round(avgDuration),
      totalTokensUsed: existing.totalTokensUsed + tokensUsed,
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryAgentPerformance.set(key, updated);
    return updated;
  }
}

class InMemoryToolReliabilityRepository implements IToolReliabilityRepository {
  async get(workspaceId: string, toolId: string): Promise<ToolReliabilityRecord | null> {
    const key = `${workspaceId}_${toolId}`;
    return inMemoryToolReliability.get(key) || null;
  }

  async listByWorkspace(workspaceId: string): Promise<ToolReliabilityRecord[]> {
    return Array.from(inMemoryToolReliability.values()).filter((t) => t.workspaceId === workspaceId);
  }

  async recordExecution(
    workspaceId: string,
    toolId: string,
    toolName: string,
    provider: ToolReliabilityRecord['provider'],
    success: boolean,
    latencyMs: number,
    errorCategory?: string
  ): Promise<ToolReliabilityRecord> {
    const key = `${workspaceId}_${toolId}`;
    const existing = inMemoryToolReliability.get(key) || {
      id: `trm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      provider,
      toolId,
      toolName,
      successCount: 0,
      failureCount: 0,
      successRate: 1.0,
      avgLatencyMs: 0,
      recentHealth: 'HEALTHY',
      failureCategories: {},
      workspaceSpecificFailures: {},
      updatedAt: new Date().toISOString(),
    };

    const successCount = success ? existing.successCount + 1 : existing.successCount;
    const failureCount = !success ? existing.failureCount + 1 : existing.failureCount;
    const totalCalls = successCount + failureCount;
    const successRate = totalCalls > 0 ? successCount / totalCalls : 1.0;
    const avgLatencyMs = totalCalls > 0 ? (existing.avgLatencyMs * (totalCalls - 1) + latencyMs) / totalCalls : latencyMs;

    const failureCategories = { ...existing.failureCategories };
    if (!success && errorCategory) {
      failureCategories[errorCategory] = (failureCategories[errorCategory] || 0) + 1;
    }

    const workspaceFailures = { ...existing.workspaceSpecificFailures };
    if (!success) {
      workspaceFailures[workspaceId] = (workspaceFailures[workspaceId] || 0) + 1;
    }

    let recentHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE' = 'HEALTHY';
    if (successRate < 0.5) {
      recentHealth = 'CRITICAL';
    } else if (successRate < 0.8) {
      recentHealth = 'DEGRADED';
    }

    const updated: ToolReliabilityRecord = {
      ...existing,
      successCount,
      failureCount,
      successRate,
      avgLatencyMs: Math.round(avgLatencyMs),
      recentHealth,
      failureCategories,
      workspaceSpecificFailures: workspaceFailures,
      lastSuccessAt: success ? new Date().toISOString() : existing.lastSuccessAt,
      lastFailureAt: !success ? new Date().toISOString() : existing.lastFailureAt,
      updatedAt: new Date().toISOString(),
    };

    inMemoryToolReliability.set(key, updated);
    return updated;
  }
}

// Phase 14.3.5 In-Memory storage fallbacks
const inMemoryCheckpoints = new Map<string, WorkflowCheckpoint>();
const inMemoryIdempotency = new Map<string, IdempotencyRecord>();
const inMemoryCircuitBreakers = new Map<string, CircuitBreakerRecord>();
const inMemoryHeartbeats = new Map<string, HeartbeatRecord>();
const inMemoryRecoveryAudit = new Map<string, RecoveryAuditRecord>();

class InMemoryCheckpointRepository implements ICheckpointRepository {
  async create(data: Omit<WorkflowCheckpoint, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<WorkflowCheckpoint> {
    const id = data.id || `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const checkpoint: WorkflowCheckpoint = {
      ...data,
      id,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    inMemoryCheckpoints.set(id, checkpoint);
    return checkpoint;
  }

  async get(id: string): Promise<WorkflowCheckpoint | null> {
    return inMemoryCheckpoints.get(id) || null;
  }

  async getLatestByExecution(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint | null> {
    const matching = Array.from(inMemoryCheckpoints.values())
      .filter((c) => c.executionId === executionId && c.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return matching[0] || null;
  }

  async listByExecution(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint[]> {
    return Array.from(inMemoryCheckpoints.values())
      .filter((c) => c.executionId === executionId && c.workspaceId === workspaceId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async listByWorkflow(workflowId: string, workspaceId: string): Promise<WorkflowCheckpoint[]> {
    return Array.from(inMemoryCheckpoints.values())
      .filter((c) => c.workflowId === workflowId && c.workspaceId === workspaceId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async deleteByExecution(executionId: string, workspaceId: string): Promise<boolean> {
    let deleted = false;
    for (const [id, c] of inMemoryCheckpoints.entries()) {
      if (c.executionId === executionId && c.workspaceId === workspaceId) {
        inMemoryCheckpoints.delete(id);
        deleted = true;
      }
    }
    return deleted;
  }
}

class InMemoryIdempotencyRepository implements IIdempotencyRepository {
  async get(workspaceId: string, idempotencyKey: string): Promise<IdempotencyRecord | null> {
    const key = `${workspaceId}_${idempotencyKey}`;
    return inMemoryIdempotency.get(key) || null;
  }

  async create(data: Omit<IdempotencyRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<IdempotencyRecord> {
    const id = data.id || `idm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const key = `${data.workspaceId}_${data.idempotencyKey}`;
    const record: IdempotencyRecord = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    inMemoryIdempotency.set(key, record);
    return record;
  }

  async update(workspaceId: string, idempotencyKey: string, data: Partial<IdempotencyRecord>): Promise<IdempotencyRecord | null> {
    const key = `${workspaceId}_${idempotencyKey}`;
    const existing = inMemoryIdempotency.get(key);
    if (!existing) return null;
    const updated: IdempotencyRecord = {
      ...existing,
      ...data,
    };
    inMemoryIdempotency.set(key, updated);
    return updated;
  }

  async delete(workspaceId: string, idempotencyKey: string): Promise<boolean> {
    const key = `${workspaceId}_${idempotencyKey}`;
    return inMemoryIdempotency.delete(key);
  }
}

class InMemoryCircuitBreakerRepository implements ICircuitBreakerRepository {
  async get(workspaceId: string, provider: string, toolId?: string): Promise<CircuitBreakerRecord | null> {
    const key = `${workspaceId}_${provider}_${toolId || 'GLOBAL'}`;
    return inMemoryCircuitBreakers.get(key) || null;
  }

  async list(workspaceId: string): Promise<CircuitBreakerRecord[]> {
    return this.listByWorkspace(workspaceId);
  }

  async listByWorkspace(workspaceId: string): Promise<CircuitBreakerRecord[]> {
    return Array.from(inMemoryCircuitBreakers.values()).filter((c) => c.workspaceId === workspaceId);
  }

  async upsert(record: Omit<CircuitBreakerRecord, 'id' | 'updatedAt'> & { id?: string; updatedAt?: string }): Promise<CircuitBreakerRecord> {
    const key = `${record.workspaceId}_${record.provider}_${record.toolId || 'GLOBAL'}`;
    const id = record.id || `cb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullRecord: CircuitBreakerRecord = {
      ...record,
      id,
      updatedAt: record.updatedAt || new Date().toISOString(),
    };
    inMemoryCircuitBreakers.set(key, fullRecord);
    return fullRecord;
  }
}

class InMemoryHeartbeatRepository implements IHeartbeatRepository {
  async upsertHeartbeat(data: Omit<HeartbeatRecord, 'id' | 'lastHeartbeatAt'> & { id?: string; lastHeartbeatAt?: string }): Promise<HeartbeatRecord> {
    const key = `${data.workspaceId}_${data.executionId}_${data.entityType}_${data.entityId}`;
    const id = data.id || `hb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: HeartbeatRecord = {
      ...data,
      id,
      lastHeartbeatAt: data.lastHeartbeatAt || new Date().toISOString(),
    };
    inMemoryHeartbeats.set(key, record);
    return record;
  }

  async get(workspaceId: string, executionId: string, entityType: string, entityId: string): Promise<HeartbeatRecord | null> {
    const key = `${workspaceId}_${executionId}_${entityType}_${entityId}`;
    return inMemoryHeartbeats.get(key) || null;
  }

  async listExpired(workspaceId: string, expiredBeforeIso: string): Promise<HeartbeatRecord[]> {
    const expiryTime = new Date(expiredBeforeIso).getTime();
    return Array.from(inMemoryHeartbeats.values()).filter(
      (h) => h.workspaceId === workspaceId && new Date(h.lastHeartbeatAt).getTime() <= expiryTime
    );
  }

  async delete(workspaceId: string, executionId: string): Promise<boolean> {
    let deleted = false;
    for (const [key, val] of inMemoryHeartbeats.entries()) {
      if (val.workspaceId === workspaceId && val.executionId === executionId) {
        inMemoryHeartbeats.delete(key);
        deleted = true;
      }
    }
    return deleted;
  }
}

class InMemoryRecoveryAuditRepository implements IRecoveryAuditRepository {
  async log(record: Omit<RecoveryAuditRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<RecoveryAuditRecord> {
    const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullRecord: RecoveryAuditRecord = {
      ...record,
      id,
      timestamp: record.timestamp || new Date().toISOString(),
    };
    inMemoryRecoveryAudit.set(id, fullRecord);
    return fullRecord;
  }

  async list(workspaceId: string, limit = 100): Promise<RecoveryAuditRecord[]> {
    return this.listByWorkspace(workspaceId, limit);
  }

  async listByWorkspace(workspaceId: string, limit = 100): Promise<RecoveryAuditRecord[]> {
    return Array.from(inMemoryRecoveryAudit.values())
      .filter((r) => r.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async listByWorkflow(workspaceId: string, workflowId: string): Promise<RecoveryAuditRecord[]> {
    return Array.from(inMemoryRecoveryAudit.values())
      .filter((r) => r.workspaceId === workspaceId && r.workflowId === workflowId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async listByExecution(workspaceId: string, executionId: string): Promise<RecoveryAuditRecord[]> {
    return Array.from(inMemoryRecoveryAudit.values())
      .filter((r) => r.workspaceId === workspaceId && r.executionId === executionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export function createInMemoryRepositorySuite(): RepositorySuite {
  return {
    workspaces: new InMemoryWorkspaceRepository(),
    workspaceMembers: new InMemoryWorkspaceMemberRepository(),
    projects: new InMemoryProjectRepository(),
    agents: new InMemoryAgentRepository(),
    tasks: new InMemoryTaskRepository(),
    memories: new InMemoryMemoryRepository(),
    toolExecutions: new InMemoryToolExecutionRepository(),
    deployments: new InMemoryDeploymentRepository(),
    activityLogs: new InMemoryActivityLogRepository(),
    governance: new InMemoryGovernanceRepository(),
    quotas: new InMemoryQuotaRepository(),
    workflows: new InMemoryWorkflowRepository(),
    agentExperiences: new InMemoryAgentExperienceRepository(),
    agentPerformance: new InMemoryAgentPerformanceRepository(),
    toolReliability: new InMemoryToolReliabilityRepository(),
    checkpoints: new InMemoryCheckpointRepository(),
    idempotency: new InMemoryIdempotencyRepository(),
    circuitBreakers: new InMemoryCircuitBreakerRepository(),
    heartbeats: new InMemoryHeartbeatRepository(),
    recoveryAudit: new InMemoryRecoveryAuditRepository(),
  };
}

