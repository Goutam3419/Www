-- Phase 14.3.5: Autonomous Reliability, Recovery & Observability Migration

-- 1. Durable Workflow Checkpoints Table
CREATE TABLE IF NOT EXISTS workflow_checkpoints (
  id TEXT PRIMARY KEY DEFAULT ('chk_' || substr(md5(random()::text), 1, 12)),
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  execution_id TEXT NOT NULL,
  transition_event TEXT NOT NULL,
  step_id TEXT,
  status TEXT NOT NULL,
  step_states JSONB NOT NULL DEFAULT '{}'::jsonb,
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  agent_outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  tool_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  artifacts JSONB NOT NULL DEFAULT '{}'::jsonb,
  pending_approvals TEXT[] DEFAULT '{}',
  active_agent_assignments JSONB NOT NULL DEFAULT '{}'::jsonb,
  retry_counters JSONB NOT NULL DEFAULT '{}'::jsonb,
  replan_count INT NOT NULL DEFAULT 0,
  repair_attempts_count INT NOT NULL DEFAULT 0,
  checksum TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_checkpoints_wf ON workflow_checkpoints(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_checkpoints_ws ON workflow_checkpoints(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_checkpoints_exec ON workflow_checkpoints(execution_id, timestamp DESC);

ALTER TABLE workflow_checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_checkpoints_select_policy" ON workflow_checkpoints;
CREATE POLICY "workflow_checkpoints_select_policy" ON workflow_checkpoints
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "workflow_checkpoints_insert_policy" ON workflow_checkpoints;
CREATE POLICY "workflow_checkpoints_insert_policy" ON workflow_checkpoints
  FOR INSERT
  WITH CHECK (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "workflow_checkpoints_update_policy" ON workflow_checkpoints;
CREATE POLICY "workflow_checkpoints_update_policy" ON workflow_checkpoints
  FOR UPDATE
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "workflow_checkpoints_delete_policy" ON workflow_checkpoints;
CREATE POLICY "workflow_checkpoints_delete_policy" ON workflow_checkpoints
  FOR DELETE
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN')) OR auth.role() = 'service_role'
  );

-- 2. Idempotency & Exactly-Once Records Table
CREATE TABLE IF NOT EXISTS idempotency_records (
  id TEXT PRIMARY KEY DEFAULT ('idm_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_execution_id TEXT NOT NULL,
  step_execution_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  target_resource TEXT,
  request_payload_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (workspace_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_ws_key ON idempotency_records(workspace_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_exec ON idempotency_records(workflow_execution_id);

ALTER TABLE idempotency_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "idempotency_select_policy" ON idempotency_records;
CREATE POLICY "idempotency_select_policy" ON idempotency_records
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "idempotency_all_policy" ON idempotency_records;
CREATE POLICY "idempotency_all_policy" ON idempotency_records
  FOR ALL
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

-- 3. Circuit Breaker Metrics Table
CREATE TABLE IF NOT EXISTS circuit_breaker_metrics (
  id TEXT PRIMARY KEY DEFAULT ('cb_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  tool_id TEXT,
  state TEXT NOT NULL DEFAULT 'CLOSED',
  failure_count INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  consecutive_failures INT NOT NULL DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  next_retry_allowed_at TIMESTAMPTZ,
  cooldown_period_ms INT NOT NULL DEFAULT 30000,
  failure_threshold INT NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, provider, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_circuit_breaker_ws_prov ON circuit_breaker_metrics(workspace_id, provider);

ALTER TABLE circuit_breaker_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "circuit_breaker_select_policy" ON circuit_breaker_metrics;
CREATE POLICY "circuit_breaker_select_policy" ON circuit_breaker_metrics
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "circuit_breaker_all_policy" ON circuit_breaker_metrics;
CREATE POLICY "circuit_breaker_all_policy" ON circuit_breaker_metrics
  FOR ALL
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

-- 4. Execution Heartbeats Table
CREATE TABLE IF NOT EXISTS execution_heartbeats (
  id TEXT PRIMARY KEY DEFAULT ('hb_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  execution_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE (workspace_id, execution_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_time ON execution_heartbeats(workspace_id, last_heartbeat_at);

ALTER TABLE execution_heartbeats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "heartbeats_select_policy" ON execution_heartbeats;
CREATE POLICY "heartbeats_select_policy" ON execution_heartbeats
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "heartbeats_all_policy" ON execution_heartbeats;
CREATE POLICY "heartbeats_all_policy" ON execution_heartbeats
  FOR ALL
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

-- 5. Recovery Audit Logs Table
CREATE TABLE IF NOT EXISTS recovery_audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('rec_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  execution_id TEXT NOT NULL,
  step_id TEXT,
  event_type TEXT NOT NULL,
  failure_category TEXT,
  recovery_action TEXT NOT NULL,
  attempt_number INT NOT NULL DEFAULT 1,
  actor TEXT NOT NULL DEFAULT 'AUTONOMOUS_RECOVERY_ENGINE',
  agent TEXT,
  result TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recovery_audit_ws_time ON recovery_audit_logs(workspace_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_audit_wf ON recovery_audit_logs(workflow_id);

ALTER TABLE recovery_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recovery_audit_select_policy" ON recovery_audit_logs;
CREATE POLICY "recovery_audit_select_policy" ON recovery_audit_logs
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "recovery_audit_insert_policy" ON recovery_audit_logs;
CREATE POLICY "recovery_audit_insert_policy" ON recovery_audit_logs
  FOR INSERT
  WITH CHECK (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );
