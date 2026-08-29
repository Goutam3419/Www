import { GoogleGenAI } from '@google/genai';

export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
  model: string;
  isMock: boolean;
}

export class EmbeddingProvider {
  private client: GoogleGenAI | null = null;
  public readonly DEFAULT_DIMENSION = 768;
  public readonly DEFAULT_MODEL = 'text-embedding-004';

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Generate vector embedding for input text
   */
  public async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        if (!this.client) {
          this.client = new GoogleGenAI({ apiKey });
        }
        const response = await this.client.models.embedContent({
          model: this.DEFAULT_MODEL,
          contents: text,
        });

        const resAny = response as unknown as { embedding?: { values?: number[] }; embeddings?: Array<{ values?: number[] }> };
        const values = resAny.embedding?.values || resAny.embeddings?.[0]?.values;

        if (values && Array.isArray(values)) {
          return {
            embedding: values,
            dimension: values.length,
            model: this.DEFAULT_MODEL,
            isMock: false,
          };
        }
      } catch (err) {
        console.warn('Gemini embedContent failed, falling back to deterministic embedding vector:', err);
      }
    }

    // Fallback deterministic embedding vector (768 dimensions)
    const embedding = this.generateDeterministicVector(text, this.DEFAULT_DIMENSION);
    return {
      embedding,
      dimension: this.DEFAULT_DIMENSION,
      model: `${this.DEFAULT_MODEL}-fallback-dev`,
      isMock: true,
    };
  }

  /**
   * Generates a deterministic normalized pseudo-embedding vector for text when API key is unavailable.
   * Useful for unit tests, local development, and off-grid validation.
   */
  private generateDeterministicVector(text: string, dimension: number): number[] {
    const vector = new Array(dimension).fill(0);
    const cleanText = text.toLowerCase().trim();

    for (let i = 0; i < cleanText.length; i++) {
      const charCode = cleanText.charCodeAt(i);
      const targetIndex = (i * 31 + charCode) % dimension;
      vector[targetIndex] += Math.sin(charCode * (i + 1));
    }

    // Normalize vector (L2 norm)
    let norm = 0;
    for (let i = 0; i < dimension; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm) || 1;

    for (let i = 0; i < dimension; i++) {
      vector[i] = vector[i] / norm;
    }

    return vector;
  }
}

export const embeddingProvider = new EmbeddingProvider();
