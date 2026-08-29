import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'HEALTHY',
    platform: 'AI CEO Agent',
    version: '1.0.0-PROMPT-1.4',
    timestamp: new Date().toISOString(),
    services: {
      database: 'UP',
      aiRouter: 'READY',
      workspaceManager: 'ACTIVE'
    }
  });
}
