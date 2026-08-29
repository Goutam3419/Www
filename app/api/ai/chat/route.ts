import { NextRequest, NextResponse } from 'next/server';
import { aiCoreFacade } from '@/services/ai/core/ai-core-facade';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, prompt, model } = body;

    if (!projectId || !prompt) {
      return NextResponse.json({ error: 'Missing projectId or prompt' }, { status: 400 });
    }

    const response = await aiCoreFacade.processRequest({
      projectId,
      userPrompt: prompt,
      preferredModel: model
    });

    return NextResponse.json({ success: true, data: response });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
