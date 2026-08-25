import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { aiCoreFacade } from '@/services/ai/core/ai-core-facade';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = db.getProjectChat(id);
  return NextResponse.json({ success: true, data: messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, sender = 'USER', senderName = 'CEO' } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    const userMsg = db.addChatMessage(id, sender, senderName, content);

    let aiResponseContent: string;
    try {
      const aiResponse = await aiCoreFacade.processRequest({
        projectId: id,
        userPrompt: content,
      });
      aiResponseContent = aiResponse.answer || 'I processed your request but had no specific answer to give.';
    } catch (aiError: unknown) {
      const aiErrMsg = aiError instanceof Error ? aiError.message : 'Unknown AI error';
      aiResponseContent = `I hit an issue processing that request: ${aiErrMsg}`;
    }

    const aiMsg = db.addChatMessage(id, 'AI_CEO', 'AI CEO Agent', aiResponseContent);

    return NextResponse.json({
      success: true,
      data: { userMessage: userMsg, aiMessage: aiMsg }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
