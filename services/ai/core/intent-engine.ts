import { AIIntentType } from '@/packages/types/src';

export class IntentEngine {
  public detectIntent(prompt: string): AIIntentType {
    const lower = prompt.toLowerCase();

    if (/^(hi|hello|hey|greetings|good morning|good evening)/i.test(lower.trim())) {
      return 'Greeting';
    }
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error') || lower.includes('issue')) {
      return 'Bug Fix Request';
    }
    if (lower.includes('build website') || lower.includes('create landing page') || lower.includes('ui components') || lower.includes('frontend')) {
      return 'Website Request';
    }
    if (lower.includes('code') || lower.includes('function') || lower.includes('component') || lower.includes('implement') || lower.includes('api')) {
      return 'Coding Request';
    }
    if (lower.includes('plan') || lower.includes('roadmap') || lower.includes('architecture') || lower.includes('schema')) {
      return 'Planning Request';
    }
    if (lower.includes('deploy') || lower.includes('docker') || lower.includes('cloud run') || lower.includes('hosting')) {
      return 'Deployment Request';
    }
    if (lower.includes('task') || lower.includes('todo') || lower.includes('assign')) {
      return 'Task Request';
    }
    if (lower.includes('config') || lower.includes('settings') || lower.includes('env')) {
      return 'Configuration Request';
    }
    if (lower.includes('research') || lower.includes('compare') || lower.includes('analyze')) {
      return 'Research Request';
    }
    if (lower.includes('update') || lower.includes('status') || lower.includes('progress')) {
      return 'Project Update';
    }
    if (lower.endsWith('?') || lower.startsWith('what') || lower.startsWith('how') || lower.startsWith('why') || lower.startsWith('can you')) {
      return 'Question';
    }

    return 'Discussion';
  }
}

export const intentEngine = new IntentEngine();
