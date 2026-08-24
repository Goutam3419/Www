-- Phase 12.4: pgvector Vector Memory Infrastructure & RLS Policies Migration

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Vector Memories Table for Long-Term AI Vector Memory
CREATE TABLE IF NOT EXISTS vector_memories (
  id TEXT PRIMARY KEY DEFAULT ('vmem_' || substr(md5(random()::text), 1, 12)),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  key TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'FACT',
  tags TEXT[] DEFAULT '{}',
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vector_memories_ws ON vector_memories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vector_memories_key ON vector_memories(workspace_id, key);
CREATE INDEX IF NOT EXISTS idx_vector_memories_type ON vector_memories(workspace_id, type);

-- HNSW Vector Cosine Similarity Index (768 dimensions)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vector_memories_embedding ON vector_memories USING hnsw (embedding vector_cosine_ops);';
  END IF;
END $$;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE vector_memories ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies for Vector Memories
DROP POLICY IF EXISTS "vector_memories_select_policy" ON vector_memories;
CREATE POLICY "vector_memories_select_policy" ON vector_memories
  FOR SELECT
  USING (
    public.is_workspace_member(workspace_id) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "vector_memories_insert_policy" ON vector_memories;
CREATE POLICY "vector_memories_insert_policy" ON vector_memories
  FOR INSERT
  WITH CHECK (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "vector_memories_update_policy" ON vector_memories;
CREATE POLICY "vector_memories_update_policy" ON vector_memories
  FOR UPDATE
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN', 'MEMBER', 'DEVELOPER', 'LEAD')) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "vector_memories_delete_policy" ON vector_memories;
CREATE POLICY "vector_memories_delete_policy" ON vector_memories
  FOR DELETE
  USING (
    (public.get_workspace_member_role(workspace_id) IN ('OWNER', 'ADMIN')) OR auth.role() = 'service_role'
  );

-- 5. RPC Similarity Search Function with Database-Level Workspace Isolation
CREATE OR REPLACE FUNCTION match_workspace_memories(
  query_embedding vector(768),
  target_workspace_id TEXT,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  workspace_id TEXT,
  project_id TEXT,
  key TEXT,
  content TEXT,
  type TEXT,
  tags TEXT[],
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ
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
    v.id,
    v.workspace_id,
    v.project_id,
    v.key,
    v.content,
    v.type,
    v.tags,
    (1 - (v.embedding <=> query_embedding))::FLOAT AS similarity,
    v.metadata,
    v.created_at
  FROM vector_memories v
  WHERE v.workspace_id = target_workspace_id
    AND v.embedding IS NOT NULL
    AND (1 - (v.embedding <=> query_embedding)) >= match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
