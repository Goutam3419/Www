import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, workspaceId, projectName, framework, language, packageManager, architecture, rootPath } = body;

    if (!projectId || !workspaceId || !projectName || !framework) {
      return NextResponse.json(
        { error: 'Missing required parameters: projectId, workspaceId, projectName, framework' },
        { status: 400 }
      );
    }

    const result = codeEngineService.generateProject({
      projectId,
      workspaceId,
      projectName,
      framework,
      language,
      packageManager,
      architecture,
      rootPath
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
