'use client';

import React from 'react';
import { Project } from '@/packages/types/src';
import { FolderGit2, Plus, Clock, CheckCircle2, AlertCircle, Archive, Rocket, Activity, Layers } from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onOpenNewProjectModal: () => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  Planning: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  'In Progress': <Activity className="w-3.5 h-3.5 text-indigo-400" />,
  Review: <AlertCircle className="w-3.5 h-3.5 text-sky-400" />,
  Testing: <Layers className="w-3.5 h-3.5 text-purple-400" />,
  Deployment: <Rocket className="w-3.5 h-3.5 text-orange-400" />,
  Production: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  Completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  Archived: <Archive className="w-3.5 h-3.5 text-zinc-500" />
};

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenNewProjectModal
}) => {
  const [filter, setFilter] = React.useState<string>('ALL');

  const filteredProjects = projects.filter(p => {
    if (filter === 'ALL') return !p.archived;
    if (filter === 'ARCHIVED') return p.archived;
    return p.status === filter;
  });

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/70 flex flex-col h-[calc(100vh-4rem)] shrink-0 select-none">
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <span>Projects ({projects.length})</span>
        </div>
        <button
          onClick={onOpenNewProjectModal}
          className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
          title="New Project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 border-b border-zinc-800/40 flex items-center space-x-1 overflow-x-auto text-[11px] scrollbar-none">
        {['ALL', 'Planning', 'In Progress', 'Production', 'ARCHIVED'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2 py-1 rounded-md whitespace-nowrap transition-all ${
              filter === tab
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredProjects.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            No projects found in this section.
          </div>
        ) : (
          filteredProjects.map(p => {
            const isActive = activeProject?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProject(p)}
                className={`w-full text-left p-2.5 rounded-lg transition-all border flex flex-col space-y-1 ${
                  isActive
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-zinc-100 shadow-xs'
                    : 'bg-zinc-900/30 border-transparent hover:bg-zinc-900/80 hover:border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-semibold truncate ${isActive ? 'text-indigo-300' : 'text-zinc-200'}`}>
                    {p.name}
                  </span>
                  {statusIcons[p.status]}
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{p.framework}</span>
                  <span className="capitalize">{p.environment}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-800/60 bg-zinc-900/30 text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Storage: PostgreSQL</span>
        <span className="text-emerald-400 font-medium">Synced</span>
      </div>
    </aside>
  );
};
