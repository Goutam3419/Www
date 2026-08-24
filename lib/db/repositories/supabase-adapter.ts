import { getSupabaseServerClient } from '../supabase/client';
import { DatabaseQueryError, DatabaseConfigError } from '../supabase/errors';
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
  WorkflowStepCheckpointState,
  AgentRole,
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

function checkClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new DatabaseConfigError('Supabase server client is not initialized. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return client;
}

class SupabaseWorkspaceRepository implements IWorkspaceRepository {
  async get(id: string): Promise<WorkspaceProfile | null> {
    const client = checkClient();
    const { data, error } = await client.from('workspaces').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      status: data.status || 'ACTIVE',
      ownerUserId: data.owner_id || 'usr_ceo_001',
      ownerEmail: data.owner_email || 'ceo@company.com',
      settings: data.settings || {
        allowMemberInvite: true,
        maxMembers: 50,
        defaultRole: 'MEMBER',
        enforcementMode: 'STANDARD',
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async list(): Promise<WorkspaceProfile[]> {
    const client = checkClient();
    const { data, error } = await client.from('workspaces').select('*').order('created_at', { ascending: false });
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      status: row.status || 'ACTIVE',
      ownerUserId: row.owner_id || 'usr_ceo_001',
      ownerEmail: row.owner_email || 'ceo@company.com',
      settings: row.settings || {
        allowMemberInvite: true,
        maxMembers: 50,
        defaultRole: 'MEMBER',
        enforcementMode: 'STANDARD',
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async create(data: Omit<WorkspaceProfile, 'id'> & { id?: string }): Promise<WorkspaceProfile> {
    const client = checkClient();
    const payload = {
      id: data.id,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || null,
      owner_id: data.ownerUserId || 'usr_ceo_001',
      status: data.status || 'ACTIVE',
    };
    const { data: inserted, error } = await client.from('workspaces').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      name: inserted.name,
      slug: inserted.slug,
      description: inserted.description || '',
      status: inserted.status || 'ACTIVE',
      ownerUserId: inserted.owner_id || 'usr_ceo_001',
      ownerEmail: 'ceo@company.com',
      settings: {
        allowMemberInvite: true,
        maxMembers: 50,
        defaultRole: 'MEMBER',
        enforcementMode: 'STANDARD',
      },
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };
  }

  async update(id: string, data: Partial<WorkspaceProfile>): Promise<WorkspaceProfile | null> {
    const client = checkClient();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.status !== undefined) payload.status = data.status;

    const { data: updated, error } = await client.from('workspaces').update(payload).eq('id', id).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    if (!updated) return null;
    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description || '',
      status: updated.status || 'ACTIVE',
      ownerUserId: updated.owner_id || 'usr_ceo_001',
      ownerEmail: 'ceo@company.com',
      settings: {
        allowMemberInvite: true,
        maxMembers: 50,
        defaultRole: 'MEMBER',
        enforcementMode: 'STANDARD',
      },
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  }

  async delete(id: string): Promise<boolean> {
    const client = checkClient();
    const { error } = await client.from('workspaces').delete().eq('id', id);
    if (error) throw new DatabaseQueryError(error.message, error);
    return true;
  }
}

class SupabaseWorkspaceMemberRepository implements IWorkspaceMemberRepository {
  async getByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    const client = checkClient();
    const { data, error } = await client.from('workspace_members').select('*').eq('workspace_id', workspaceId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      email: row.email || 'user@workspace.com',
      name: row.name || 'Workspace Member',
      role: row.role,
      status: row.status || 'ACTIVE',
      joinedAt: row.joined_at || row.created_at,
    }));
  }

  async addMember(workspaceId: string, member: Omit<WorkspaceMember, 'id'> & { id?: string }): Promise<WorkspaceMember> {
    const client = checkClient();
    const payload = {
      id: member.id,
      workspace_id: workspaceId,
      user_id: member.userId,
      role: member.role,
    };
    const { data: inserted, error } = await client.from('workspace_members').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      userId: inserted.user_id,
      email: inserted.email || member.email || 'user@workspace.com',
      name: inserted.name || member.name || 'Workspace Member',
      role: inserted.role,
      status: inserted.status || member.status || 'ACTIVE',
      joinedAt: inserted.joined_at || inserted.created_at,
    };
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    const client = checkClient();
    const { error } = await client.from('workspace_members').delete().eq('workspace_id', workspaceId).eq('user_id', userId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return true;
  }

  async updateRole(workspaceId: string, userId: string, role: WorkspaceMember['role']): Promise<WorkspaceMember | null> {
    const client = checkClient();
    const { data: updated, error } = await client
      .from('workspace_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new DatabaseQueryError(error.message, error);
    if (!updated) return null;
    return {
      id: updated.id,
      workspaceId: updated.workspace_id,
      userId: updated.user_id,
      email: updated.email || 'user@workspace.com',
      name: updated.name || 'Workspace Member',
      role: updated.role,
      status: updated.status || 'ACTIVE',
      joinedAt: updated.joined_at || updated.created_at,
    };
  }
}

class SupabaseProjectRepository implements IProjectRepository {
  async get(id: string): Promise<Project | null> {
    const client = checkClient();
    const { data, error } = await client.from('projects').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      workspaceId: data.workspace_id,
      description: data.description || undefined,
      status: data.status,
      framework: data.framework,
      language: data.language,
      createdAt: data.created_at,
    };
  }

  async listByWorkspace(workspaceId: string): Promise<Project[]> {
    const client = checkClient();
    const { data, error } = await client.from('projects').select('*').eq('workspace_id', workspaceId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      workspaceId: row.workspace_id,
      description: row.description || undefined,
      status: row.status,
      framework: row.framework,
      language: row.language,
      createdAt: row.created_at,
    }));
  }

  async create(data: Omit<Project, 'id'> & { id?: string }): Promise<Project> {
    const client = checkClient();
    const payload = {
      id: data.id,
      workspace_id: data.workspaceId,
      name: data.name,
      description: data.description || null,
      status: data.status || 'Planning',
      framework: data.framework || 'Next.js',
      language: data.language || 'TypeScript',
    };
    const { data: inserted, error } = await client.from('projects').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      name: inserted.name,
      workspaceId: inserted.workspace_id,
      description: inserted.description || undefined,
      status: inserted.status,
      framework: inserted.framework,
      language: inserted.language,
      createdAt: inserted.created_at,
    };
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const client = checkClient();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.status !== undefined) payload.status = data.status;

    const { data: updated, error } = await client.from('projects').update(payload).eq('id', id).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    if (!updated) return null;
    return {
      id: updated.id,
      name: updated.name,
      workspaceId: updated.workspace_id,
      description: updated.description || undefined,
      status: updated.status,
      framework: updated.framework,
      language: updated.language,
      createdAt: updated.created_at,
    };
  }

  async delete(id: string): Promise<boolean> {
    const client = checkClient();
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) throw new DatabaseQueryError(error.message, error);
    return true;
  }
}

