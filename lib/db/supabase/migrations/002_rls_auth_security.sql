-- Phase 12.3: Supabase Row Level Security (RLS) & Auth Policy Migration
-- Establishes workspace-level tenant isolation across all 11 core entities.

-- Helper SQL function to check workspace membership efficiently
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id TEXT, target_user_id TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  current_usr TEXT;
BEGIN
  IF target_user_id IS NOT NULL THEN
    current_usr := target_user_id;
  ELSE
    current_usr := auth.uid()::text;
  END IF;

  IF current_usr IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = current_usr
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = ws_id AND owner_id = current_usr
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper SQL function to check workspace user role
CREATE OR REPLACE FUNCTION public.get_workspace_user_role(ws_id TEXT, target_user_id TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  current_usr TEXT;
  user_role TEXT;
BEGIN
  IF target_user_id IS NOT NULL THEN
    current_usr := target_user_id;
  ELSE
    current_usr := auth.uid()::text;
  END IF;

  SELECT role INTO user_role
  FROM public.workspace_members
  WHERE workspace_id = ws_id AND user_id = current_usr;

  IF user_role IS NULL THEN
    SELECT 'OWNER' INTO user_role
    FROM public.workspaces
    WHERE id = ws_id AND owner_id = current_usr;
  END IF;

  RETURN COALESCE(user_role, 'NONE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance Indexes for RLS policy evaluation
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws_user ON workspace_members(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_projects_ws_id ON projects(workspace_id, id);
CREATE INDEX IF NOT EXISTS idx_agents_ws_id ON agents(workspace_id, id);
CREATE INDEX IF NOT EXISTS idx_tasks_ws_id ON tasks(workspace_id, id);
CREATE INDEX IF NOT EXISTS idx_memories_ws_id ON memories(workspace_id, id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_ws_id ON tool_executions(workspace_id, id);
CREATE INDEX IF NOT EXISTS idx_deployments_ws_id ON deployments(workspace_id, id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_ws_id ON activity_logs(workspace_id, id);

-- -------------------------------------------------------------
-- 1. WORKSPACES POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_workspaces ON workspaces;
CREATE POLICY user_read_workspaces ON workspaces
  FOR SELECT
  USING (
    owner_id = auth.uid()::text OR
    public.is_workspace_member(id)
  );

DROP POLICY IF EXISTS user_insert_workspaces ON workspaces;
CREATE POLICY user_insert_workspaces ON workspaces
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS user_update_workspaces ON workspaces;
CREATE POLICY user_update_workspaces ON workspaces
  FOR UPDATE
  USING (
    owner_id = auth.uid()::text OR
    public.get_workspace_user_role(id) IN ('OWNER', 'ADMIN')
  );

DROP POLICY IF EXISTS user_delete_workspaces ON workspaces;
CREATE POLICY user_delete_workspaces ON workspaces
  FOR DELETE
  USING (
    owner_id = auth.uid()::text
  );

-- -------------------------------------------------------------
-- 2. WORKSPACE MEMBERS POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_members ON workspace_members;
CREATE POLICY user_read_members ON workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid()::text OR
    public.is_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS user_insert_members ON workspace_members;
CREATE POLICY user_insert_members ON workspace_members
  FOR INSERT
  WITH CHECK (
    public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN')
  );

DROP POLICY IF EXISTS user_update_members ON workspace_members;
CREATE POLICY user_update_members ON workspace_members
  FOR UPDATE
  USING (
    public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN')
  );

DROP POLICY IF EXISTS user_delete_members ON workspace_members;
CREATE POLICY user_delete_members ON workspace_members
  FOR DELETE
  USING (
    public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN')
  );

-- -------------------------------------------------------------
-- 3. PROJECTS POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_projects ON projects;
CREATE POLICY user_read_projects ON projects
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS user_insert_projects ON projects;
CREATE POLICY user_insert_projects ON projects
  FOR INSERT
  WITH CHECK (
    public.is_workspace_member(workspace_id) AND
    public.get_workspace_user_role(workspace_id) != 'VIEWER'
  );

DROP POLICY IF EXISTS user_update_projects ON projects;
CREATE POLICY user_update_projects ON projects
  FOR UPDATE
  USING (
    public.is_workspace_member(workspace_id) AND
    public.get_workspace_user_role(workspace_id) != 'VIEWER'
  );

DROP POLICY IF EXISTS user_delete_projects ON projects;
CREATE POLICY user_delete_projects ON projects
  FOR DELETE
  USING (
    public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN', 'MANAGER')
  );

-- -------------------------------------------------------------
-- 4. AGENTS POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_agents ON agents;
CREATE POLICY user_read_agents ON agents FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_insert_agents ON agents;
CREATE POLICY user_insert_agents ON agents FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_update_agents ON agents;
CREATE POLICY user_update_agents ON agents FOR UPDATE USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_delete_agents ON agents;
CREATE POLICY user_delete_agents ON agents FOR DELETE USING (public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN', 'MANAGER'));

-- -------------------------------------------------------------
-- 5. TASKS POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_tasks ON tasks;
CREATE POLICY user_read_tasks ON tasks FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_insert_tasks ON tasks;
CREATE POLICY user_insert_tasks ON tasks FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_update_tasks ON tasks;
CREATE POLICY user_update_tasks ON tasks FOR UPDATE USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_delete_tasks ON tasks;
CREATE POLICY user_delete_tasks ON tasks FOR DELETE USING (public.is_workspace_member(workspace_id));

-- -------------------------------------------------------------
-- 6. MEMORIES POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_memories ON memories;
CREATE POLICY user_read_memories ON memories FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_insert_memories ON memories;
CREATE POLICY user_insert_memories ON memories FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_update_memories ON memories;
CREATE POLICY user_update_memories ON memories FOR UPDATE USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_delete_memories ON memories;
CREATE POLICY user_delete_memories ON memories FOR DELETE USING (public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN', 'MANAGER'));

-- -------------------------------------------------------------
-- 7. TOOL EXECUTIONS POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_tool_executions ON tool_executions;
CREATE POLICY user_read_tool_executions ON tool_executions FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_insert_tool_executions ON tool_executions;
CREATE POLICY user_insert_tool_executions ON tool_executions FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_update_tool_executions ON tool_executions;
CREATE POLICY user_update_tool_executions ON tool_executions FOR UPDATE USING (public.is_workspace_member(workspace_id));

-- -------------------------------------------------------------
-- 8. DEPLOYMENTS POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_deployments ON deployments;
CREATE POLICY user_read_deployments ON deployments FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_insert_deployments ON deployments;
CREATE POLICY user_insert_deployments ON deployments FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_update_deployments ON deployments;
CREATE POLICY user_update_deployments ON deployments FOR UPDATE USING (public.is_workspace_member(workspace_id));

-- -------------------------------------------------------------
-- 9. ACTIVITY LOGS POLICIES (Append-only protection)
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_activity_logs ON activity_logs;
CREATE POLICY user_read_activity_logs ON activity_logs FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_insert_activity_logs ON activity_logs;
CREATE POLICY user_insert_activity_logs ON activity_logs FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

-- Note: No UPDATE or DELETE policies created for normal users on activity_logs to enforce append-only security!

-- -------------------------------------------------------------
-- 10. GOVERNANCE POLICIES POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_governance ON governance_policies;
CREATE POLICY user_read_governance ON governance_policies FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_update_governance ON governance_policies;
CREATE POLICY user_update_governance ON governance_policies FOR UPDATE USING (
  public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN')
);

-- -------------------------------------------------------------
-- 11. RESOURCE QUOTAS POLICIES
-- -------------------------------------------------------------
DROP POLICY IF EXISTS user_read_quotas ON resource_quotas;
CREATE POLICY user_read_quotas ON resource_quotas FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS user_update_quotas ON resource_quotas;
CREATE POLICY user_update_quotas ON resource_quotas FOR UPDATE USING (
  public.get_workspace_user_role(workspace_id) IN ('OWNER', 'ADMIN')
);
