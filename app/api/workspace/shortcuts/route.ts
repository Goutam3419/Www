import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  const shortcuts = db.getWorkspaceShortcuts();
  return NextResponse.json({ success: true, count: shortcuts.length, shortcuts });
}