class SupabaseAgentRepository implements IAgentRepository {
  async get(id: string): Promise<IAgentRecord | null> {
    const client = checkClient();
    const { data, error } = await client.from('agents').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      name: data.name,
      role: data.role,
      type: data.type,
      status: data.status,
      capabilities: data.capabilities || [],
      systemPrompt: data.system_prompt || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async listByWorkspace(workspaceId: string): Promise<IAgentRecord[]> {
    const client = checkClient();
    const { data, error } = await client.from('agents').select('*').eq('workspace_id', workspaceId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      role: row.role,
      type: row.type,
      status: row.status,
      capabilities: row.capabilities || [],
      systemPrompt: row.system_prompt || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async create(data: Omit<IAgentRecord, 'id'> & { id?: string }): Promise<IAgentRecord> {
    const client = checkClient();
    const payload = {
      id: data.id,
      workspace_id: data.workspaceId,
      name: data.name,
      role: data.role,
      type: data.type,
      status: data.status || 'IDLE',
      capabilities: data.capabilities || [],
      system_prompt: data.systemPrompt || null,
    };
    const { data: inserted, error } = await client.from('agents').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      name: inserted.name,
      role: inserted.role,
      type: inserted.type,
      status: inserted.status,
      capabilities: inserted.capabilities || [],
      systemPrompt: inserted.system_prompt || undefined,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };
  }

  async update(id: string, data: Partial<IAgentRecord>): Promise<IAgentRecord | null> {
    const client = checkClient();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.role !== undefined) payload.role = data.role;
    if (data.status !== undefined) payload.status = data.status;
    if (data.capabilities !== undefined) payload.capabilities = data.capabilities;

    const { data: updated, error } = await client.from('agents').update(payload).eq('id', id).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    if (!updated) return null;
    return {
      id: updated.id,
      workspaceId: updated.workspace_id,
      name: updated.name,
      role: updated.role,
      type: updated.type,
      status: updated.status,
      capabilities: updated.capabilities || [],
      systemPrompt: updated.system_prompt || undefined,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  }

  async delete(id: string): Promise<boolean> {
    const client = checkClient();
    const { error } = await client.from('agents').delete().eq('id', id);
    if (error) throw new DatabaseQueryError(error.message, error);
    return true;
  }
}

class SupabaseTaskRepository implements ITaskRepository {
  async get(id: string): Promise<ITaskRecord | null> {
    const client = checkClient();
    const { data, error } = await client.from('tasks').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      projectId: data.project_id || undefined,
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      assignedAgentId: data.assigned_agent_id || undefined,
      priority: data.priority,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async listByWorkspace(workspaceId: string): Promise<ITaskRecord[]> {
    const client = checkClient();
    const { data, error } = await client.from('tasks').select('*').eq('workspace_id', workspaceId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      projectId: row.project_id || undefined,
      title: row.title,
      description: row.description || undefined,
      status: row.status,
      assignedAgentId: row.assigned_agent_id || undefined,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async create(data: Omit<ITaskRecord, 'id'> & { id?: string }): Promise<ITaskRecord> {
    const client = checkClient();
    const payload = {
      id: data.id,
      workspace_id: data.workspaceId,
      project_id: data.projectId || null,
      title: data.title,
      description: data.description || null,
      status: data.status || 'PENDING',
      assigned_agent_id: data.assignedAgentId || null,
      priority: data.priority || 'MEDIUM',
    };
    const { data: inserted, error } = await client.from('tasks').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      projectId: inserted.project_id || undefined,
      title: inserted.title,
      description: inserted.description || undefined,
      status: inserted.status,
      assignedAgentId: inserted.assigned_agent_id || undefined,
      priority: inserted.priority,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };
  }

  async update(id: string, data: Partial<ITaskRecord>): Promise<ITaskRecord | null> {
    const client = checkClient();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) payload.title = data.title;
    if (data.status !== undefined) payload.status = data.status;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.assignedAgentId !== undefined) payload.assigned_agent_id = data.assignedAgentId;

    const { data: updated, error } = await client.from('tasks').update(payload).eq('id', id).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    if (!updated) return null;
    return {
      id: updated.id,
      workspaceId: updated.workspace_id,
      projectId: updated.project_id || undefined,
      title: updated.title,
      description: updated.description || undefined,
      status: updated.status,
      assignedAgentId: updated.assigned_agent_id || undefined,
      priority: updated.priority,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  }

  async delete(id: string): Promise<boolean> {
    const client = checkClient();
    const { error } = await client.from('tasks').delete().eq('id', id);
    if (error) throw new DatabaseQueryError(error.message, error);
    return true;
  }
}

class SupabaseMemoryRepository implements IMemoryRepository {
  async get(id: string): Promise<IMemoryRecord | null> {
    const client = checkClient();
    const { data, error } = await client.from('memories').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      projectId: data.project_id || undefined,
      key: data.key,
      content: data.content,
      type: data.type,
      tags: data.tags || [],
      createdAt: data.created_at,
    };
  }

  async listByWorkspace(workspaceId: string): Promise<IMemoryRecord[]> {
    const client = checkClient();
    const { data, error } = await client.from('memories').select('*').eq('workspace_id', workspaceId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      projectId: row.project_id || undefined,
      key: row.key,
      content: row.content,
      type: row.type,
      tags: row.tags || [],
      createdAt: row.created_at,
    }));
  }

  async create(data: Omit<IMemoryRecord, 'id'> & { id?: string }): Promise<IMemoryRecord> {
    const client = checkClient();
    const payload = {
      id: data.id,
      workspace_id: data.workspaceId,
      project_id: data.projectId || null,
      key: data.key,
      content: data.content,
      type: data.type,
      tags: data.tags || [],
    };
    const { data: inserted, error } = await client.from('memories').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      projectId: inserted.project_id || undefined,
      key: inserted.key,
      content: inserted.content,
      type: inserted.type,
      tags: inserted.tags || [],
      createdAt: inserted.created_at,
    };
  }

  async query(workspaceId: string, filter?: { type?: string; tag?: string }): Promise<IMemoryRecord[]> {
    const client = checkClient();
    let query = client.from('memories').select('*').eq('workspace_id', workspaceId);
    if (filter?.type) query = query.eq('type', filter.type);
    if (filter?.tag) query = query.contains('tags', [filter.tag]);

    const { data, error } = await query;
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      projectId: row.project_id || undefined,
      key: row.key,
      content: row.content,
      type: row.type,
      tags: row.tags || [],
      createdAt: row.created_at,
    }));
  }

  async delete(id: string): Promise<boolean> {
    const client = checkClient();
    const { error } = await client.from('memories').delete().eq('id', id);
    if (error) throw new DatabaseQueryError(error.message, error);
    return true;
  }
}

class SupabaseToolExecutionRepository implements IToolExecutionRepository {
  async get(id: string): Promise<IToolExecutionRecord | null> {
    const client = checkClient();
    const { data, error } = await client.from('tool_executions').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      toolId: data.tool_id,
      toolName: data.tool_name,
      executedBy: data.executed_by,
      status: data.status,
      input: data.input || undefined,
      output: data.output || undefined,
      errorMessage: data.error_message || undefined,
      executionTimeMs: data.execution_time_ms || undefined,
      timestamp: data.created_at,
    };
  }

  async listByWorkspace(workspaceId: string, limit = 50): Promise<IToolExecutionRecord[]> {
    const client = checkClient();
    const { data, error } = await client
      .from('tool_executions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      toolId: row.tool_id,
      toolName: row.tool_name,
      executedBy: row.executed_by,
      status: row.status,
      input: row.input || undefined,
      output: row.output || undefined,
      errorMessage: row.error_message || undefined,
      executionTimeMs: row.execution_time_ms || undefined,
      timestamp: row.created_at,
    }));
  }

  async create(data: Omit<IToolExecutionRecord, 'id'> & { id?: string }): Promise<IToolExecutionRecord> {
    const client = checkClient();
    const payload = {
      id: data.id,
      workspace_id: data.workspaceId,
      tool_id: data.toolId,
      tool_name: data.toolName,
      executed_by: data.executedBy,
      status: data.status || 'PENDING',
      input: data.input || null,
      output: data.output || null,
      error_message: data.errorMessage || null,
      execution_time_ms: data.executionTimeMs || null,
    };
    const { data: inserted, error } = await client.from('tool_executions').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      toolId: inserted.tool_id,
      toolName: inserted.tool_name,
      executedBy: inserted.executed_by,
      status: inserted.status,
      input: inserted.input || undefined,
      output: inserted.output || undefined,
      errorMessage: inserted.error_message || undefined,
      executionTimeMs: inserted.execution_time_ms || undefined,
      timestamp: inserted.created_at,
    };
  }

  async updateStatus(
    id: string,
    status: IToolExecutionRecord['status'],
    result?: { output?: Record<string, unknown>; errorMessage?: string }
  ): Promise<IToolExecutionRecord | null> {
    const client = checkClient();
    const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (result?.output) payload.output = result.output;
    if (result?.errorMessage) payload.error_message = result.errorMessage;

    const { data: updated, error } = await client.from('tool_executions').update(payload).eq('id', id).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    if (!updated) return null;
    return {
      id: updated.id,
      workspaceId: updated.workspace_id,
      toolId: updated.tool_id,
      toolName: updated.tool_name,
      executedBy: updated.executed_by,
      status: updated.status,
      input: updated.input || undefined,
      output: updated.output || undefined,
      errorMessage: updated.error_message || undefined,
      executionTimeMs: updated.execution_time_ms || undefined,
      timestamp: updated.created_at,
    };
  }
}

