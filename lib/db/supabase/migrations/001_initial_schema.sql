-- Phase 12.1: Supabase PostgreSQL Initial Migration
-- Platform Relational Database Foundation Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY DEFAULT ('ws_' || substr(md5(random()::text), 1, 12)),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL DEFAULT 'usr_ceo_001',
  tier TEXT NOT NULL DEFAULT 'Starter',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status);

-- 2. Workspace Members Table
CREATE TABLE IF NOT EXISTS workspace_members (
  id TEXT PRIMARY KEY DEFAULT ('wsm_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Developer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_usr ON workspace_members(user_id);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT ('proj_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT NOT NULL DEFAULT 'Next.js',
  language TEXT NOT NULL DEFAULT 'TypeScript',
  status TEXT NOT NULL DEFAULT 'Planning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_ws ON projects(workspace_id);

-- 4. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY DEFAULT ('agent_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SPECIALIST',
  status TEXT NOT NULL DEFAULT 'IDLE',
  capabilities JSONB DEFAULT '[]'::jsonb,
  system_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_ws ON agents(workspace_id);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT ('task_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_ws ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(assigned_agent_id);

-- 6. Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY DEFAULT ('mem_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  key TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'FACT',
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_ws ON memories(workspace_id);

-- 7. Tool Executions Table
CREATE TABLE IF NOT EXISTS tool_executions (
  id TEXT PRIMARY KEY DEFAULT ('texec_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  executed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  input JSONB,
  output JSONB,
  error_message TEXT,
  execution_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_executions_ws ON tool_executions(workspace_id);

-- 8. Deployments Table
CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY DEFAULT ('dep_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  target TEXT NOT NULL DEFAULT 'VERCEL',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  url TEXT,
  commit_hash TEXT,
  logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_ws ON deployments(workspace_id);

-- 9. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY DEFAULT ('act_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_ws ON activity_logs(workspace_id);

-- 10. Governance Policies Table
CREATE TABLE IF NOT EXISTS governance_policies (
  id TEXT PRIMARY KEY DEFAULT ('gov_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  data_classification TEXT NOT NULL DEFAULT 'Internal',
  allowed_tool_categories JSONB DEFAULT '["GitHub", "Vercel", "Firebase", "Supabase", "System", "AI"]'::jsonb,
  require_approval_for_danger BOOLEAN NOT NULL DEFAULT TRUE,
  max_daily_token_budget INT NOT NULL DEFAULT 500000,
  ip_whitelist JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_ws ON governance_policies(workspace_id);

-- 11. Resource Quotas Table
CREATE TABLE IF NOT EXISTS resource_quotas (
  id TEXT PRIMARY KEY DEFAULT ('q_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  limit_value INT NOT NULL,
  used_value INT NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'DAILY',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, resource_type)
);

CREATE INDEX IF NOT EXISTS idx_quotas_ws ON resource_quotas(workspace_id);

-- Row Level Security (RLS) Foundation
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_quotas ENABLE ROW LEVEL SECURITY;

-- Service Role full access policies for backend services
CREATE POLICY service_role_workspaces ON workspaces FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_members ON workspace_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_projects ON projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_agents ON agents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_tasks ON tasks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_memories ON memories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_tool_executions ON tool_executions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_deployments ON deployments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_activity_logs ON activity_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_governance ON governance_policies FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_quotas ON resource_quotas FOR ALL USING (auth.role() = 'service_role');
