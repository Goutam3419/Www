import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeProjectId = searchParams.get('codeProjectId');

    if (!codeProjectId) {
      return NextResponse.json({ success: false, error: 'codeProjectId query parameter is required.' }, { status: 400 });
    }

    const overview = codeEngineService.reader.analyzeCodeProject(codeProjectId);
    const structure = codeEngineService.reader.getProjectStructure(codeProjectId);

    return NextResponse.json({
      success: true,
      overview,
      structure
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed analyzing project code';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