class SupabaseDeploymentRepository implements IDeploymentRepository {
  async get(id: string): Promise<IDeploymentRecord | null> {
    const client = checkClient();
    const { data, error } = await client.from('deployments').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      projectId: data.project_id,
      target: data.target,
      status: data.status,
      url: data.url || undefined,
      commitHash: data.commit_hash || undefined,
      logs: data.logs || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async listByWorkspace(workspaceId: string): Promise<IDeploymentRecord[]> {
    const client = checkClient();
    const { data, error } = await client.from('deployments').select('*').eq('workspace_id', workspaceId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      projectId: row.project_id,
      target: row.target,
      status: row.status,
      url: row.url || undefined,
      commitHash: row.commit_hash || undefined,
      logs: row.logs || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async create(data: Omit<IDeploymentRecord, 'id'> & { id?: string }): Promise<IDeploymentRecord> {
    const client = checkClient();
    const payload = {
      id: data.id,
      workspace_id: data.workspaceId,
      project_id: data.projectId,
      target: data.target,
      status: data.status || 'QUEUED',
      url: data.url || null,
      commit_hash: data.commitHash || null,
      logs: data.logs || [],
    };
    const { data: inserted, error } = await client.from('deployments').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      projectId: inserted.project_id,
      target: inserted.target,
      status: inserted.status,
      url: inserted.url || undefined,
      commitHash: inserted.commit_hash || undefined,
      logs: inserted.logs || [],
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };
  }

  async update(id: string, data: Partial<IDeploymentRecord>): Promise<IDeploymentRecord | null> {
    const client = checkClient();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status !== undefined) payload.status = data.status;
    if (data.url !== undefined) payload.url = data.url;
    if (data.logs !== undefined) payload.logs = data.logs;

    const { data: updated, error } = await client.from('deployments').update(payload).eq('id', id).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    if (!updated) return null;
    return {
      id: updated.id,
      workspaceId: updated.workspace_id,
      projectId: updated.project_id,
      target: updated.target,
      status: updated.status,
      url: updated.url || undefined,
      commitHash: updated.commit_hash || undefined,
      logs: updated.logs || [],
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  }
}

class SupabaseActivityLogRepository implements IActivityLogRepository {
  async log(event: Omit<IActivityLogRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<IActivityLogRecord> {
    const client = checkClient();
    const payload = {
      id: event.id,
      workspace_id: event.workspaceId,
      user_id: event.userId,
      action: event.action,
      details: event.details || null,
    };
    const { data: inserted, error } = await client.from('activity_logs').insert(payload).select().single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      userId: inserted.user_id,
      action: inserted.action,
      details: inserted.details || undefined,
      timestamp: inserted.created_at,
    };
  }

  async listByWorkspace(workspaceId: string, limit = 50): Promise<IActivityLogRecord[]> {
    const client = checkClient();
    const { data, error } = await client
      .from('activity_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      action: row.action,
      details: row.details || undefined,
      timestamp: row.created_at,
    }));
  }
}

class SupabaseGovernanceRepository implements IGovernanceRepository {
  async getPolicy(workspaceId: string): Promise<IGovernancePolicyRecord | null> {
    const client = checkClient();
    const { data, error } = await client.from('governance_policies').select('*').eq('workspace_id', workspaceId).single();
    if (error && error.code !== 'PGRST116') throw new DatabaseQueryError(error.message, error);
    if (!data) return null;
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      dataClassification: data.data_classification,
      allowedToolCategories: data.allowed_tool_categories || [],
      requireApprovalForDanger: data.require_approval_for_danger,
      maxDailyTokenBudget: data.max_daily_token_budget,
      ipWhitelist: data.ip_whitelist || [],
      updatedAt: data.updated_at,
    };
  }

  async updatePolicy(workspaceId: string, data: Partial<IGovernancePolicyRecord>): Promise<IGovernancePolicyRecord> {
    const client = checkClient();
    const payload = {
      workspace_id: workspaceId,
      data_classification: data.dataClassification,
      allowed_tool_categories: data.allowedToolCategories,
      require_approval_for_danger: data.requireApprovalForDanger,
      max_daily_token_budget: data.maxDailyTokenBudget,
      ip_whitelist: data.ipWhitelist,
      updated_at: new Date().toISOString(),
    };
    const { data: upserted, error } = await client
      .from('governance_policies')
      .upsert(payload, { onConflict: 'workspace_id' })
      .select()
      .single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: upserted.id,
      workspaceId: upserted.workspace_id,
      dataClassification: upserted.data_classification,
      allowedToolCategories: upserted.allowed_tool_categories || [],
      requireApprovalForDanger: upserted.require_approval_for_danger,
      maxDailyTokenBudget: upserted.max_daily_token_budget,
      ipWhitelist: upserted.ip_whitelist || [],
      updatedAt: upserted.updated_at,
    };
  }
}

class SupabaseQuotaRepository implements IQuotaRepository {
  async getQuotas(workspaceId: string): Promise<IResourceQuotaRecord[]> {
    const client = checkClient();
    const { data, error } = await client.from('resource_quotas').select('*').eq('workspace_id', workspaceId);
    if (error) throw new DatabaseQueryError(error.message, error);
    return (data || []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      resourceType: row.resource_type,
      limitValue: row.limit_value,
      usedValue: row.used_value,
      period: row.period,
      updatedAt: row.updated_at,
    }));
  }

  async updateUsage(workspaceId: string, resourceType: string, incrementAmount: number): Promise<IResourceQuotaRecord> {
    const quotas = await this.getQuotas(workspaceId);
    const existing = quotas.find((q) => q.resourceType === resourceType);
    const client = checkClient();

    const newUsed = (existing?.usedValue || 0) + incrementAmount;
    const payload = {
      workspace_id: workspaceId,
      resource_type: resourceType,
      limit_value: existing?.limitValue || 10000,
      used_value: newUsed,
      period: existing?.period || 'DAILY',
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await client
      .from('resource_quotas')
      .upsert(payload, { onConflict: 'workspace_id,resource_type' })
      .select()
      .single();
    if (error) throw new DatabaseQueryError(error.message, error);
    return {
      id: updated.id,
      workspaceId: updated.workspace_id,
      resourceType: updated.resource_type,
      limitValue: updated.limit_value,
      usedValue: updated.used_value,
      period: updated.period,
      updatedAt: updated.updated_at,
    };
  }
}

