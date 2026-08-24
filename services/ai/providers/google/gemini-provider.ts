import { GoogleGenAI } from '@google/genai';

export interface GeminiGenerateOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  thinking?: boolean;
}

export class GeminiProvider {
  private client: GoogleGenAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  public getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not configured');
      }
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  public async generateContent(prompt: string, options: GeminiGenerateOptions = {}) {
    const client = this.getClient();
    const model = options.model || 'gemini-3.6-flash';

    const config: Record<string, unknown> = {};
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (typeof options.temperature === 'number') {
      config.temperature = options.temperature;
    }
    if (typeof options.maxOutputTokens === 'number') {
      config.maxOutputTokens = options.maxOutputTokens;
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined
    });

    return {
      text: response.text || '',
      usage: response.usageMetadata
        ? {
            inputTokens: response.usageMetadata.promptTokenCount || 0,
            outputTokens: response.usageMetadata.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata.totalTokenCount || 0
          }
        : { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    };
  }

  public async generateContentStream(
    prompt: string,
    onChunk: (textChunk: string) => void,
    options: GeminiGenerateOptions = {}
  ) {
    const client = this.getClient();
    const model = options.model || 'gemini-3.6-flash';

    const config: Record<string, unknown> = {};
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    const responseStream = await client.models.generateContentStream({
      model,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      onChunk(chunkText);
    }

    return fullText;
  }
}

export const geminiProvider = new GeminiProvider();
