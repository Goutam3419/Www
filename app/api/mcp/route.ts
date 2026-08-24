import { NextRequest, NextResponse } from 'next/server';
import { toolEngineFacade } from '@/services/tool-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('id');

    if (serverId) {
      const server = toolEngineFacade.mcp.getServer(serverId);
      if (!server) {
        return NextResponse.json({ success: false, error: `MCP Server '${serverId}' not found.` }, { status: 404 });
      }
      return NextResponse.json({ success: true, server });
    }

    const servers = toolEngineFacade.mcp.listServers();
    return NextResponse.json({
      success: true,
      count: servers.length,
      servers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'register';

    if (action === 'connect') {
      if (!body.serverId) {
        return NextResponse.json({ success: false, error: 'serverId is required to connect.' }, { status: 400 });
      }
      const discoveryResult = await toolEngineFacade.mcp.connectServer(body.serverId);
      return NextResponse.json({ success: discoveryResult.success, discoveryResult });
    }

    if (action === 'disconnect') {
      if (!body.serverId) {
        return NextResponse.json({ success: false, error: 'serverId is required to disconnect.' }, { status: 400 });
      }
      const ok = await toolEngineFacade.mcp.disconnectServer(body.serverId);
      return NextResponse.json({ success: ok, message: `MCP Server '${body.serverId}' disconnected.` });
    }

    if (action === 'register') {
      if (!body.id || !body.name || !body.provider) {
        return NextResponse.json({ success: false, error: 'id, name, and provider are required.' }, { status: 400 });
      }

      const regResult = toolEngineFacade.mcp.registerServer({
        id: body.id,
        name: body.name,
        version: body.version || '1.0.0',
        provider: body.provider,
        transport: body.transport || 'adapter',
        url: body.url,
        status: 'DISCONNECTED',
        enabled: true,
        capabilities: body.capabilities || [],
      });

      if (!regResult.success) {
        return NextResponse.json({ success: false, error: regResult.error }, { status: 400 });
      }

      // Auto-connect after registration if requested
      if (body.autoConnect) {
        const connResult = await toolEngineFacade.mcp.connectServer(body.id);
        return NextResponse.json({
          success: true,
          message: `MCP Server '${body.name}' registered and connected.`,
          server: toolEngineFacade.mcp.getServer(body.id),
          discoveryResult: connResult,
        });
      }

      return NextResponse.json({
        success: true,
        message: `MCP Server '${body.name}' registered successfully.`,
        server: toolEngineFacade.mcp.getServer(body.id),
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action '${action}'.` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
