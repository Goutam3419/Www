import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tasks = db.getProjectTasks(id);
  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const task = db.addProjectTask(id, {
      title: body.title,
      description: body.description || '',
      status: body.status || 'TODO',
      priority: body.priority || 'MEDIUM',
      assignedRole: body.assignedRole || 'Engineer',
      createdBy: 'usr_ceo_001',
      updatedBy: 'usr_ceo_001'
    });
    return NextResponse.json({ success: true, data: task });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
