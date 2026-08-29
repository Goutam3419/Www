import { NextRequest, NextResponse } from 'next/server';
import { memoryAnalyticsService } from '@/services/memory/memory-analytics';
import { knowledgeRelationshipService } from '@/services/memory/knowledge-relationship';
import { contextIntelligenceService } from '@/services/memory/context-intelligence';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const analyticsReport = memoryAnalyticsService.getMemoryAnalytics(workspaceId);
    const relationshipReport = knowledgeRelationshipService.getKnowledgeRelationships(workspaceId);
    const intelligenceReport = contextIntelligenceService.getContextIntelligence(workspaceId);
    const insightsReport = contextIntelligenceService.getExecutiveInsights(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        analyticsReport,
        relationshipReport,
        intelligenceReport,
        insightsReport
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch memory intelligence reports' },
      { status: 500 }
    );
  }
}
