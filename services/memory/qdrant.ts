/**
 * Qdrant & Project Memory Architecture Specification (Prompt 1.2 Architecture)
 */

export interface VectorDocument {
  id: string;
  projectId: string;
  content: string;
  embedding?: number[];
  payload: {
    category: string;
    title: string;
    createdAt: string;
    tags: string[];
  };
}

export abstract class VectorMemoryService {
  abstract upsertMemoryDocument(doc: VectorDocument): Promise<boolean>;
  abstract searchMemory(projectId: string, query: string, limit?: number): Promise<VectorDocument[]>;
  abstract deleteMemoryDocument(id: string): Promise<boolean>;
}
