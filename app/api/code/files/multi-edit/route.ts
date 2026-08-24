import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeProjectId, projectId, workspaceId, sessionTitle, author, reason, operations } = body;

    if (!codeProjectId || !projectId || !workspaceId || !Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'codeProjectId, projectId, workspaceId, and operations array are required.' },
        { status: 400 }
      );
    }

    const result = codeEngineService.multiEditor.executeMultiFileEdit({
      codeProjectId,
      projectId,
      workspaceId,
      sessionTitle,
      author,
      reason,
      operations
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      modifiedFiles: result.modifiedFiles,
      sessionId: result.sessionId,
      patchId: result.patchId
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed executing multi-file edit';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
