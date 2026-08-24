import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeProjectId, projectId, workspaceId, folderPath } = body;

    if (!codeProjectId || !projectId || !workspaceId || !folderPath) {
      return NextResponse.json(
        { error: 'Missing required parameters: codeProjectId, projectId, workspaceId, folderPath' },
        { status: 400 }
      );
    }

    const folder = codeEngineService.generateFolder(codeProjectId, projectId, workspaceId, folderPath);
    return NextResponse.json({ folder }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
