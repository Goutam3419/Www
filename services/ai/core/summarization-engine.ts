import { db } from '@/lib/db/store';

export class SummarizationEngine {
  public updateConversationSummary(projectId: string, conversationId: string) {
    const chats = db.getProjectChats(projectId);
    if (chats.length === 0) return;

    const keyPoints = chats.slice(-5).map(c => (c.text || '').slice(0, 80));
    const lastMsg = chats[chats.length - 1];
    const summary = `Active session discussing ${chats.length} messages. Latest topic: ${(lastMsg?.text || '').slice(0, 100)}...`;

    db.setConversationSummary(projectId, conversationId, summary, keyPoints, []);
  }

  public getMemoryOverview(projectId: string) {
    return db.getMemorySummary(projectId);
  }
}

export const summarizationEngine = new SummarizationEngine();
