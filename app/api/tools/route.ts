import { NextRequest, NextResponse } from 'next/server';
import { toolEngineFacade } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const provider = searchParams.get('provider');
    const category = searchParams.get('category');
    const capability = searchParams.get('capability');
    const source = searchParams.get('source');
    const dangerLevel = searchParams.get('dangerLevel');
    const searchQuery = searchParams.get('q');

    // Single tool lookup
    if (id) {
      const tool = toolEngineFacade.registry.getTool(id);
      if (!tool) {
        return NextResponse.json({ success: false, error: `Tool with ID '${id}' not found.` }, { status: 404 });
      }
      return NextResponse.json({ success: true, tool });
    }

    let tools = toolEngineFacade.registry.listTools();

    if (provider && provider !== 'All') {
      tools = tools.filter((t) => t.provider.toLowerCase() === provider.toLowerCase());
    }
    if (category && category !== 'All') {
      tools = tools.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }
    if (capability) {
      tools = tools.filter((t) => t.capabilities?.some((c) => c.toLowerCase() === capability.toLowerCase()));
    }
    if (source && source !== 'All') {
      tools = tools.filter((t) => t.source.toLowerCase() === source.toLowerCase());
    }
    if (dangerLevel && dangerLevel !== 'All') {
      tools = tools.filter((t) => t.dangerLevel.toLowerCase() === dangerLevel.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      tools = tools.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.provider.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.capabilities?.some((c) => c.toLowerCase().includes(q))
      );
    }

    const summary = toolEngineFacade.getDiscoverySummary();

    return NextResponse.json({
      success: true,
      count: tools.length,
      tools,
      summary,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Enable/Disable Action
    if (body.action === 'enable' && body.toolId) {
      const ok = toolEngineFacade.registry.enableTool(body.toolId);
      return NextResponse.json({ success: ok, message: `Tool '${body.toolId}' enabled.` });
    }

    if (body.action === 'disable' && body.toolId) {
      const ok = toolEngineFacade.registry.disableTool(body.toolId);
      return NextResponse.json({ success: ok, message: `Tool '${body.toolId}' disabled.` });
    }

    // Execute Universal Tool Pipeline
    if (body.action === 'execute') {
      if (!body.toolId || !body.workspaceId) {
        return NextResponse.json(
          { success: false, error: 'toolId and workspaceId are required for execution.' },
          { status: 400 }
        );
      }
      const result = await toolEngineFacade.execution.executeUniversalTool({
        toolId: body.toolId,
        workspaceId: body.workspaceId,
        userId: body.userId || 'usr_ceo_001',
        input: body.input || {},
        userRole: body.userRole || 'ADMIN',
        skipApprovalCheck: body.skipApprovalCheck || false,
      });
      return NextResponse.json({ success: result.success, result });
    }

    // Manifest Import
    if (body.manifestJson) {
      const registered = toolEngineFacade.importManifest(body.manifestJson);
      return NextResponse.json({
        success: true,
        message: 'Tool manifest imported successfully.',
        tool: registered,
      });
    }

    // Universal Tool Registration
    if (!body.name || !body.category || !body.version || !body.provider) {
      return NextResponse.json(
        { success: false, error: 'name, provider, category, and version are required.' },
        { status: 400 }
      );
    }

    const newToolId = body.id || `tool_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = toolEngineFacade.registry.registerTool({
      id: newToolId,
      name: body.name,
      description: body.description || '',
      provider: body.provider,
      category: body.category,
      version: body.version || '1.0.0',
      source: body.source || 'internal',
      dangerLevel: body.dangerLevel || 'Safe',
      approvalRequired: body.approvalRequired ?? (body.dangerLevel === 'High' || body.dangerLevel === 'Critical'),
      enabled: body.enabled ?? true,
      requiredPermissions: body.requiredPermissions || [],
      capabilities: body.capabilities || [],
      inputSchema: body.inputSchema || body.inputsSchema || { type: 'object', properties: {} },
      outputSchema: body.outputSchema || body.outputsSchema,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const createdTool = toolEngineFacade.registry.getTool(newToolId);
    return NextResponse.json({
      success: true,
      message: `Tool '${body.name}' registered successfully.`,
      tool: createdTool,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
