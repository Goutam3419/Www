'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UniversalToolDefinition, MCPServerConfig } from '@/packages/types/src';
import { ExecutionEnginePanel } from './ExecutionEnginePanel';
import { Badge } from '@/components/ui/Badge';
import {
  Wrench,
  Search,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Box,
  Server,
  Terminal,
  Play,
  Layers,
} from 'lucide-react';

interface CapabilityInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
}

interface TestReportItem {
  id: number;
  title: string;
  passed: boolean;
  details: string;
}

export const ToolEnginePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'capabilities' | 'mcp' | 'tests' | 'execution'>('registry');
  const [tools, setTools] = useState<UniversalToolDefinition[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>([]);
  const [capabilities, setCapabilities] = useState<CapabilityInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDanger, setSelectedDanger] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Test Suite State
  const [testing, setTesting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestReportItem[] | null>(null);
  const [testPassCount, setTestPassCount] = useState<number>(0);

  // Tool Execution Test Modal
  const [selectedToolForExec, setSelectedToolForExec] = useState<UniversalToolDefinition | null>(null);
  const [execInputJson, setExecInputJson] = useState<string>('{}');
  const [executingTool, setExecutingTool] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<unknown | null>(null);

  const fetchRegistry = useCallback(async () => {
    try {
      setLoading(true);
      const [toolsRes, mcpRes, capsRes] = await Promise.all([
        fetch('/api/tools'),
        fetch('/api/mcp'),
        fetch('/api/tools/capabilities'),
      ]);

      const toolsData = await toolsRes.json();
      const mcpData = await mcpRes.json();
      const capsData = await capsRes.json();

      if (toolsData.success) setTools(toolsData.tools || []);
      if (mcpData.success) setMcpServers(mcpData.servers || []);
      if (capsData.success) setCapabilities(capsData.capabilities || []);
    } catch (err) {
      console.error('Failed to load tool registry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await fetchRegistry();
    };
    run();
    return () => {
      active = false;
    };
  }, [fetchRegistry]);

  const handleRunTests = async () => {
    try {
      setTesting(true);
      const res = await fetch('/api/tools/test');
      const data = await res.json();
      if (data.report) {
        setTestResults(data.report.results || []);
        setTestPassCount(data.report.passedCount || 0);
      }
    } catch (err) {
      console.error('Test suite failed:', err);
    } finally {
      setTesting(false);
    }
  };

  const handleConnectServer = async (serverId: string) => {
    try {
      await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect', serverId }),
      });
      await fetchRegistry();
    } catch (err) {
      console.error('Connect server failed:', err);
    }
  };

  const handleDisconnectServer = async (serverId: string) => {
    try {
      await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', serverId }),
      });
      await fetchRegistry();
    } catch (err) {
      console.error('Disconnect server failed:', err);
    }
  };

  const handleExecuteTool = async () => {
    if (!selectedToolForExec) return;
    try {
      setExecutingTool(true);
      setExecResult(null);
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(execInputJson);
      } catch {
        parsedInput = {};
      }

      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          toolId: selectedToolForExec.id,
          workspaceId: 'ws_demo_ui_001',
          input: parsedInput,
        }),
      });

      const data = await res.json();
      setExecResult(data);
    } catch (err) {
      setExecResult({ success: false, error: String(err) });
    } finally {
      setExecutingTool(false);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const matchesProvider = selectedProvider === 'All' || tool.provider?.toLowerCase() === selectedProvider.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesDanger = selectedDanger === 'All' || tool.dangerLevel === selectedDanger;
    const matchesSource = selectedSource === 'All' || tool.source === selectedSource;
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesCategory && matchesDanger && matchesSource && matchesSearch;
  });

  const getDangerBadge = (danger: string) => {
    switch (danger) {
      case 'Safe':
        return <Badge variant="success">Safe</Badge>;
      case 'Low':
        return <Badge variant="info">Low Risk</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'High':
      case 'Critical':
        return <Badge variant="destructive">{danger} Risk</Badge>;
      default:
        return <Badge variant="default">{danger}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 p-3 text-xs select-none bg-zinc-950 text-zinc-100">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-100">
          <Wrench className="w-4 h-4 text-indigo-400" /> Universal Tool Registry & MCP
        </div>
        <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px] gap-0.5">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
              activeTab === 'registry' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-indigo-400" /> Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
              activeTab === 'capabilities' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Capabilities ({capabilities.length})
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
              activeTab === 'mcp' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-purple-400" /> MCP Servers ({mcpServers.length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
              activeTab === 'tests' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Security Tests
          </button>
          <button
            onClick={() => setActiveTab('execution')}
            className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
              activeTab === 'execution' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Execution
          </button>
        </div>
      </div>

      {activeTab === 'registry' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {/* Search & Multi-Filter Bar */}
          <div className="space-y-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search tools by name, ID, capability, or provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={fetchRegistry}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 text-zinc-300"
                title="Refresh Registry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none"
              >
                <option value="All">All Providers</option>
                <option value="github">GitHub</option>
                <option value="vercel">Vercel</option>
                <option value="firebase">Firebase</option>
                <option value="supabase">Supabase</option>
                <option value="internal">Internal System</option>
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none"
              >
                <option value="All">All Sources</option>
                <option value="internal">Internal</option>
                <option value="mcp">MCP Integration</option>
                <option value="provider_adapter">Provider Adapter</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="GitGitHub">Git / GitHub</option>
                <option value="Vercel">Vercel</option>
                <option value="Firebase">Firebase</option>
                <option value="Supabase">Supabase</option>
                <option value="FileSystem">FileSystem</option>
                <option value="Terminal">Terminal</option>
                <option value="Governance">Governance</option>
              </select>

              <select
                value={selectedDanger}
                onChange={(e) => setSelectedDanger(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none"
              >
                <option value="All">All Risk Levels</option>
                <option value="Safe">Safe</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="space-y-2">
            {filteredTools.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 bg-zinc-900/30 rounded-lg border border-zinc-800">
                No tools matching filter criteria.
              </div>
            ) : (
              filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-zinc-100 text-[12px] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" /> {tool.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{tool.id}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {tool.approvalRequired && <Badge variant="warning">Approval Req</Badge>}
                      {getDangerBadge(tool.dangerLevel)}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">{tool.description}</p>

                  {/* Capabilities Tags */}
                  {tool.capabilities && tool.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tool.capabilities.map((cap) => (
                        <span key={cap} className="px-1.5 py-0.5 bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 rounded font-mono text-[9px]">
                          {cap}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-800/40">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 capitalize">
                        {tool.provider} ({tool.source})
                      </span>
                      <span className="text-zinc-500 font-mono text-[9px]">v{tool.version}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedToolForExec(tool);
                        setExecInputJson(JSON.stringify(tool.inputSchema?.properties ? Object.fromEntries(Object.keys(tool.inputSchema.properties).map(k => [k, 'sample'])) : {}, null, 2));
                      }}
                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded flex items-center gap-1 text-[10px]"
                    >
                      <Play className="w-3 h-3" /> Test Execute
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'capabilities' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> Standard Capability Discovery Registry
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Capabilities are fine-grained operational primitives dynamically requested by the CEO Agent for task synthesis.
            </p>
          </div>

          <div className="space-y-2">
            {capabilities.map((cap) => (
              <div key={cap.id} className="p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-medium text-[11px]">{cap.id}</span>
                  <span className="text-[9px] px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded uppercase font-mono">
                    {cap.provider}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-200 text-[11px]">{cap.name}</h4>
                <p className="text-[10px] text-zinc-400">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mcp' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" /> Model Context Protocol (MCP) Server Infrastructure
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              MCP servers expose external integrations as dynamically discoverable tools in the Universal Registry.
            </p>
          </div>

          <div className="space-y-2">
            {mcpServers.map((server) => (
              <div key={server.id} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-100 text-[12px] flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-purple-400" /> {server.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{server.id}</p>
                  </div>

                  {server.status === 'CONNECTED' ? (
                    <Badge variant="success">Connected</Badge>
                  ) : server.status === 'CONNECTING' ? (
                    <Badge variant="warning">Connecting...</Badge>
                  ) : (
                    <Badge variant="default">Disconnected</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                  <div><span className="text-zinc-500">Provider:</span> {server.provider}</div>
                  <div><span className="text-zinc-500">Transport:</span> {server.transport}</div>
                  <div><span className="text-zinc-500">Version:</span> v{server.version}</div>
                  <div><span className="text-zinc-500">Discovered Tools:</span> {server.discoveredToolsCount || 0}</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] text-zinc-500 font-mono">
                    Last sync: {server.lastConnectedAt ? new Date(server.lastConnectedAt).toLocaleTimeString() : 'Never'}
                  </span>

                  {server.status === 'CONNECTED' ? (
                    <button
                      onClick={() => handleDisconnectServer(server.id)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-red-300 font-medium rounded text-[10px]"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectServer(server.id)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded text-[10px]"
                    >
                      Connect & Sync
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" /> Universal Registry & MCP Security Test Matrix
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Runs 12 automated verification tests covering isolation, schema, permissions, and MCP lifecycle.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={testing}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" /> {testing ? 'Running Suite...' : 'Run 12-Point Test Suite'}
            </button>
          </div>

          {testResults && (
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Suite Results:</span>
              <span className={`font-mono font-bold ${testPassCount === 12 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {testPassCount} / 12 Tests Passed ({Math.round((testPassCount / 12) * 100)}%)
              </span>
            </div>
          )}

          <div className="space-y-2">
            {testResults ? (
              testResults.map((t) => (
                <div key={t.id} className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-start gap-2.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <h4 className="font-semibold text-zinc-200 text-[11px]">{t.id}. {t.title}</h4>
                    <p className="text-[10px] text-zinc-400">{t.details}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800">
                Click &quot;Run 12-Point Test Suite&quot; above to execute automated registry verification.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'execution' && <ExecutionEnginePanel />}

      {/* Test Execution Modal */}
      {selectedToolForExec && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> Execute &apos;{selectedToolForExec.name}&apos;
              </h3>
              <button
                onClick={() => setSelectedToolForExec(null)}
                className="text-zinc-400 hover:text-zinc-200 text-xs px-2 py-0.5 rounded bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-medium">Input Parameters (JSON):</label>
              <textarea
                value={execInputJson}
                onChange={(e) => setExecInputJson(e.target.value)}
                rows={5}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-[11px] text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleExecuteTool}
                disabled={executingTool}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> {executingTool ? 'Executing...' : 'Run Pipeline'}
              </button>
            </div>

            {execResult !== null && (
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400">Execution Output Result:</span>
                <pre className="text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-40">
                  {JSON.stringify(execResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
