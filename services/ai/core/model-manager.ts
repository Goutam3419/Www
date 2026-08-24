export interface ModelCapabilities {
  name: string;
  alias: string;
  maxContextTokens: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  supportsThinking: boolean;
  supportsMultimodal: boolean;
  recommendedFor: string[];
  inputTokenCostPerM: number;
  outputTokenCostPerM: number;
}

export class ModelManager {
  private models: Map<string, ModelCapabilities> = new Map();

  constructor() {
    this.registerDefaultModels();
  }

  private registerDefaultModels() {
    this.models.set('gemini-3.6-flash', {
      name: 'gemini-3.6-flash',
      alias: 'Gemini 3.6 Flash',
      maxContextTokens: 1048576,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsThinking: true,
      supportsMultimodal: true,
      recommendedFor: ['General Chat', 'Intent Detection', 'Quick Code Updates', 'Summary Generation', 'Fast Responses'],
      inputTokenCostPerM: 0.075,
      outputTokenCostPerM: 0.30
    });

    this.models.set('gemini-3.1-pro-preview', {
      name: 'gemini-3.1-pro-preview',
      alias: 'Gemini 3.1 Pro',
      maxContextTokens: 2097152,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsThinking: true,
      supportsMultimodal: true,
      recommendedFor: ['Complex Architecture', 'Deep Reasoning', 'Multi-step Planning', 'Code Refactoring', 'System Analysis'],
      inputTokenCostPerM: 1.25,
      outputTokenCostPerM: 5.00
    });

    this.models.set('gemini-3.1-flash-lite', {
      name: 'gemini-3.1-flash-lite',
      alias: 'Gemini 3.1 Flash Lite',
      maxContextTokens: 1048576,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsThinking: false,
      supportsMultimodal: false,
      recommendedFor: ['Classification', 'Token Estimation', 'Fast Filtering', 'Validation Checks'],
      inputTokenCostPerM: 0.02,
      outputTokenCostPerM: 0.10
    });
  }

  public getModel(name: string): ModelCapabilities | undefined {
    return this.models.get(name) || this.models.get('gemini-3.6-flash');
  }

  public getAllModels(): ModelCapabilities[] {
    return Array.from(this.models.values());
  }

  public selectModelForTask(taskType: 'COMPLEX_REASONING' | 'FAST_CHAT' | 'CLASSIFICATION' | 'PLANNING' | 'CODE_GEN'): string {
    switch (taskType) {
      case 'COMPLEX_REASONING':
      case 'PLANNING':
        return 'gemini-3.1-pro-preview';
      case 'CLASSIFICATION':
        return 'gemini-3.1-flash-lite';
      case 'CODE_GEN':
      case 'FAST_CHAT':
      default:
        return 'gemini-3.6-flash';
    }
  }
}

export const modelManager = new ModelManager();
