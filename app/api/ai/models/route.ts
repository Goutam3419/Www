import { NextResponse } from 'next/server';
import { modelManager } from '@/services/ai/core/model-manager';

export async function GET() {
  const models = modelManager.getAllModels();
  return NextResponse.json({ success: true, models });
}
