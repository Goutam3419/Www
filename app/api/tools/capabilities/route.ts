import { NextRequest, NextResponse } from 'next/server';
import { toolEngineFacade } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') || undefined;
    const category = searchParams.get('category') || undefined;
    const searchQuery = searchParams.get('q') || undefined;

    const capabilities = toolEngineFacade.capabilities.listCapabilities({
      provider: provider !== 'All' ? provider : undefined,
      category: category !== 'All' ? category : undefined,
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      count: capabilities.length,
      capabilities,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
