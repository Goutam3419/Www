import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeProjectId, projectId, workspaceId, rollbackType, targetPatchId, filePath, targetTimestamp, author, reason } = body;

    if (!codeProjectId || !projectId || !workspaceId || !rollbackType) {
      return NextResponse.json(
        { success: false, error: 'codeProjectId, projectId, workspaceId, and rollbackType are required.' },
        { status: 400 }
      );
    }

    const result = codeEngineService.rollback.executeRollback({
      codeProjectId,
      projectId,
      workspaceId,
      rollbackType,
      targetPatchId,
      filePath,
      targetTimestamp,
      author,
      reason
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      rolledBackFiles: result.rolledBackFiles,
      message: result.message
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed executing rollback';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
