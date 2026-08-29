import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeProjectId, projectId, framework } = body;

    if (!codeProjectId || !projectId || !framework) {
      return NextResponse.json(
        { error: 'Missing required parameters: codeProjectId, projectId, framework' },
        { status: 400 }
      );
    }

    const analysis = codeEngineService.analyzeDependencies(codeProjectId, projectId, framework);
    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
