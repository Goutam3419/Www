import { NextRequest, NextResponse } from 'next/server';
import { getRepositories, getActiveDatabaseMode } from '@/lib/db/repositories';
import { getAuthenticatedUser, verifyWorkspaceAccess } from '@/lib/auth/server-auth';
import { embeddingProvider } from '@/services/ai/embeddings';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const type = searchParams.get('type') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const searchQuery = searchParams.get('search') || undefined;
    const threshold = parseFloat(searchParams.get('threshold') || '0.3');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const access = await verifyWorkspaceAccess(user.userId, workspaceId);
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    const repos = getRepositories();
    const memories = await repos.memories.query(workspaceId, { type, tag });

    // Vector Similarity Search if search parameter is present
    if (searchQuery) {
      const searchVec = await embeddingProvider.generateEmbedding(searchQuery);

      // Perform cosine similarity scoring against memories with embeddings or content match
      const scored = memories.map((m) => {
        let score = 0;
        if (m.embedding && m.embedding.length === searchVec.embedding.length) {
          // Cosine similarity
          let dot = 0;
          let normA = 0;
          let normB = 0;
          for (let i = 0; i < searchVec.embedding.length; i++) {
            dot += searchVec.embedding[i] * m.embedding[i];
            normA += searchVec.embedding[i] * searchVec.embedding[i];
            normB += m.embedding[i] * m.embedding[i];
          }
          score = dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
        } else {
          // Fallback keyword scoring
          const contentLower = m.content.toLowerCase();
          const queryLower = searchQuery.toLowerCase();
          if (contentLower.includes(queryLower)) score = 0.85;
          else if (m.key.toLowerCase().includes(queryLower)) score = 0.75;
          else score = 0.1;
        }
        return { memory: m, similarity: Math.max(0, Math.min(1, score)) };
      });

      const filtered = scored
        .filter((s) => s.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return NextResponse.json({
        success: true,
        mode: getActiveDatabaseMode(),
        query: searchQuery,
        embeddingModel: searchVec.model,
        vectorDimension: searchVec.dimension,
        totalMatches: filtered.length,
        data: filtered.map((f) => ({
          ...f.memory,
          similarity: parseFloat(f.similarity.toFixed(4)),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      data: memories,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch memories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthenticated request' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId = 'ws_enterprise_01', projectId, key, content, type = 'FACT', tags = [] } = body;
    if (!key || !content) {
      return NextResponse.json({ success: false, error: 'Memory key and content are required' }, { status: 400 });
    }

    const access = await verifyWorkspaceAccess(user.userId, workspaceId, 'MEMBER');
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 403 });
    }

    // Generate vector embedding
    const vectorRes = await embeddingProvider.generateEmbedding(content);

    const repos = getRepositories();
    const record = await repos.memories.create({
      workspaceId,
      projectId,
      key,
      content,
      type,
      tags,
      embedding: vectorRes.embedding,
    });

    return NextResponse.json({
      success: true,
      mode: getActiveDatabaseMode(),
      vectorGenerated: true,
      vectorDimension: vectorRes.dimension,
      model: vectorRes.model,
      data: record,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create memory';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


