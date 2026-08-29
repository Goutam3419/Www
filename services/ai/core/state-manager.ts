import { db } from '@/lib/db/store';
import { AIModelState } from '@/packages/types/src';

export class StateManager {
  public setState(projectId: string, state: AIModelState) {
    db.setAIState(projectId, state);
  }

  public getState(projectId: string): AIModelState {
    return db.getAIState(projectId);
  }
}

export const stateManager = new StateManager();
