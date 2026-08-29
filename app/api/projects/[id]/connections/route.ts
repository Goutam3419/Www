import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const connections = db.getProjectConnections(id);
  return NextResponse.json({ success: true, data: connections });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { provider, config } = body;
    if (!provider || !config) {
      return NextResponse.json({ success: false, error: 'Provider and config are required' }, { status: 400 });
    }
    const connection = db.upsertProjectConnection(id, provider, config);
    return NextResponse.json({ success: true, data: connection });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
