import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patchId, beforeText, afterText } = body;

    if (patchId) {
      const diffs = codeEngineService.diffs.getDiffsForPatch(patchId);
      const { patch } = codeEngineService.patches.getPatchDetails(patchId);
      return NextResponse.json({ success: true, patch, diffs });
    }

    if (beforeText !== undefined && afterText !== undefined) {
      const diffResult = codeEngineService.diffs.computeDiff(beforeText, afterText);
      return NextResponse.json({ success: true, ...diffResult });
    }

    return NextResponse.json(
      { success: false, error: 'Provide patchId or beforeText and afterText' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed computing code diff';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
