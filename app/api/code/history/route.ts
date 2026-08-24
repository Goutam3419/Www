import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeProjectId = searchParams.get('codeProjectId');
    const filePath = searchParams.get('filePath') || undefined;

    if (!codeProjectId) {
      return NextResponse.json({ success: false, error: 'codeProjectId parameter is required.' }, { status: 400 });
    }

    const patches = codeEngineService.history.getPatches(codeProjectId);
    const fileHistory = codeEngineService.history.getFileHistory(codeProjectId, filePath);
    const editSessions = codeEngineService.history.getEditSessions(codeProjectId);
    const refactorLogs = codeEngineService.history.getRefactorLogs(codeProjectId);
    const rollbackHistory = codeEngineService.rollback.getRollbackHistory(codeProjectId);

    return NextResponse.json({
      success: true,
      patches,
      fileHistory,
      editSessions,
      refactorLogs,
      rollbackHistory
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed fetching history';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
