import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';
import { CodeFileEditOp } from '@/packages/types/src';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      codeProjectId,
      projectId,
      workspaceId,
      filePath,
      operation,
      newPath,
      content,
      targetString,
      replacementString,
      linePosition,
      author,
      reason
    } = body;

    if (!codeProjectId || !projectId || !workspaceId || !filePath || !operation) {
      return NextResponse.json(
        { success: false, error: 'codeProjectId, projectId, workspaceId, filePath, and operation are required.' },
        { status: 400 }
      );
    }

    const result = codeEngineService.editor.executeFileEdit({
      codeProjectId,
      projectId,
      workspaceId,
      filePath,
      operation: operation as CodeFileEditOp,
      newPath,
      content,
      targetString,
      replacementString,
      linePosition,
      author,
      reason
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      file: result.file,
      patchId: result.patchId
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed executing file edit';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