class SupabaseWorkflowRepository implements IWorkflowRepository {
  private fallbackMap = new Map<string, Workflow>();
  private fallbackExecutions = new Map<string, WorkflowExecution>();
  private fallbackEvents = new Map<string, WorkflowEvent[]>();

  async get(id: string): Promise<Workflow | null> {
    try {
      const client = checkClient();
      const { data, error } = await client.from('workflows').select('*').eq('id', id).single();
      if (error || !data) return this.fallbackMap.get(id) || null;
      return {
        id: data.id,
        workspaceId: data.workspace_id,
        projectId: data.project_id,
        name: data.name,
        description: data.description,
        status: data.status,
        steps: data.steps || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch {
      return this.fallbackMap.get(id) || null;
    }
  }

  async listByWorkspace(workspaceId: string): Promise<Workflow[]> {
    try {
      const client = checkClient();
      const { data, error } = await client.from('workflows').select('*').eq('workspace_id', workspaceId);
      if (error || !data) {
        return Array.from(this.fallbackMap.values()).filter((w) => w.workspaceId === workspaceId);
      }
      return data.map((row) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        projectId: row.project_id,
        name: row.name,
        description: row.description,
        status: row.status,
        steps: row.steps || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return Array.from(this.fallbackMap.values()).filter((w) => w.workspaceId === workspaceId);
    }
  }

  async create(
    data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }
  ): Promise<Workflow> {
    const id = data.id || `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const wf: Workflow = {
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
    try {
      const client = checkClient();
      await client.from('workflows').insert({
        id: wf.id,
        workspace_id: wf.workspaceId,
        project_id: wf.projectId,
        name: wf.name,
        description: wf.description,
        status: wf.status,
        steps: wf.steps,
        created_at: wf.createdAt,
        updated_at: wf.updatedAt,
      });
    } catch {
      // Fallback
    }
    this.fallbackMap.set(id, wf);
    return wf;
  }

  async update(id: string, data: Partial<Workflow>): Promise<Workflow | null> {
    const existing = await this.get(id);
    if (!existing) return null;
    const updated: Workflow = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    try {
      const client = checkClient();
      await client
        .from('workflows')
        .update({
          name: updated.name,
          description: updated.description,
          status: updated.status,
          steps: updated.steps,
          updated_at: updated.updatedAt,
        })
        .eq('id', id);
    } catch {
      // Fallback
    }
    this.fallbackMap.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    try {
      const client = checkClient();
      await client.from('workflows').delete().eq('id', id);
    } catch {
      // Fallback
    }
    return this.fallbackMap.delete(id);
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
    this.fallbackExecutions.set(id, exec);
    return exec;
  }

  async getExecution(id: string): Promise<WorkflowExecution | null> {
    return this.fallbackExecutions.get(id) || null;
  }

  async updateExecution(id: string, data: Partial<WorkflowExecution>): Promise<WorkflowExecution | null> {
    const existing = this.fallbackExecutions.get(id);
    if (!existing) return null;
    const updated: WorkflowExecution = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.fallbackExecutions.set(id, updated);
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
    const list = this.fallbackEvents.get(eventData.workflowId) || [];
    list.push(event);
    this.fallbackEvents.set(eventData.workflowId, list);
    return event;
  }

  async listEvents(workflowId: string): Promise<WorkflowEvent[]> {
    return this.fallbackEvents.get(workflowId) || [];
  }
}

class SupabaseAgentExperienceRepository implements IAgentExperienceRepository {
  private fallbackStore = new Map<string, AgentExperienceRecord>();

  async get(id: string): Promise<AgentExperienceRecord | null> {
    const client = getSupabaseServerClient();
    if (!client) return this.fallbackStore.get(id) || null;

    try {
      const { data, error } = await client
        .from('agent_experiences')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return this.fallbackStore.get(id) || null;
      return this.mapToRecord(data);
    } catch {
      return this.fallbackStore.get(id) || null;
    }
  }

  async listByWorkspace(workspaceId: string, limit = 50): Promise<AgentExperienceRecord[]> {
    const client = getSupabaseServerClient();
    if (!client) {
      return Array.from(this.fallbackStore.values())
        .filter((e) => e.workspaceId === workspaceId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    try {
      const { data, error } = await client
        .from('agent_experiences')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error || !data) {
        return Array.from(this.fallbackStore.values()).filter((e) => e.workspaceId === workspaceId).slice(0, limit);
      }
      return data.map((d: Record<string, unknown>) => this.mapToRecord(d));
    } catch {
      return Array.from(this.fallbackStore.values()).filter((e) => e.workspaceId === workspaceId).slice(0, limit);
    }
  }

  async create(data: Omit<AgentExperienceRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<AgentExperienceRecord> {
    const id = data.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: AgentExperienceRecord = {
      ...data,
      id,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('agent_experiences').insert({
          id: record.id,
          workspace_id: record.workspaceId,
          workflow_id: record.workflowId,
          project_id: record.projectId,
          agent_id: record.agentId,
          agent_role: record.agentRole,
          step_id: record.stepId,
          event_type: record.eventType,
          input_summary: record.inputSummary,
          action_summary: record.actionSummary,
          result_summary: record.resultSummary,
          success: record.success,
          error_category: record.errorCategory,
          resolution: record.resolution,
          confidence: record.confidence,
          tags: record.tags,
          embedding: record.embedding,
          metadata: record.metadata,
          timestamp: record.timestamp,
        });
      } catch (err) {
        console.warn('Supabase agent experience insert fallback to memory:', err);
      }
    }

    this.fallbackStore.set(id, record);
    return record;
  }

  async query(filter: ExperienceQueryFilter): Promise<AgentExperienceRecord[]> {
    const client = getSupabaseServerClient();
    if (!client) {
      return Array.from(this.fallbackStore.values()).filter((e) => {
        if (e.workspaceId !== filter.workspaceId) return false;
        if (filter.eventType && e.eventType !== filter.eventType) return false;
        if (filter.agentRole && e.agentRole !== filter.agentRole) return false;
        if (filter.successOnly !== undefined && e.success !== filter.successOnly) return false;
        if (filter.errorCategory && e.errorCategory !== filter.errorCategory) return false;
        if (filter.minConfidence !== undefined && e.confidence < filter.minConfidence) return false;
        return true;
      }).slice(0, filter.limit || 50);
    }

    try {
      let query = client.from('agent_experiences').select('*').eq('workspace_id', filter.workspaceId);
      if (filter.eventType) query = query.eq('event_type', filter.eventType);
      if (filter.agentRole) query = query.eq('agent_role', filter.agentRole);
      if (filter.successOnly !== undefined) query = query.eq('success', filter.successOnly);
      if (filter.errorCategory) query = query.eq('error_category', filter.errorCategory);
      if (filter.minConfidence !== undefined) query = query.gte('confidence', filter.minConfidence);

      const { data, error } = await query.order('timestamp', { ascending: false }).limit(filter.limit || 50);
      if (error || !data) {
        return Array.from(this.fallbackStore.values()).filter((e) => e.workspaceId === filter.workspaceId).slice(0, filter.limit || 50);
      }
      return data.map((d: Record<string, unknown>) => this.mapToRecord(d));
    } catch {
      return Array.from(this.fallbackStore.values()).filter((e) => e.workspaceId === filter.workspaceId).slice(0, filter.limit || 50);
    }
  }

  async delete(id: string): Promise<boolean> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('agent_experiences').delete().eq('id', id);
      } catch {
        // ignore
      }
    }
    return this.fallbackStore.delete(id);
  }

  private mapToRecord(d: Record<string, unknown>): AgentExperienceRecord {
    return {
      id: String(d.id),
      workspaceId: String(d.workspace_id),
      workflowId: d.workflow_id ? String(d.workflow_id) : undefined,
      projectId: d.project_id ? String(d.project_id) : undefined,
      agentId: d.agent_id ? String(d.agent_id) : undefined,
      agentRole: d.agent_role as AgentExperienceRecord['agentRole'],
      stepId: d.step_id ? String(d.step_id) : undefined,
      eventType: d.event_type as AgentExperienceRecord['eventType'],
      inputSummary: String(d.input_summary || ''),
      actionSummary: String(d.action_summary || ''),
      resultSummary: String(d.result_summary || ''),
      success: Boolean(d.success),
      errorCategory: d.error_category ? String(d.error_category) : undefined,
      resolution: d.resolution ? String(d.resolution) : undefined,
      confidence: Number(d.confidence || 0.8),
      tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
      metadata: (d.metadata as Record<string, unknown>) || {},
      timestamp: String(d.timestamp || new Date().toISOString()),
    };
  }
}

class SupabaseAgentPerformanceRepository implements IAgentPerformanceRepository {
  private fallbackStore = new Map<string, AgentPerformanceMetrics>();

  async get(agentId: string, workspaceId: string): Promise<AgentPerformanceMetrics | null> {
    const key = `${workspaceId}_${agentId}`;
    const client = getSupabaseServerClient();
    if (!client) return this.fallbackStore.get(key) || null;

    try {
      const { data, error } = await client
        .from('agent_performance_metrics')
        .select('*')
        .eq('agent_id', agentId)
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      if (error || !data) return this.fallbackStore.get(key) || null;
      return this.mapToRecord(data);
    } catch {
      return this.fallbackStore.get(key) || null;
    }
  }

  async listByWorkspace(workspaceId: string): Promise<AgentPerformanceMetrics[]> {
    const client = getSupabaseServerClient();
    if (!client) {
      return Array.from(this.fallbackStore.values()).filter((p) => p.workspaceId === workspaceId);
    }

    try {
      const { data, error } = await client
        .from('agent_performance_metrics')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error || !data) {
        return Array.from(this.fallbackStore.values()).filter((p) => p.workspaceId === workspaceId);
      }
      return data.map((d: Record<string, unknown>) => this.mapToRecord(d));
    } catch {
      return Array.from(this.fallbackStore.values()).filter((p) => p.workspaceId === workspaceId);
    }
  }

  async upsert(metrics: AgentPerformanceMetrics): Promise<AgentPerformanceMetrics> {
    const key = `${metrics.workspaceId}_${metrics.agentId}`;
    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('agent_performance_metrics').upsert({
          agent_id: metrics.agentId,
          workspace_id: metrics.workspaceId,
          role: metrics.role,
          tasks_completed: metrics.tasksCompleted,
          tasks_failed: metrics.tasksFailed,
          success_rate: metrics.successRate,
          avg_execution_time_ms: metrics.avgExecutionTimeMs,
          review_approval_rate: metrics.reviewApprovalRate,
          handoff_success_rate: metrics.handoffSuccessRate,
          self_healing_success_rate: metrics.selfHealingSuccessRate,
          total_tokens_used: metrics.totalTokensUsed,
          last_active_at: metrics.lastActiveAt,
          updated_at: metrics.updatedAt,
        });
      } catch (err) {
        console.warn('Supabase agent performance upsert fallback to memory:', err);
      }
    }
    this.fallbackStore.set(key, metrics);
    return metrics;
  }

  async recordTaskOutcome(
    workspaceId: string,
    agentId: string,
    success: boolean,
    durationMs: number,
    tokensUsed = 0
  ): Promise<AgentPerformanceMetrics> {
    const existing = (await this.get(agentId, workspaceId)) || {
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

    return this.upsert(updated);
  }

  private mapToRecord(d: Record<string, unknown>): AgentPerformanceMetrics {
    return {
      agentId: String(d.agent_id),
      workspaceId: String(d.workspace_id),
      role: d.role as AgentPerformanceMetrics['role'],
      tasksCompleted: Number(d.tasks_completed || 0),
      tasksFailed: Number(d.tasks_failed || 0),
      successRate: Number(d.success_rate ?? 1.0),
      avgExecutionTimeMs: Number(d.avg_execution_time_ms || 0),
      reviewApprovalRate: Number(d.review_approval_rate ?? 1.0),
      handoffSuccessRate: Number(d.handoff_success_rate ?? 1.0),
      selfHealingSuccessRate: Number(d.self_healing_success_rate ?? 1.0),
      totalTokensUsed: Number(d.total_tokens_used || 0),
      lastActiveAt: String(d.last_active_at || new Date().toISOString()),
      updatedAt: String(d.updated_at || new Date().toISOString()),
    };
  }
}

class SupabaseToolReliabilityRepository implements IToolReliabilityRepository {
  private fallbackStore = new Map<string, ToolReliabilityRecord>();

  async get(workspaceId: string, toolId: string): Promise<ToolReliabilityRecord | null> {
    const key = `${workspaceId}_${toolId}`;
    const client = getSupabaseServerClient();
    if (!client) return this.fallbackStore.get(key) || null;

    try {
      const { data, error } = await client
        .from('tool_reliability_metrics')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('tool_id', toolId)
        .maybeSingle();

      if (error || !data) return this.fallbackStore.get(key) || null;
      return this.mapToRecord(data);
    } catch {
      return this.fallbackStore.get(key) || null;
    }
  }

  async listByWorkspace(workspaceId: string): Promise<ToolReliabilityRecord[]> {
    const client = getSupabaseServerClient();
    if (!client) {
      return Array.from(this.fallbackStore.values()).filter((t) => t.workspaceId === workspaceId);
    }

    try {
      const { data, error } = await client
        .from('tool_reliability_metrics')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error || !data) {
        return Array.from(this.fallbackStore.values()).filter((t) => t.workspaceId === workspaceId);
      }
      return data.map((d: Record<string, unknown>) => this.mapToRecord(d));
    } catch {
      return Array.from(this.fallbackStore.values()).filter((t) => t.workspaceId === workspaceId);
    }
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
    const existing = (await this.get(workspaceId, toolId)) || {
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

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('tool_reliability_metrics').upsert({
          id: updated.id,
          workspace_id: updated.workspaceId,
          provider: updated.provider,
          tool_id: updated.toolId,
          tool_name: updated.toolName,
          success_count: updated.successCount,
          failure_count: updated.failureCount,
          success_rate: updated.successRate,
          avg_latency_ms: updated.avgLatencyMs,
          recent_health: updated.recentHealth,
          failure_categories: updated.failureCategories,
          workspace_specific_failures: updated.workspaceSpecificFailures,
          last_success_at: updated.lastSuccessAt,
          last_failure_at: updated.lastFailureAt,
          updated_at: updated.updatedAt,
        });
      } catch (err) {
        console.warn('Supabase tool reliability upsert fallback to memory:', err);
      }
    }

    this.fallbackStore.set(key, updated);
    return updated;
  }

  private mapToRecord(d: Record<string, unknown>): ToolReliabilityRecord {
    return {
      id: String(d.id),
      workspaceId: String(d.workspace_id),
      provider: d.provider as ToolReliabilityRecord['provider'],
      toolId: String(d.tool_id),
      toolName: String(d.tool_name),
      successCount: Number(d.success_count || 0),
      failureCount: Number(d.failure_count || 0),
      successRate: Number(d.success_rate ?? 1.0),
      avgLatencyMs: Number(d.avg_latency_ms || 0),
      recentHealth: (d.recent_health as ToolReliabilityRecord['recentHealth']) || 'HEALTHY',
      failureCategories: typeof d.failure_categories === 'object' && d.failure_categories !== null ? (d.failure_categories as Record<string, number>) : {},
      workspaceSpecificFailures: typeof d.workspace_specific_failures === 'object' && d.workspace_specific_failures !== null ? (d.workspace_specific_failures as Record<string, number>) : {},
      lastSuccessAt: d.last_success_at ? String(d.last_success_at) : undefined,
      lastFailureAt: d.last_failure_at ? String(d.last_failure_at) : undefined,
      updatedAt: String(d.updated_at || new Date().toISOString()),
    };
  }
}

// Phase 14.3.5 Supabase Repositories

class SupabaseCheckpointRepository implements ICheckpointRepository {
  private fallbackStore = new Map<string, WorkflowCheckpoint>();

  async create(data: Omit<WorkflowCheckpoint, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<WorkflowCheckpoint> {
    const id = data.id || `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = data.timestamp || new Date().toISOString();
    const checkpoint: WorkflowCheckpoint = {
      ...data,
      id,
      timestamp,
    };

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('workflow_checkpoints').insert({
          id: checkpoint.id,
          workflow_id: checkpoint.workflowId,
          workspace_id: checkpoint.workspaceId,
          execution_id: checkpoint.executionId,
          transition_event: checkpoint.transitionEvent,
          step_id: checkpoint.stepId || null,
          status: checkpoint.status,
          step_states: checkpoint.stepStates,
          variables: checkpoint.variables,
          agent_outputs: checkpoint.agentOutputs,
          tool_results: checkpoint.toolResults,
          artifacts: checkpoint.artifacts,
          pending_approvals: checkpoint.pendingApprovals,
          active_agent_assignments: checkpoint.activeAgentAssignments,
          retry_counters: checkpoint.retryCounters,
          replan_count: checkpoint.replanCount,
          repair_attempts_count: checkpoint.repairAttemptsCount,
          checksum: checkpoint.checksum,
          metadata: checkpoint.metadata || {},
          timestamp: checkpoint.timestamp,
        });
      } catch (err) {
        console.warn('Supabase checkpoint insert fallback to memory:', err);
      }
    }

    this.fallbackStore.set(checkpoint.id, checkpoint);
    return checkpoint;
  }

