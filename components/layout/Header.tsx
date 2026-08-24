'use client';

import React from 'react';
import { Workspace, Project } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Cpu, ChevronDown, User, Layers, Search, Keyboard } from 'lucide-react';
import { NotificationCenter } from '@/components/workspace/NotificationCenter';

interface HeaderProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (ws: Workspace) => void;
  activeProject: Project | null;
  onOpenNewProjectModal: () => void;
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  activeProject,
  onOpenNewProjectModal,
  onOpenSearch,
  onOpenShortcuts
}) => {
  const [showWsMenu, setShowWsMenu] = React.useState(false);

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Left Branding & Workspace Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold shadow-xs">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
              AI CEO AGENT <span className="text-[10px] px-1.5 py-0.2 bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50">v1.0</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Enterprise Autonomous Platform</p>
          </div>
        </div>

        <div className="h-5 w-px bg-zinc-800 mx-2" />

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWsMenu(!showWsMenu)}
            className="flex items-center space-x-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>{activeWorkspace?.name || 'Select Workspace'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {showWsMenu && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setShowWsMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-800/80 ${
                    activeWorkspace?.id === ws.id ? 'text-indigo-400 bg-zinc-800/40 font-medium' : 'text-zinc-300'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Project Breadcrumb */}
        {activeProject && (
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-semibold text-zinc-100">{activeProject.name}</span>
            <Badge variant="info">{activeProject.status}</Badge>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all"
            title="Global Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="text-[10px] bg-zinc-800 border border-zinc-700 px-1 rounded text-zinc-400 font-mono">⌘K</kbd>
          </button>
        )}

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
            title="Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenNewProjectModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all"
        >
          + New Project
        </button>

        <NotificationCenter workspaceId={activeWorkspace?.id} />

        <div className="hidden lg:flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full text-xs text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Foundation Locked</span>
        </div>

        <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-semibold text-xs">
            <User className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-medium text-zinc-200">CEO Admin</p>
            <p className="text-[10px] text-zinc-500">ceo@enterprise.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
};
