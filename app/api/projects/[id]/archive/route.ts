import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const project = db.getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const newArchived = !project.archived;
  const updated = db.updateProject(projectId, {
    archived: newArchived,
    status: newArchived ? 'Archived' : 'In Progress'
  });

  db.addLog(projectId, 'INFO', 'ProjectManager', `Project ${newArchived ? 'archived' : 'unarchived'}`);

  return NextResponse.json({ success: true, project: updated });
}
