import { NextRequest, NextResponse } from 'next/server';
import { pluginRegistryService } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type) {
    const plugins = pluginRegistryService.getPluginsByType(type as Parameters<typeof pluginRegistryService.getPluginsByType>[0]);
    return NextResponse.json({ success: true, count: plugins.length, plugins });
  }

  const plugins = pluginRegistryService.getAllPlugins();
  return NextResponse.json({ success: true, count: plugins.length, plugins });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, pluginType, version, author, description, toolIds, manifest } = body;

    if (!name || !pluginType || !version || !manifest) {
      return NextResponse.json({ success: false, error: 'name, pluginType, version, and manifest are required.' }, { status: 400 });
    }

    const plugin = pluginRegistryService.registerPlugin({
      name,
      pluginType,
      version,
      author: author || 'Community Contributor',
      description: description || '',
      enabled: true,
      toolIds: toolIds || [],
      manifest
    });

    return NextResponse.json({ success: true, plugin });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, enabled } = body;

    if (!id || typeof enabled !== 'boolean') {
      return NextResponse.json({ success: false, error: 'id and boolean enabled status are required.' }, { status: 400 });
    }

    const updated = pluginRegistryService.togglePlugin(id, enabled);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Plugin not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, plugin: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
