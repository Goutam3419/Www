import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeProjectId, projectId, workspaceId, name, fileType, language, folderPath } = body;

    if (!codeProjectId || !projectId || !workspaceId || !name || !fileType || !language) {
      return NextResponse.json(
        { error: 'Missing required parameters: codeProjectId, projectId, workspaceId, name, fileType, language' },
        { status: 400 }
      );
    }

    const file = codeEngineService.generateFile(
      codeProjectId,
      projectId,
      workspaceId,
      { name, fileType, language, framework: 'Next.js' },
      folderPath || 'src'
    );

    return NextResponse.json({ file }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
