import { db } from '@/lib/db/store';

export interface ConsolidatedAIContext {
  workspaceId: string;
  projectId: string;
  projectName: string;
  projectDescription: string;
  status: string;
  framework: string;
  language: string;
  conversationHistory: Array<{ sender: string; text: string }>;
  memories: Array<{ title: string; content: string; category: string }>;
  tasks: Array<{ title: string; status: string; priority: string }>;
  decisions: Array<{ decision: string; reason: string }>;
  summary?: string;
}

export class ContextManager {
  public buildContext(projectId: string): ConsolidatedAIContext {
    const project = db.getProject(projectId);
    const chats = db.getProjectChats(projectId).slice(-10); // Last 10 messages
    const memories = db.getProjectMemories(projectId);
    const tasks = db.getProjectTasks(projectId);
    const decisions = db.getAIDecisions(projectId);
    const convSummary = db.getConversationSummary(projectId);

    return {
      workspaceId: project ? project.workspaceId : 'ws_default_01',
      projectId,
      projectName: project ? project.name : 'Unknown Project',
      projectDescription: project ? project.description : '',
      status: project ? project.status : 'In Progress',
      framework: project ? project.framework : 'Next.js 15',
      language: project ? project.language : 'TypeScript',
      conversationHistory: chats.map(c => ({ sender: c.sender, text: c.text })),
      memories: memories.map(m => ({ title: m.title, content: m.content, category: m.category })),
      tasks: tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })),
      decisions: decisions.map(d => ({ decision: d.decision, reason: d.reason })),
      summary: convSummary ? convSummary.summary : undefined
    };
  }

  public formatContextForPrompt(ctx: ConsolidatedAIContext): string {
    return `
[ACTIVE PROJECT CONTEXT]
Project ID: ${ctx.projectId}
Project Name: ${ctx.projectName}
Description: ${ctx.projectDescription}
Framework: ${ctx.framework} | Language: ${ctx.language} | Status: ${ctx.status}

[KEY PROJECT MEMORIES]
${ctx.memories.length > 0 ? ctx.memories.map(m => `- [${m.category}] ${m.title}: ${m.content}`).join('\n') : 'No key memories stored yet.'}

[KEY TASKS]
${ctx.tasks.length > 0 ? ctx.tasks.map(t => `- [${t.status}] [${t.priority}] ${t.title}`).join('\n') : 'No tasks assigned yet.'}

[ARCHITECTURAL DECISIONS]
${ctx.decisions.length > 0 ? ctx.decisions.map(d => `- ${d.decision} (Reason: ${d.reason})`).join('\n') : 'No decisions recorded.'}

[CONVERSATION SUMMARY]
${ctx.summary || 'Initial conversation in progress.'}
`;
  }
}

export const contextManager = new ContextManager();