  async get(id: string): Promise<WorkflowCheckpoint | null> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client.from('workflow_checkpoints').select('*').eq('id', id).single();
        if (!error && data) return this.mapToRecord(data);
      } catch (err) {
        console.warn('Supabase checkpoint get fallback to memory:', err);
      }
    }
    return this.fallbackStore.get(id) || null;
  }

  async getLatestByExecution(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint | null> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('workflow_checkpoints')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('execution_id', executionId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        if (!error && data) return this.mapToRecord(data);
      } catch (err) {
        console.warn('Supabase checkpoint getLatest fallback to memory:', err);
      }
    }
    const matching = Array.from(this.fallbackStore.values())
      .filter((c) => c.executionId === executionId && c.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return matching[0] || null;
  }

  async listByExecution(executionId: string, workspaceId: string): Promise<WorkflowCheckpoint[]> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('workflow_checkpoints')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('execution_id', executionId)
          .order('timestamp', { ascending: true });
        if (!error && data) return data.map(this.mapToRecord);
      } catch (err) {
        console.warn('Supabase checkpoint listByExecution fallback to memory:', err);
      }
    }
    return Array.from(this.fallbackStore.values())
      .filter((c) => c.executionId === executionId && c.workspaceId === workspaceId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async listByWorkflow(workflowId: string, workspaceId: string): Promise<WorkflowCheckpoint[]> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('workflow_checkpoints')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('workflow_id', workflowId)
          .order('timestamp', { ascending: true });
        if (!error && data) return data.map(this.mapToRecord);
      } catch (err) {
        console.warn('Supabase checkpoint listByWorkflow fallback to memory:', err);
      }
    }
    return Array.from(this.fallbackStore.values())
      .filter((c) => c.workflowId === workflowId && c.workspaceId === workspaceId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async deleteByExecution(executionId: string, workspaceId: string): Promise<boolean> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client
          .from('workflow_checkpoints')
          .delete()
          .eq('workspace_id', workspaceId)
          .eq('execution_id', executionId);
      } catch (err) {
        console.warn('Supabase checkpoint delete fallback to memory:', err);
      }
    }
    let deleted = false;
    for (const [id, c] of this.fallbackStore.entries()) {
      if (c.executionId === executionId && c.workspaceId === workspaceId) {
        this.fallbackStore.delete(id);
        deleted = true;
      }
    }
    return deleted;
  }

  private mapToRecord(d: Record<string, unknown>): WorkflowCheckpoint {
    return {
      id: String(d.id),
      workflowId: String(d.workflow_id),
      workspaceId: String(d.workspace_id),
      executionId: String(d.execution_id),
      transitionEvent: d.transition_event as WorkflowCheckpoint['transitionEvent'],
      stepId: d.step_id ? String(d.step_id) : undefined,
      status: d.status as WorkflowCheckpoint['status'],
      stepStates: (d.step_states as Record<string, WorkflowStepCheckpointState>) || {},
      variables: (d.variables as Record<string, unknown>) || {},
      agentOutputs: (d.agent_outputs as Record<string, unknown>) || {},
      toolResults: (d.tool_results as Record<string, unknown>) || {},
      artifacts: (d.artifacts as Record<string, unknown>) || {},
      pendingApprovals: Array.isArray(d.pending_approvals) ? (d.pending_approvals as string[]) : [],
      activeAgentAssignments: (d.active_agent_assignments as Record<string, { agentId: string; role: AgentRole }>) || {},
      retryCounters: (d.retry_counters as Record<string, number>) || {},
      replanCount: Number(d.replan_count || 0),
      repairAttemptsCount: Number(d.repair_attempts_count || 0),
      checksum: String(d.checksum),
      metadata: (d.metadata as Record<string, unknown>) || {},
      timestamp: String(d.timestamp),
    };
  }
}

