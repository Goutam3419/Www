-- Phase 14.3.3: Multi-Agent Long-Term Memory, Experience & Learning Migration

-- 1. Agent Experiences Table with Vector Embedding for Semantic Retrieval
CREATE TABLE IF NOT EXISTS agent_experiences (
  id TEXT PRIMARY KEY DEFAULT ('exp_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  agent_id TEXT,
  agent_role TEXT,
  step_id TEXT,
  event_type TEXT NOT NULL,
  input_summary TEXT NOT NULL,
  action_summary TEXT NOT NULL,
  result_summary TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_category TEXT,
  resolution TEXT,
  confidence FLOAT NOT NULL DEFAULT 0.9,
  tags TEXT[] DEFAULT '{}',
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_agent_experiences_ws ON agent_experiences(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_type ON agent_experiences(workspace_id, event_type);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_role ON agent_experiences(workspace_id, agent_role);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_success ON agent_experiences(workspace_id, success);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_err ON agent_experiences(workspace_id, error_category);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_time ON agent_experiences(workspace_id, timestamp DESC);

-- HNSW Vector Index for Experience Semantic Retrieval
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_agent_experiences_embedding ON agent_experiences USING hnsw (embedding vector_cosine_ops);';
  END IF;
END $$;

-- 2. Row Level Security (RLS) for Agent Experiences
ALTER TABLE agent_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_experiences_select_policy" ON agent_experiences;
CREATE POLICY "agent_experiences_select_policy" ON agent_experiences
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "agent_experiences_insert_policy" ON agent_experiences;
CREATE POLICY "agent_experiences_insert_policy" ON agent_experiences
  FOR INSERT
  WITH CHECK (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "agent_experiences_update_policy" ON agent_experiences;
CREATE POLICY "agent_experiences_update_policy" ON agent_experiences
  FOR UPDATE
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "agent_experiences_delete_policy" ON agent_experiences;
CREATE POLICY "agent_experiences_delete_policy" ON agent_experiences
  FOR DELETE
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN')) OR auth.role() = 'service_role'
  );

-- 3. RPC Semantic Search Function for Agent Experiences
CREATE OR REPLACE FUNCTION match_agent_experiences(
  query_embedding vector(768),
  target_workspace_id TEXT,
  target_event_type TEXT DEFAULT NULL,
  target_agent_role TEXT DEFAULT NULL,
  success_only BOOLEAN DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.4,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  workspace_id TEXT,
  workflow_id TEXT,
  project_id TEXT,
  agent_id TEXT,
  agent_role TEXT,
  step_id TEXT,
  event_type TEXT,
  input_summary TEXT,
  action_summary TEXT,
  result_summary TEXT,
  success BOOLEAN,
  error_category TEXT,
  resolution TEXT,
  confidence FLOAT,
  tags TEXT[],
  similarity FLOAT,
  metadata JSONB,
  timestamp TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Database level security check
  IF auth.role() <> 'service_role' AND NOT public.is_workspace_member(target_workspace_id) THEN
    RAISE EXCEPTION 'Access denied: User is not authorized for workspace %', target_workspace_id;
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.workspace_id,
    e.workflow_id,
    e.project_id,
    e.agent_id,
    e.agent_role,
    e.step_id,
    e.event_type,
    e.input_summary,
    e.action_summary,
    e.result_summary,
    e.success,
    e.error_category,
    e.resolution,
    e.confidence,
    e.tags,
    (1 - (e.embedding <=> query_embedding))::FLOAT AS similarity,
    e.metadata,
    e.timestamp
  FROM agent_experiences e
  WHERE e.workspace_id = target_workspace_id
    AND e.embedding IS NOT NULL
    AND (target_event_type IS NULL OR e.event_type = target_event_type)
    AND (target_agent_role IS NULL OR e.agent_role = target_agent_role)
    AND (success_only IS NULL OR e.success = success_only)
    AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Agent Performance Metrics Table
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id TEXT PRIMARY KEY DEFAULT ('apm_' || substr(md5(random()::text), 1, 12)),
  agent_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  tasks_completed INT NOT NULL DEFAULT 0,
  tasks_failed INT NOT NULL DEFAULT 0,
  success_rate FLOAT NOT NULL DEFAULT 1.0,
  avg_execution_time_ms FLOAT NOT NULL DEFAULT 0,
  review_approval_rate FLOAT NOT NULL DEFAULT 1.0,
  handoff_success_rate FLOAT NOT NULL DEFAULT 1.0,
  self_healing_success_rate FLOAT NOT NULL DEFAULT 1.0,
  total_tokens_used BIGINT NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, workspace_id)
);

ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_perf_select_policy" ON agent_performance_metrics;
CREATE POLICY "agent_perf_select_policy" ON agent_performance_metrics
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "agent_perf_all_policy" ON agent_performance_metrics;
CREATE POLICY "agent_perf_all_policy" ON agent_performance_metrics
  FOR ALL
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

-- 5. Tool Reliability Metrics Table
CREATE TABLE IF NOT EXISTS tool_reliability_metrics (
  id TEXT PRIMARY KEY DEFAULT ('trm_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  success_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  success_rate FLOAT NOT NULL DEFAULT 1.0,
  avg_latency_ms FLOAT NOT NULL DEFAULT 0,
  recent_health TEXT NOT NULL DEFAULT 'HEALTHY',
  failure_categories JSONB DEFAULT '{}'::jsonb,
  workspace_specific_failures JSONB DEFAULT '{}'::jsonb,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, tool_id)
);

ALTER TABLE tool_reliability_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tool_rel_select_policy" ON tool_reliability_metrics;
CREATE POLICY "tool_rel_select_policy" ON tool_reliability_metrics
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "tool_rel_all_policy" ON tool_reliability_metrics;
CREATE POLICY "tool_rel_all_policy" ON tool_reliability_metrics
  FOR ALL
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );
