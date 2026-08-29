/**
 * AI Core Engine & LLM Router Specification (Prompt 1.2 Architecture)
 * Handles OpenRouter, Gemini, LangGraph, LangChain integration specifications.
 */

export interface AICompletionRequest {
  projectId: string;
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  id: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface AgentWorkflowState {
  workflowId: string;
  projectId: string;
  currentStep: 'PLANNING' | 'ARCHITECTURE' | 'CODING' | 'VERIFICATION' | 'DEPLOYMENT';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  metadata: Record<string, unknown>;
}

export abstract class AIRouterService {
  abstract routeCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;
  abstract initializeLangGraphWorkflow(projectId: string): Promise<AgentWorkflowState>;
}
