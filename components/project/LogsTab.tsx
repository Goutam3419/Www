'use client';

import React, { useState } from 'react';
import { Project, ProjectLog, LogLevel } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { Terminal, RefreshCw } from 'lucide-react';

interface LogsTabProps {
  project: Project;
  logs: ProjectLog[];
  onRefresh: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({ project, logs, onRefresh }) => {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter(l => {
    if (levelFilter === 'ALL') return true;
    return l.level === levelFilter;
  });

  const levelBadges: Record<LogLevel, 'info' | 'warning' | 'destructive' | 'success' | 'default'> = {
    INFO: 'info',
    WARN: 'warning',
    ERROR: 'destructive',
    AUDIT: 'success',
    DEBUG: 'default'
  };

  return (
    <div className="p-6 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            Activity & Audit Logs — {project.name}
          </h2>
          <p className="text-xs text-zinc-400">Structured system activity stream, security audits, and agent step events</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="AUDIT">AUDIT</option>
          </select>
          <button
            onClick={onRefresh}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Console Box */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-[11px] h-96 overflow-y-auto space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-zinc-600 text-center py-8">No logs match the selected filter.</div>
        ) : (
          filteredLogs.map(l => (
            <div key={l.id} className="flex items-start space-x-3 border-b border-zinc-900/80 pb-1.5">
              <span className="text-zinc-600 shrink-0">{new Date(l.createdAt || l.timestamp || Date.now()).toLocaleTimeString()}</span>
              <Badge variant={levelBadges[l.level]}>{l.level}</Badge>
              <span className="text-indigo-400 font-semibold shrink-0">[{l.source || l.module}]</span>
              <span className="text-zinc-300 flex-1">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
