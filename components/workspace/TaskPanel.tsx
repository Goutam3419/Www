'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProjectTask, TaskStatus, TaskPriority } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';

interface TaskPanelProps {
  projectId: string;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'LIST' | 'PROGRESS' | 'DEPENDENCIES'>('LIST');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await fetchTasks();
    };
    run();
    return () => {
      active = false;
    };
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const statusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'DONE': return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
      case 'BLOCKED': return <Badge variant="destructive">Blocked</Badge>;
      default: return <Badge variant="default">To Do</Badge>;
    }
  };

  const priorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL': return <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">Critical</span>;
      case 'HIGH': return <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">High</span>;
      case 'MEDIUM': return <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">Medium</span>;
      default: return <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 font-medium">Low</span>;
    }
  };

  const completedCount = tasks.filter(t => t.status === 'DONE').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-800 text-zinc-200">
      {/* Task Panel Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Task Engine Panel
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Execution tracking for AI CEO & Project Tasks</p>
        </div>
        <button
          onClick={fetchTasks}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition"
          title="Refresh tasks"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 text-xs px-3 bg-zinc-950/40">
        <button
          onClick={() => setActiveTab('LIST')}
          className={`py-2 px-3 border-b-2 font-medium transition ${activeTab === 'LIST' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('PROGRESS')}
          className={`py-2 px-3 border-b-2 font-medium transition ${activeTab === 'PROGRESS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          Progress ({progressPercent}%)
        </button>
        <button
          onClick={() => setActiveTab('DEPENDENCIES')}
          className={`py-2 px-3 border-b-2 font-medium transition ${activeTab === 'DEPENDENCIES' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          Dependencies
        </button>
      </div>

      {/* Filters Bar */}
      {activeTab === 'LIST' && (
        <div className="p-2 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2 py-1 rounded transition text-[11px] font-medium ${filterStatus === st ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:bg-zinc-800'}`}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-500">Loading task engine data...</div>
        ) : activeTab === 'LIST' ? (
          filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">No tasks match filter.</div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-xs text-zinc-200">{task.title}</span>
                  {statusBadge(task.status)}
                </div>
                {task.description && (
                  <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{task.description}</p>
                )}
                <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                  <div className="flex items-center gap-2">
                    {priorityBadge(task.priority)}
                    {task.assignedRole && <span className="text-zinc-400 font-mono">@{task.assignedRole}</span>}
                  </div>
                  <span>{new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )
        ) : activeTab === 'PROGRESS' ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 text-center">
              <span className="text-3xl font-bold text-emerald-400">{progressPercent}%</span>
              <p className="text-xs text-zinc-400 mt-1">Project Milestone Completion</p>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-zinc-950/40 rounded border border-zinc-800">
                <span className="text-zinc-400">Total Tasks</span>
                <p className="text-lg font-semibold text-zinc-200">{tasks.length}</p>
              </div>
              <div className="p-3 bg-zinc-950/40 rounded border border-zinc-800">
                <span className="text-zinc-400">Completed</span>
                <p className="text-lg font-semibold text-emerald-400">{completedCount}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs text-zinc-400">
            <h4 className="font-medium text-zinc-200 mb-2">Task Dependency Chain</h4>
            <p className="text-[11px]">Tasks are ordered sequentially for AI Agent execution context isolation.</p>
            <div className="mt-3 space-y-2">
              {tasks.map((t, idx) => (
                <div key={t.id} className="flex items-center gap-2 text-[11px] font-mono text-zinc-300 bg-zinc-900/80 p-2 rounded">
                  <span className="text-emerald-400 font-bold">#{idx + 1}</span>
                  <span className="truncate flex-1">{t.title}</span>
                  {idx > 0 && <span className="text-zinc-500">dep: #{idx}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
