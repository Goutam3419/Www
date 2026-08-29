import { NextResponse } from 'next/server';
import { toolEngineFacade, TOOL_CATEGORIES_METADATA } from '@/services/tool-engine';

export async function GET() {
  try {
    const categoriesFromDb = toolEngineFacade.getDiscoverySummary().categories;

    const merged = TOOL_CATEGORIES_METADATA.map(meta => {
      const dbCat = categoriesFromDb.find(c => c.name === meta.name);
      return {
        ...meta,
        count: dbCat ? dbCat.count : 0
      };
    });

    return NextResponse.json({
      success: true,
      categoriesCount: merged.length,
      categories: merged
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
