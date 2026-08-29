'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceActivityItem, ActivityEventType } from '@/packages/types/src';

interface ActivityTimelineProps {
  workspaceId?: string;
  projectId?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  workspaceId = 'ws_default_01',
  projectId
}) => {
  const [activities, setActivities] = useState<WorkspaceActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchActivities = useCallback(async () => {
    try {
      let url = `/api/workspace/activities?workspaceId=${workspaceId}`;
      if (projectId) url += `&projectId=${projectId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch activities', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await fetchActivities();
    };
    run();
    return () => {
      active = false;
    };
  }, [fetchActivities]);

  const eventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'Project Created':
        return <span className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">🚀</span>;
      case 'Chat Started':
        return <span className="p-1.5 rounded-full bg-purple-500/20 text-purple-400">💬</span>;
      case 'Planning Completed':
        return <span className="p-1.5 rounded-full bg-amber-500/20 text-amber-400">📝</span>;
      case 'Execution Started':
      case 'Execution Completed':
      case 'Tool Execution':
        return <span className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">⚙️</span>;
      case 'Deployment':
        return <span className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400">🌐</span>;
      case 'Bug Fixed':
        return <span className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">🐞</span>;
      default:
        return <span className="p-1.5 rounded-full bg-zinc-800 text-zinc-300">📌</span>;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-200">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
        <div>
          <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Workspace Activity Timeline
          </h3>
          <p className="text-xs text-zinc-400">Real-time enterprise execution & system audit trail</p>
        </div>
        <button
          onClick={fetchActivities}
          className="p-1 text-zinc-400 hover:text-zinc-200 transition"
          title="Refresh timeline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-zinc-500">Loading activity timeline...</div>
      ) : activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-500">No activity recorded yet.</div>
      ) : (
        <div className="relative pl-4 border-l border-zinc-800 space-y-4">
          {activities.map(item => (
            <div key={item.id} className="relative group">
              <div className="absolute -left-[23px] top-0 bg-zinc-900 ring-4 ring-zinc-900 rounded-full text-xs">
                {eventIcon(item.eventType || item.type || '')}
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80 hover:border-zinc-700 transition">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-200">{item.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                <div className="mt-2 text-[10px] text-zinc-500 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">{item.eventType || item.type}</span>
                  {item.projectId && <span className="text-zinc-500">Project: {item.projectId}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
