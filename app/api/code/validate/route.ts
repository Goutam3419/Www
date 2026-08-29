import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, fileName, language } = body;

    if (!content || !fileName || !language) {
      return NextResponse.json(
        { error: 'Missing required parameters: content, fileName, language' },
        { status: 400 }
      );
    }

    const validationResult = codeEngineService.validateCode(content, fileName, language);
    return NextResponse.json(validationResult);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
