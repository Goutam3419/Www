import { NextRequest, NextResponse } from 'next/server';
import { codeEngineService, templateEngineService } from '@/services/code-engine';

export async function GET() {
  try {
    const templates = codeEngineService.getTemplates();
    return NextResponse.json({ templates });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.framework || !body.language) {
      return NextResponse.json({ error: 'Missing required fields: name, framework, language' }, { status: 400 });
    }
    const template = templateEngineService.registerCustomTemplate(body);
    return NextResponse.json({ template }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
