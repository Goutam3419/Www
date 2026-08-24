import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const session = db.getAISession(projectId);
  const usage = db.getAIUsage(projectId);
  const state = db.getAIState(projectId);

  return NextResponse.json({
    success: true,
    session,
    state,
    usage
  });
}
