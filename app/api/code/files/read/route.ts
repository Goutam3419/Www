import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeProjectId = searchParams.get('codeProjectId');
    const filePath = searchParams.get('filePath');

    if (!codeProjectId) {
      return NextResponse.json({ success: false, error: 'codeProjectId parameter is required.' }, { status: 400 });
    }

    if (filePath) {
      const file = codeEngineService.reader.getFileDetails(codeProjectId, filePath);
      if (!file) {
        return NextResponse.json({ success: false, error: `File '${filePath}' not found.` }, { status: 404 });
      }
      return NextResponse.json({ success: true, file });
    }

    const structure = codeEngineService.reader.getProjectStructure(codeProjectId);
    return NextResponse.json({ success: true, structure });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed reading file details';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
