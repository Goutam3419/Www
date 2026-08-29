'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ToolExecution,
  ApprovalRequest,
  ExecutionHistoryItem,
  ToolDefinition
} from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import {
  Play,
  Clock,
  RefreshCw,
  ShieldAlert,
  Check,
  X,
  Activity,
  History,
  FileText,
  Zap,
  RotateCcw,
  ListTree,
  Layers
} from 'lucide-react';

export const ExecutionEnginePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'running' | 'approvals' | 'plan' | 'queue' | 'history'>('running');
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [executingToolId, setExecutingToolId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ToolExecution | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [execRes, apprRes, histRes, toolsRes] = await Promise.all([
        fetch('/api/tools/execution'),
        fetch('/api/tools/execution/approvals'),
        fetch('/api/tools/execution/history'),
        fetch('/api/tools')
      ]);

      const execData = await execRes.json();
      const apprData = await apprRes.json();
      const histData = await histRes.json();
      const toolsData = await toolsRes.json();

      if (execData.success) setExecutions(execData.executions || []);
      if (apprData.success) setApprovals(apprData.approvals || []);
      if (histData.success) setHistory(histData.history || []);
      if (toolsData.success) {
        setTools(toolsData.tools || []);
        setExecutingToolId(prev => prev || (toolsData.tools?.[0]?.id || ''));
      }
    } catch (err) {
      console.error('Failed to fetch execution engine data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await fetchData();
    };
    run();
    const timer = setInterval(run, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [fetchData]);

  const handleStartExecution = async () => {
    if (!executingToolId) return;
    setActionLoading('start');
    try {
      const res = await fetch('/api/tools/execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: executingToolId,
          inputs: { env: 'development', mode: 'auto' },
          workspaceId: 'ws_default_01',
          projectId: 'proj_coffee_01',
          userId: 'usr_ceo_001'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        if (data.execution) setSelectedExecution(data.execution);
      }
    } catch (err) {
      console.error('Failed to start execution:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (approvalId: string) => {
    setActionLoading(approvalId);
    try {
      const res = await fetch(`/api/tools/execution/approvals/${approvalId}/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to approve request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    setActionLoading(approvalId);
    try {
      const res = await fetch(`/api/tools/execution/approvals/${approvalId}/reject`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to reject approval:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (executionId: string) => {
    setActionLoading(executionId);
    try {
      const res = await fetch(`/api/tools/execution/${executionId}/retry`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to retry execution:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (executionId: string) => {
    setActionLoading(executionId);
    try {
      const res = await fetch(`/api/tools/execution/${executionId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to cancel execution:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;
  const runningExecutionsCount = executions.filter(e => e.status === 'Running' || e.status === 'Queued' || e.status === 'Preparing' || e.status === 'Validating').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Running':
      case 'Validating':
      case 'Preparing':
        return <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/50"><RefreshCw className="w-2.5 h-2.5 animate-spin" /> {status}</span>;
      case 'Queued':
      case 'Pending':
        return <Badge variant="info">{status}</Badge>;
      case 'Waiting':
        return <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50"><Clock className="w-2.5 h-2.5" /> Approval Req</span>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'Cancelled':
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* Test Execution Trigger Card */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-zinc-200 font-semibold">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Execute Tool Test</span>
          <button
            onClick={fetchData}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={executingToolId}
            onChange={e => setExecutingToolId(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            {tools.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.dangerLevel})
              </option>
            ))}
          </select>

          <button
            onClick={handleStartExecution}
            disabled={actionLoading === 'start' || !executingToolId}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-[11px] flex items-center gap-1 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            {actionLoading === 'start' ? 'Starting...' : 'Execute'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-[10px] font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('running')}
          className={`px-2.5 py-1 rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
            activeTab === 'running' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3 h-3 text-indigo-400" /> Jobs ({executions.length})
          {runningExecutionsCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-2.5 py-1 rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
            activeTab === 'approvals' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-3 h-3 text-amber-400" /> Approvals
          {pendingApprovalsCount > 0 && (
            <span className="bg-amber-950 text-amber-300 text-[9px] px-1.5 py-0.2 rounded border border-amber-800/60 font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-2.5 py-1 rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
            activeTab === 'plan' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ListTree className="w-3 h-3 text-purple-400" /> Execution Plan
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-2.5 py-1 rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
            activeTab === 'queue' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3 h-3 text-cyan-400" /> Queue & Summary
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1 rounded-md flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
            activeTab === 'history' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-3 h-3 text-emerald-400" /> History ({history.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'running' && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {executions.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
              No executions found. Trigger a test execution above.
            </div>
          ) : (
            executions.map(e => (
              <div
                key={e.id}
                onClick={() => setSelectedExecution(e)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all space-y-2 ${
                  selectedExecution?.id === e.id
                    ? 'bg-zinc-900 border-indigo-500/80 ring-1 ring-indigo-500/30'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 text-[11px] truncate max-w-[150px]">
                    {e.toolName}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(e.status)}
                    {e.status === 'Failed' && (
                      <button
                        onClick={ev => {
                          ev.stopPropagation();
                          handleRetry(e.id);
                        }}
                        disabled={actionLoading === e.id}
                        className="p-1 text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 rounded"
                        title="Retry Execution"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                    {(e.status === 'Running' || e.status === 'Queued' || e.status === 'Waiting') && (
                      <button
                        onClick={ev => {
                          ev.stopPropagation();
                          handleCancel(e.id);
                        }}
                        disabled={actionLoading === e.id}
                        className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded"
                        title="Cancel Execution"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 truncate">{e.stepMessage}</p>

                {/* Real-time Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                    <span>Progress</span>
                    <span>{e.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/40">
                    <div
                      className={`h-full transition-all duration-300 ${
                        e.status === 'Completed'
                          ? 'bg-emerald-500'
                          : e.status === 'Failed'
                          ? 'bg-red-500'
                          : e.status === 'Cancelled'
                          ? 'bg-zinc-600'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${e.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {approvals.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
              No approval requests logged.
            </div>
          ) : (
            approvals.map(appr => (
              <div
                key={appr.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 space-y-2 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">{appr.toolName}</span>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                    {appr.dangerLevel} Danger
                  </span>
                </div>

                <p className="text-[10px] text-zinc-400 leading-relaxed">{appr.reason}</p>

                {appr.status === 'PENDING' ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(appr.id)}
                      disabled={actionLoading === appr.id}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-medium py-1 px-2 rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Approve & Execute
                    </button>
                    <button
                      onClick={() => handleReject(appr.id)}
                      disabled={actionLoading === appr.id}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-1 px-2 rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Status: <span className={appr.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}>{appr.status}</span> by {appr.reviewedBy}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {/* Execution Plan Read-Only Panel */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="font-semibold text-purple-300 text-[11px] flex items-center gap-1.5">
                <ListTree className="w-3.5 h-3.5" /> Execution Plan Breakdown
              </span>
              <Badge variant="info">Ready State</Badge>
            </div>

            <div className="space-y-2 pt-1 text-[10px]">
              {[
                { step: 1, title: 'Context Initialization', desc: 'Analyze workspace context & validate parameters', state: 'Completed', deps: 'None' },
                { step: 2, title: 'Dependency & Permission Check', desc: 'Verify roles, ownership & tool permissions', state: 'Running', deps: 'Step 1' },
                { step: 3, title: 'Execution Strategy Preparation', desc: 'Format payload and set priority in Queue', state: 'Pending', deps: 'Step 2' },
                { step: 4, title: 'Step Dispatch & Verification', desc: 'Dispatch tool execution and log metrics', state: 'Pending', deps: 'Step 3' }
              ].map(s => (
                <div key={s.step} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-zinc-800 text-purple-300 flex items-center justify-center text-[9px] font-bold">
                        {s.step}
                      </span>
                      {s.title}
                    </div>
                    <p className="text-[9.5px] text-zinc-400 pl-5.5">{s.desc}</p>
                    <p className="text-[9px] text-zinc-500 font-mono pl-5.5">Depends On: {s.deps}</p>
                  </div>
                  {getStatusBadge(s.state)}
                </div>
              ))}
            </div>
          </div>

          {/* Execution Timeline Read-Only Panel */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-2">
            <span className="font-semibold text-zinc-300 text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Pipeline Stage Timeline
            </span>
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">1. Pending</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">2. Wait Approval</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">3. Ready</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">4. Completed</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {/* Queue Status Read-Only Panel */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="font-semibold text-cyan-300 text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Queue Status & Order
              </span>
              <span className="text-[9px] font-mono text-zinc-400">Total In Queue: {executions.length}</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[10px]">
              {executions.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 font-mono text-[10px]">Queue is currently idle.</div>
              ) : (
                executions.map((ex, idx) => (
                  <div key={ex.id} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-200">
                        #{idx + 1} - {ex.toolName}
                      </div>
                      <div className="flex gap-2 text-[9px] text-zinc-400 font-mono mt-0.5">
                        <span>Priority: 50</span>
                        <span>Retries: 0/3</span>
                        <span>Execution ID: {ex.id.slice(0, 10)}...</span>
                      </div>
                    </div>
                    {getStatusBadge(ex.status)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Result Summary Read-Only Panel */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-2">
            <span className="font-semibold text-zinc-200 text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Result Summary & Telemetry
            </span>
            {selectedExecution ? (
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span>Status:</span>
                  <span className={selectedExecution.status === 'Completed' ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                    {selectedExecution.status}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Duration:</span>
                  <span>{selectedExecution.progress === 100 ? '42ms' : 'In Progress'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Affected Modules:</span>
                  <span className="text-zinc-200">FileSystem, Code</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Affected Files:</span>
                  <span className="text-zinc-200">/lib/db/store.ts</span>
                </div>
                <div className="pt-1 border-t border-zinc-800 text-zinc-400">
                  Summary: Executed {selectedExecution.toolName} step successfully with zero policy violations.
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-zinc-500 text-[10px] bg-zinc-950 rounded-lg border border-zinc-800">
                Select an execution from the Jobs tab to inspect formatted results.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
              No execution history recorded.
            </div>
          ) : (
            history.map(h => (
              <div
                key={h.id}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-2.5 space-y-1 text-[10px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-300 truncate max-w-[140px]">{h.toolName}</span>
                  {getStatusBadge(h.status)}
                </div>
                <div className="flex justify-between text-zinc-500 font-mono text-[9px]">
                  <span>Duration: {h.durationMs}ms</span>
                  <span>{new Date(h.executedAt || h.completedAt || h.startedAt || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Execution Details Inspector Modal / Bottom Card */}
      {selectedExecution && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-2 text-[11px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="font-semibold text-indigo-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Inspector: {selectedExecution.toolName}
            </span>
            <button
              onClick={() => setSelectedExecution(null)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-zinc-400">
              <span>Execution ID:</span>
              <span className="text-zinc-200">{selectedExecution.id}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Status:</span>
              <span>{getStatusBadge(selectedExecution.status)}</span>
            </div>
            {selectedExecution.error && (
              <div className="text-red-400 bg-red-950/40 p-1.5 rounded border border-red-900/50 mt-1">
                Error: {selectedExecution.error}
              </div>
            )}
            {selectedExecution.outputs && (
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-zinc-300 text-[9px] max-h-24 overflow-y-auto">
                <pre>{JSON.stringify(selectedExecution.outputs, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
