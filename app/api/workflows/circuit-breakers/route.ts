import { NextRequest, NextResponse } from 'next/server';
import { circuitBreakerEngine } from '@/services/agent-orchestration/circuit-breaker-engine';
import { getRepositorySuite } from '@/lib/db/repositories';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_default_001';

    const repos = getRepositorySuite();
    const circuitBreakers = await repos.circuitBreakers.list(workspaceId);

    return NextResponse.json({
      workspaceId,
      circuitBreakers,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId = 'ws_default_001', provider, toolId, action = 'RESET' } = body;

    if (!provider) {
      return NextResponse.json({ error: 'provider is required' }, { status: 400 });
    }

    if (action === 'RESET') {
      const record = await circuitBreakerEngine.recordSuccess(workspaceId, provider, toolId);
      return NextResponse.json({
        success: true,
        message: `Circuit breaker reset for provider '${provider}'`,
        record,
      });
    }

    if (action === 'TRIP') {
      const record = await circuitBreakerEngine.recordFailure(workspaceId, provider, toolId, 60000);
      return NextResponse.json({
        success: true,
        message: `Circuit breaker tripped manually for provider '${provider}'`,
        record,
      });
    }

    return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
