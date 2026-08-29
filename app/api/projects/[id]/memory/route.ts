import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const memories = db.getProjectMemories(id);
  return NextResponse.json({ success: true, data: memories });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const memory = db.addProjectMemory(id, {
      category: body.category || 'NOTES',
      title: body.title || 'Untitled Memory',
      content: body.content || '',
      tags: body.tags || [],
      createdBy: body.createdBy || 'usr_ceo_001'
    });
    return NextResponse.json({ success: true, data: memory });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
