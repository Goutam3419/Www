import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const project = db.getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const tasks = db.getProjectTasks(projectId);
  const memories = db.getProjectMemories(projectId);
  const connections = db.getProjectConnections(projectId);
  const aiState = db.getAIState(projectId);
  const aiSession = db.getAISession(projectId);
  const stats = db.getProjectStatistics(projectId);

  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  const currentTask = tasks.find(t => t.status === 'IN_PROGRESS')?.title || tasks[0]?.title || 'No active task';

  const dashboardData = {
    projectId: project.id,
    workspaceId: project.workspaceId,
    projectSummary: project.description || `Autonomous AI CEO Project for ${project.name}`,
    currentGoal: `Complete ${project.name} milestones with clean architecture`,
    currentTask,
    aiStatus: aiState,
    currentModel: aiSession.currentModel,
    connectedProvidersCount: connections.filter(c => c.status === 'CONNECTED').length,
    memoryCount: memories.length,
    tasksCount: { todo: todoCount, inProgress: inProgressCount, done: doneCount },
    statistics: stats,
    recentActivities: db.getProjectLogs(projectId).slice(0, 5).map(l => l.message)
  };

  return NextResponse.json({ success: true, dashboard: dashboardData });
}
