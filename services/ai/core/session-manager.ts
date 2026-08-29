import { db } from '@/lib/db/store';
import { AISession } from '@/packages/types/src';

export class SessionManager {
  public getOrCreateSession(projectId: string): AISession {
    return db.getAISession(projectId);
  }

  public updateSessionModel(projectId: string, model: string): AISession {
    const session = this.getOrCreateSession(projectId);
    session.currentModel = model;
    session.updatedAt = new Date().toISOString();
    return session;
  }

  public getSession(projectId: string): AISession {
    return this.getOrCreateSession(projectId);
  }
}

export const sessionManager = new SessionManager();