class SupabaseIdempotencyRepository implements IIdempotencyRepository {
  private fallbackStore = new Map<string, IdempotencyRecord>();

  async get(workspaceId: string, idempotencyKey: string): Promise<IdempotencyRecord | null> {
    const key = `${workspaceId}_${idempotencyKey}`;
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('idempotency_records')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('idempotency_key', idempotencyKey)
          .single();
        if (!error && data) return this.mapToRecord(data);
      } catch (err) {
        console.warn('Supabase idempotency get fallback to memory:', err);
      }
    }
    return this.fallbackStore.get(key) || null;
  }

  async create(data: Omit<IdempotencyRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<IdempotencyRecord> {
    const id = data.id || `idm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = data.createdAt || new Date().toISOString();
    const key = `${data.workspaceId}_${data.idempotencyKey}`;
    const record: IdempotencyRecord = {
      ...data,
      id,
      createdAt,
    };

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('idempotency_records').insert({
          id: record.id,
          workspace_id: record.workspaceId,
          workflow_execution_id: record.workflowExecutionId,
          step_execution_id: record.stepExecutionId,
          idempotency_key: record.idempotencyKey,
          correlation_id: record.correlationId,
          operation_type: record.operationType,
          target_resource: record.targetResource || null,
          request_payload_hash: record.requestPayloadHash,
          status: record.status,
          result: record.result || null,
          error: record.error || null,
          created_at: record.createdAt,
          completed_at: record.completedAt || null,
        });
      } catch (err) {
        console.warn('Supabase idempotency insert fallback to memory:', err);
      }
    }

    this.fallbackStore.set(key, record);
    return record;
  }

  async update(workspaceId: string, idempotencyKey: string, data: Partial<IdempotencyRecord>): Promise<IdempotencyRecord | null> {
    const key = `${workspaceId}_${idempotencyKey}`;
    const existing = await this.get(workspaceId, idempotencyKey);
    if (!existing) return null;

    const updated: IdempotencyRecord = {
      ...existing,
      ...data,
    };

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client
          .from('idempotency_records')
          .update({
            status: updated.status,
            result: updated.result || null,
            error: updated.error || null,
            completed_at: updated.completedAt || null,
          })
          .eq('workspace_id', workspaceId)
          .eq('idempotency_key', idempotencyKey);
      } catch (err) {
        console.warn('Supabase idempotency update fallback to memory:', err);
      }
    }

    this.fallbackStore.set(key, updated);
    return updated;
  }

  async delete(workspaceId: string, idempotencyKey: string): Promise<boolean> {
    const key = `${workspaceId}_${idempotencyKey}`;
    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client
          .from('idempotency_records')
          .delete()
          .eq('workspace_id', workspaceId)
          .eq('idempotency_key', idempotencyKey);
      } catch (err) {
        console.warn('Supabase idempotency delete fallback to memory:', err);
      }
    }
    return this.fallbackStore.delete(key);
  }

  private mapToRecord(d: Record<string, unknown>): IdempotencyRecord {
    return {
      id: String(d.id),
      workspaceId: String(d.workspace_id),
      workflowExecutionId: String(d.workflow_execution_id),
      stepExecutionId: String(d.step_execution_id),
      idempotencyKey: String(d.idempotency_key),
      correlationId: String(d.correlation_id),
      operationType: d.operation_type as IdempotencyRecord['operationType'],
      targetResource: d.target_resource ? String(d.target_resource) : undefined,
      requestPayloadHash: String(d.request_payload_hash),
      status: d.status as IdempotencyRecord['status'],
      result: (d.result as Record<string, unknown>) || undefined,
      error: d.error ? String(d.error) : undefined,
      createdAt: String(d.created_at),
      completedAt: d.completed_at ? String(d.completed_at) : undefined,
    };
  }
}

class SupabaseCircuitBreakerRepository implements ICircuitBreakerRepository {
  private fallbackStore = new Map<string, CircuitBreakerRecord>();

  async get(workspaceId: string, provider: string, toolId?: string): Promise<CircuitBreakerRecord | null> {
    const key = `${workspaceId}_${provider}_${toolId || 'GLOBAL'}`;
    const client = getSupabaseServerClient();
    if (client) {
      try {
        let query = client
          .from('circuit_breaker_metrics')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('provider', provider);
        if (toolId) {
          query = query.eq('tool_id', toolId);
        } else {
          query = query.is('tool_id', null);
        }
        const { data, error } = await query.single();
        if (!error && data) return this.mapToRecord(data);
      } catch (err) {
        console.warn('Supabase circuit breaker get fallback to memory:', err);
      }
    }
    return this.fallbackStore.get(key) || null;
  }

  async list(workspaceId: string): Promise<CircuitBreakerRecord[]> {
    return this.listByWorkspace(workspaceId);
  }

  async listByWorkspace(workspaceId: string): Promise<CircuitBreakerRecord[]> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('circuit_breaker_metrics')
          .select('*')
          .eq('workspace_id', workspaceId);
        if (!error && data) return data.map(this.mapToRecord);
      } catch (err) {
        console.warn('Supabase circuit breaker list fallback to memory:', err);
      }
    }
    return Array.from(this.fallbackStore.values()).filter((c) => c.workspaceId === workspaceId);
  }

  async upsert(record: Omit<CircuitBreakerRecord, 'id' | 'updatedAt'> & { id?: string; updatedAt?: string }): Promise<CircuitBreakerRecord> {
    const key = `${record.workspaceId}_${record.provider}_${record.toolId || 'GLOBAL'}`;
    const id = record.id || `cb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const updatedAt = record.updatedAt || new Date().toISOString();
    const fullRecord: CircuitBreakerRecord = {
      ...record,
      id,
      updatedAt,
    };

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('circuit_breaker_metrics').upsert({
          workspace_id: fullRecord.workspaceId,
          provider: fullRecord.provider,
          tool_id: fullRecord.toolId || null,
          state: fullRecord.state,
          failure_count: fullRecord.failureCount,
          success_count: fullRecord.successCount,
          consecutive_failures: fullRecord.consecutiveFailures,
          last_failure_at: fullRecord.lastFailureAt || null,
          last_success_at: fullRecord.lastSuccessAt || null,
          next_retry_allowed_at: fullRecord.nextRetryAllowedAt || null,
          cooldown_period_ms: fullRecord.cooldownPeriodMs,
          failure_threshold: fullRecord.failureThreshold,
          updated_at: fullRecord.updatedAt,
        });
      } catch (err) {
        console.warn('Supabase circuit breaker upsert fallback to memory:', err);
      }
    }

    this.fallbackStore.set(key, fullRecord);
    return fullRecord;
  }

  private mapToRecord(d: Record<string, unknown>): CircuitBreakerRecord {
    return {
      id: String(d.id),
      workspaceId: String(d.workspace_id),
      provider: String(d.provider),
      toolId: d.tool_id ? String(d.tool_id) : undefined,
      state: d.state as CircuitBreakerRecord['state'],
      failureCount: Number(d.failure_count || 0),
      successCount: Number(d.success_count || 0),
      consecutiveFailures: Number(d.consecutive_failures || 0),
      lastFailureAt: d.last_failure_at ? String(d.last_failure_at) : undefined,
      lastSuccessAt: d.last_success_at ? String(d.last_success_at) : undefined,
      nextRetryAllowedAt: d.next_retry_allowed_at ? String(d.next_retry_allowed_at) : undefined,
      cooldownPeriodMs: Number(d.cooldown_period_ms || 30000),
      failureThreshold: Number(d.failure_threshold || 3),
      updatedAt: String(d.updated_at || new Date().toISOString()),
    };
  }
}

