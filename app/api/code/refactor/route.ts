import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      codeProjectId,
      projectId,
      workspaceId,
      refactorType,
      targetFilePath,
      secondaryFilePath,
      symbolOldName,
      symbolNewName,
      extractedName,
      extractedCode,
      author
    } = body;

    if (!codeProjectId || !projectId || !workspaceId || !refactorType || !targetFilePath) {
      return NextResponse.json(
        { success: false, error: 'codeProjectId, projectId, workspaceId, refactorType, and targetFilePath are required.' },
        { status: 400 }
      );
    }

    const result = codeEngineService.refactoring.executeRefactor({
      codeProjectId,
      projectId,
      workspaceId,
      refactorType,
      targetFilePath,
      secondaryFilePath,
      symbolOldName,
      symbolNewName,
      extractedName,
      extractedCode,
      author
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      patchId: result.patchId,
      message: result.message
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed executing refactor';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
