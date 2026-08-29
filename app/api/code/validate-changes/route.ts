import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';
import { CodeConflictIssue } from '@/packages/types/src';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filePath, content, fileType, workspaceId, projectId, codeProjectId } = body;

    if (!filePath || content === undefined || !workspaceId || !projectId) {
      return NextResponse.json(
        { success: false, error: 'filePath, content, workspaceId, and projectId are required.' },
        { status: 400 }
      );
    }

    const validation = codeEngineService.validator.validateEdit({
      filePath,
      content,
      fileType,
      workspaceId,
      projectId
    });

    let conflicts: CodeConflictIssue[] = [];
    if (codeProjectId) {
      conflicts = codeEngineService.conflicts.detectConflicts(codeProjectId);
    }

    return NextResponse.json({
      success: true,
      valid: validation.valid,
      issues: validation.issues,
      conflicts
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed validating code changes';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
