import { DocumentChunkReport, DocumentChunkSpec } from '@/packages/types/src';

export class DocumentChunkManagerService {
  public getChunkReport(workspaceId: string = 'ws_enterprise_01'): DocumentChunkReport {
    const sampleChunks: DocumentChunkSpec[] = [
      {
        id: 'chunk_01_01',
        documentId: 'doc_01',
        chunkOrder: 1,
        targetChunkSizeTokens: 512,
        overlapTokens: 64,
        chunkMetadata: {
          headingContext: 'AI CEO Architecture Specification v2.4 > Executive Summary',
          pageNumber: 1,
          sectionType: 'OVERVIEW'
        },
        characterCount: 1850,
        tokenEstimate: 462
      },
      {
        id: 'chunk_01_02',
        documentId: 'doc_01',
        chunkOrder: 2,
        targetChunkSizeTokens: 512,
        overlapTokens: 64,
        chunkMetadata: {
          headingContext: 'AI CEO Architecture Specification v2.4 > Core Systems Overview',
          pageNumber: 2,
          sectionType: 'SYSTEM_DESIGN'
        },
        characterCount: 1980,
        tokenEstimate: 495
      },
      {
        id: 'chunk_02_01',
        documentId: 'doc_02',
        chunkOrder: 1,
        targetChunkSizeTokens: 512,
        overlapTokens: 64,
        chunkMetadata: {
          headingContext: 'Memory & Knowledge Engine Spec > Architecture Principles',
          sectionType: 'SPECIFICATION'
        },
        characterCount: 1620,
        tokenEstimate: 405
      },
      {
        id: 'chunk_03_01',
        documentId: 'doc_03',
        chunkOrder: 1,
        targetChunkSizeTokens: 512,
        overlapTokens: 64,
        chunkMetadata: {
          headingContext: 'RAG & Document Intelligence Requirements > Prompt 9.2 Scope',
          sectionType: 'REQUIREMENTS'
        },
        characterCount: 1740,
        tokenEstimate: 435
      }
    ];

    const totalChunksCount = 42;
    const avgChunkSizeTokens = 450;

    return {
      id: `dcr_${Date.now()}`,
      workspaceId,
      defaultConfig: {
        maxChunkSizeTokens: 512,
        overlapTokens: 64,
        chunkingStrategy: 'RECURSIVE_HEADING_AWARE'
      },
      sampleChunks,
      totalChunksCount,
      avgChunkSizeTokens,
      generatedAt: new Date().toISOString()
    };
  }
}

export const documentChunkManagerService = new DocumentChunkManagerService();
