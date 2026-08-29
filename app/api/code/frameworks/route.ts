import { NextResponse } from 'next/server';
import { codeEngineService } from '@/services/code-engine';

export async function GET() {
  try {
    const capabilities = codeEngineService.getCapabilities();
    return NextResponse.json(capabilities);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
