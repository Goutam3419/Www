'use client';

import React, { useState } from 'react';
import { Project, ProjectConnection, ProjectMemoryItem } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { GitBranch, Cpu, HardDrive, ShieldCheck, CheckSquare, Info } from 'lucide-react';
import { TaskPanel } from '@/components/workspace/TaskPanel';

interface RightPanelProps {
  activeProject: Project | null;
  connections: ProjectConnection[];
  memories: ProjectMemoryItem[];
}

export const RightPanel: React.FC<RightPanelProps> = ({
  activeProject,
  connections,
  memories
}) => {
  const [panelTab, setPanelTab] = useState<'overview' | 'tasks'>('overview');

  if (!activeProject) {
    return (
      <aside className="w-80 border-l border-zinc-800/80 bg-zinc-950/70 p-4 text-xs text-zinc-500 shrink-0 hidden lg:block">
        Select a project to view details.
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-zinc-800/80 bg-zinc-950/70 shrink-0 overflow-y-auto hidden lg:flex flex-col select-none">
      {/* Right Panel Sub-Header */}
      <div className="flex border-b border-zinc-800 text-xs bg-zinc-950">
        <button
          onClick={() => setPanelTab('overview')}
          className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 border-b-2 transition ${panelTab === 'overview' ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Info</span>
        </button>
        <button
          onClick={() => setPanelTab('tasks')}
          className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 border-b-2 transition ${panelTab === 'tasks' ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Task Panel</span>
        </button>
      </div>

      {panelTab === 'tasks' ? (
        <div className="flex-1 overflow-hidden">
          <TaskPanel projectId={activeProject.id} />
        </div>
      ) : (
        <div className="p-4 space-y-6 text-xs flex-1 overflow-y-auto">
          {/* Project Overview Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Project Info</span>
              <Badge variant="info">{activeProject.status}</Badge>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">{activeProject.description}</p>
            
            <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> Framework:</span>
                <span className="font-medium text-zinc-200">{activeProject.framework}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5 text-indigo-400" /> Repository:</span>
                <span className="font-medium text-indigo-400 truncate max-w-[120px]">{activeProject.gitRepository ? 'Connected' : 'None'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Environment:</span>
                <span className="font-medium text-zinc-200 capitalize">{activeProject.environment || 'Production'}</span>
              </div>
            </div>
          </div>

          {/* Active Connections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-zinc-300 font-semibold">
              <span>Connections</span>
              <span className="text-[10px] text-zinc-500">{connections.length} Active</span>
            </div>
            <div className="space-y-2">
              {connections.length === 0 ? (
                <div className="text-[11px] text-zinc-500 bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-800/50">
                  No connections configured yet.
                </div>
              ) : (
                connections.map(c => (
                  <div
                    key={c.id}
                    className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-medium text-zinc-200">{c.provider}</span>
                    </div>
                    <Badge variant="success">READY</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Memory Snapshot */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-zinc-300 font-semibold">
              <span>Project Memory</span>
              <span className="text-[10px] text-zinc-500">{memories.length} Items</span>
            </div>
            <div className="space-y-2">
              {memories.slice(0, 3).map(m => (
                <div
                  key={m.id}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded-lg p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-300 truncate">{m.title}</span>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{m.category}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-2">{m.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Audit Metrics */}
          <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-indigo-300 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Architecture Audit</span>
              <span>100% Score</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-full" />
            </div>
            <p className="text-[10px] text-zinc-400">
              Platform database, isolated project chat context & FK integrity locked.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
