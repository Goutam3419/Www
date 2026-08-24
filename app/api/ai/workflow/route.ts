import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const workflowId = searchParams.get('workflowId');

  if (workflowId) {
    const wf = db.getWorkflow(workflowId);
    const events = db.getWorkflowEvents(workflowId);
    return NextResponse.json({ success: true, workflow: wf, events });
  }

  if (projectId) {
    const workflows = db.getProjectWorkflows(projectId);
    return NextResponse.json({ success: true, workflows });
  }

  return NextResponse.json({ error: 'projectId or workflowId required' }, { status: 400 });
}