class SupabaseHeartbeatRepository implements IHeartbeatRepository {
  private fallbackStore = new Map<string, HeartbeatRecord>();

  async upsertHeartbeat(data: Omit<HeartbeatRecord, 'id' | 'lastHeartbeatAt'> & { id?: string; lastHeartbeatAt?: string }): Promise<HeartbeatRecord> {
    const key = `${data.workspaceId}_${data.executionId}_${data.entityType}_${data.entityId}`;
    const id = data.id || `hb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const lastHeartbeatAt = data.lastHeartbeatAt || new Date().toISOString();
    const record: HeartbeatRecord = {
      ...data,
      id,
      lastHeartbeatAt,
    };

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('execution_heartbeats').upsert({
          workspace_id: record.workspaceId,
          workflow_id: record.workflowId,
          execution_id: record.executionId,
          entity_type: record.entityType,
          entity_id: record.entityId,
          status: record.status,
          last_heartbeat_at: record.lastHeartbeatAt,
          metadata: record.metadata || {},
        });
      } catch (err) {
        console.warn('Supabase heartbeat upsert fallback to memory:', err);
      }
    }

    this.fallbackStore.set(key, record);
    return record;
  }

  async get(workspaceId: string, executionId: string, entityType: string, entityId: string): Promise<HeartbeatRecord | null> {
    const key = `${workspaceId}_${executionId}_${entityType}_${entityId}`;
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('execution_heartbeats')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('execution_id', executionId)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .single();
        if (!error && data) return this.mapToRecord(data);
      } catch (err) {
        console.warn('Supabase heartbeat get fallback to memory:', err);
      }
    }
    return this.fallbackStore.get(key) || null;
  }

  async listExpired(workspaceId: string, expiredBeforeIso: string): Promise<HeartbeatRecord[]> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('execution_heartbeats')
          .select('*')
          .eq('workspace_id', workspaceId)
          .lt('last_heartbeat_at', expiredBeforeIso);
        if (!error && data) return data.map(this.mapToRecord);
      } catch (err) {
        console.warn('Supabase heartbeat listExpired fallback to memory:', err);
      }
    }
    const expiryTime = new Date(expiredBeforeIso).getTime();
    return Array.from(this.fallbackStore.values()).filter(
      (h) => h.workspaceId === workspaceId && new Date(h.lastHeartbeatAt).getTime() <= expiryTime
    );
  }

  async delete(workspaceId: string, executionId: string): Promise<boolean> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client
          .from('execution_heartbeats')
          .delete()
          .eq('workspace_id', workspaceId)
          .eq('execution_id', executionId);
      } catch (err) {
        console.warn('Supabase heartbeat delete fallback to memory:', err);
      }
    }
    let deleted = false;
    for (const [key, val] of this.fallbackStore.entries()) {
      if (val.workspaceId === workspaceId && val.executionId === executionId) {
        this.fallbackStore.delete(key);
        deleted = true;
      }
    }
    return deleted;
  }

  private mapToRecord(d: Record<string, unknown>): HeartbeatRecord {
    return {
      id: String(d.id),
      workspaceId: String(d.workspace_id),
      workflowId: String(d.workflow_id),
      executionId: String(d.execution_id),
      entityType: d.entity_type as HeartbeatRecord['entityType'],
      entityId: String(d.entity_id),
      status: String(d.status),
      lastHeartbeatAt: String(d.last_heartbeat_at),
      metadata: (d.metadata as Record<string, unknown>) || {},
    };
  }
}

class SupabaseRecoveryAuditRepository implements IRecoveryAuditRepository {
  private fallbackStore = new Map<string, RecoveryAuditRecord>();

  async list(workspaceId: string, limit = 100): Promise<RecoveryAuditRecord[]> {
    return this.listByWorkspace(workspaceId, limit);
  }

  async log(record: Omit<RecoveryAuditRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<RecoveryAuditRecord> {
    const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = record.timestamp || new Date().toISOString();
    const fullRecord: RecoveryAuditRecord = {
      ...record,
      id,
      timestamp,
    };

    const client = getSupabaseServerClient();
    if (client) {
      try {
        await client.from('recovery_audit_logs').insert({
          id: fullRecord.id,
          workspace_id: fullRecord.workspaceId,
          workflow_id: fullRecord.workflowId,
          execution_id: fullRecord.executionId,
          step_id: fullRecord.stepId || null,
          event_type: fullRecord.eventType,
          failure_category: fullRecord.failureCategory || null,
          recovery_action: fullRecord.recoveryAction,
          attempt_number: fullRecord.attemptNumber,
          actor: fullRecord.actor,
          agent: fullRecord.agent || null,
          result: fullRecord.result,
          metadata: fullRecord.metadata || {},
          timestamp: fullRecord.timestamp,
        });
      } catch (err) {
        console.warn('Supabase recovery audit insert fallback to memory:', err);
      }
    }

    this.fallbackStore.set(id, fullRecord);
    return fullRecord;
  }

  async listByWorkspace(workspaceId: string, limit = 100): Promise<RecoveryAuditRecord[]> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('recovery_audit_logs')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('timestamp', { ascending: false })
          .limit(limit);
        if (!error && data) return data.map(this.mapToRecord);
      } catch (err) {
        console.warn('Supabase recovery audit list fallback to memory:', err);
      }
    }
    return Array.from(this.fallbackStore.values())
      .filter((r) => r.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async listByWorkflow(workspaceId: string, workflowId: string): Promise<RecoveryAuditRecord[]> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('recovery_audit_logs')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('workflow_id', workflowId)
          .order('timestamp', { ascending: false });
        if (!error && data) return data.map(this.mapToRecord);
      } catch (err) {
        console.warn('Supabase recovery audit listByWorkflow fallback to memory:', err);
      }
    }
    return Array.from(this.fallbackStore.values())
      .filter((r) => r.workspaceId === workspaceId && r.workflowId === workflowId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async listByExecution(workspaceId: string, executionId: string): Promise<RecoveryAuditRecord[]> {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('recovery_audit_logs')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('execution_id', executionId)
          .order('timestamp', { ascending: false });
        if (!error && data) return data.map(this.mapToRecord);
      } catch (err) {
        console.warn('Supabase recovery audit listByExecution fallback to memory:', err);
      }
    }
    return Array.from(this.fallbackStore.values())
      .filter((r) => r.workspaceId === workspaceId && r.executionId === executionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private mapToRecord(d: Record<string, unknown>): RecoveryAuditRecord {
    return {
      id: String(d.id),
      workspaceId: String(d.workspace_id),
      workflowId: String(d.workflow_id),
      executionId: String(d.execution_id),
      stepId: d.step_id ? String(d.step_id) : undefined,
      eventType: d.event_type as RecoveryAuditRecord['eventType'],
      failureCategory: d.failure_category as RecoveryAuditRecord['failureCategory'],
      recoveryAction: String(d.recovery_action),
      attemptNumber: Number(d.attempt_number || 1),
      actor: String(d.actor || 'AUTONOMOUS_RECOVERY_ENGINE'),
      agent: d.agent ? String(d.agent) : undefined,
      result: d.result as RecoveryAuditRecord['result'],
      metadata: (d.metadata as Record<string, unknown>) || {},
      timestamp: String(d.timestamp),
    };
  }
}

export class SupabaseAdapter {
  public suite: RepositorySuite;
  constructor() {
    this.suite = createSupabaseRepositorySuite();
  }
}

export function createSupabaseRepositorySuite(): RepositorySuite {
  return {
    workspaces: new SupabaseWorkspaceRepository(),
    workspaceMembers: new SupabaseWorkspaceMemberRepository(),
    projects: new SupabaseProjectRepository(),
    agents: new SupabaseAgentRepository(),
    tasks: new SupabaseTaskRepository(),
    memories: new SupabaseMemoryRepository(),
    toolExecutions: new SupabaseToolExecutionRepository(),
    deployments: new SupabaseDeploymentRepository(),
    activityLogs: new SupabaseActivityLogRepository(),
    governance: new SupabaseGovernanceRepository(),
    quotas: new SupabaseQuotaRepository(),
    workflows: new SupabaseWorkflowRepository(),
    agentExperiences: new SupabaseAgentExperienceRepository(),
    agentPerformance: new SupabaseAgentPerformanceRepository(),
    toolReliability: new SupabaseToolReliabilityRepository(),
    checkpoints: new SupabaseCheckpointRepository(),
    idempotency: new SupabaseIdempotencyRepository(),
    circuitBreakers: new SupabaseCircuitBreakerRepository(),
    heartbeats: new SupabaseHeartbeatRepository(),
    recoveryAudit: new SupabaseRecoveryAuditRepository(),
  };
}

