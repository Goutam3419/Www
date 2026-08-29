'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Workspace, Project, ProjectChatMessage, ProjectMemoryItem, ProjectTask, ProjectConnection, ProjectLog, ProjectSettings } from '@/packages/types/src';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { ChatTab } from '@/components/project/ChatTab';
import { OverviewTab } from '@/components/project/OverviewTab';
import { MemoryTab } from '@/components/project/MemoryTab';
import { TasksTab } from '@/components/project/TasksTab';
import { ConnectionsTab } from '@/components/project/ConnectionsTab';
import { LogsTab } from '@/components/project/LogsTab';
import { SettingsTab } from '@/components/project/SettingsTab';
import { NewProjectModal } from '@/components/workspace/NewProjectModal';
import { GlobalSearchModal } from '@/components/workspace/GlobalSearchModal';
import { KeyboardShortcutsModal } from '@/components/workspace/KeyboardShortcutsModal';
import { ActivityTimeline } from '@/components/workspace/ActivityTimeline';
import { PluginRegistryPanel } from '@/components/tools/PluginRegistryPanel';
import { CodeEngineWorkspace } from '@/components/code-engine/CodeEngineWorkspace';
import { AgentOrchestrationPanel } from '@/components/workspace/AgentOrchestrationPanel';
import { WorkspaceManagementPanel } from '@/components/workspace/WorkspaceManagementPanel';
import { MessageSquare, LayoutDashboard, Brain, CheckSquare, Link as LinkIcon, Terminal, Settings, Activity, Puzzle, Code, Users, Building2 } from 'lucide-react';

export default function PlatformPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'chat' | 'overview' | 'workspace' | 'memory' | 'tasks' | 'connections' | 'code_engine' | 'agents' | 'logs' | 'plugins' | 'activity' | 'settings'>('chat');

  // Sub-entity data
  const [chatMessages, setChatMessages] = useState<ProjectChatMessage[]>([]);
  const [memories, setMemories] = useState<ProjectMemoryItem[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [connections, setConnections] = useState<ProjectConnection[]>([]);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [settings, setSettings] = useState<ProjectSettings | undefined>(undefined);

  // Modal States
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Fetch Projects for Active Workspace
  const fetchProjects = useCallback(async (wsId: string) => {
    try {
      const res = await fetch(`/api/projects?workspaceId=${wsId}`);
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
        if (json.data.length > 0) {
          // Keep active project if valid, otherwise choose first
          if (!activeProject || !json.data.some((p: Project) => p.id === activeProject.id)) {
            setActiveProject(json.data[0]);
          }
        } else {
          setActiveProject(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  }, [activeProject]);

  // Fetch Active Project Sub-Entities
  const fetchProjectDetails = useCallback(async (projId: string) => {
    try {
      const [chatRes, memRes, taskRes, connRes, logRes, setRes] = await Promise.all([
        fetch(`/api/projects/${projId}/chat`),
        fetch(`/api/projects/${projId}/memory`),
        fetch(`/api/projects/${projId}/tasks`),
        fetch(`/api/projects/${projId}/connections`),
        fetch(`/api/projects/${projId}/logs`),
        fetch(`/api/projects/${projId}/settings`)
      ]);

      const [chatJson, memJson, taskJson, connJson, logJson, setJson] = await Promise.all([
        chatRes.json(),
        memRes.json(),
        taskRes.json(),
        connRes.json(),
        logRes.json(),
        setRes.json()
      ]);

      if (chatJson.success) setChatMessages(chatJson.data);
      if (memJson.success) setMemories(memJson.data);
      if (taskJson.success) setTasks(taskJson.data);
      if (connJson.success) setConnections(connJson.data);
      if (logJson.success) setLogs(logJson.data);
      if (setJson.success) setSettings(setJson.data);
    } catch (err) {
      console.error('Failed to fetch project details', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        const wsRes = await fetch('/api/workspaces');
        const wsJson = await wsRes.json();
        if (wsJson.success && wsJson.data.length > 0 && isMounted) {
          setWorkspaces(wsJson.data);
          const firstWs = wsJson.data[0];
          setActiveWorkspace(firstWs);

          const projRes = await fetch(`/api/projects?workspaceId=${firstWs.id}`);
          const projJson = await projRes.json();
          if (projJson.success && projJson.data.length > 0 && isMounted) {
            setProjects(projJson.data);
            const firstProj = projJson.data[0];
            setActiveProject(firstProj);
          }
        }
      } catch (err) {
        console.error('Failed to initialize platform data', err);
      }
    }
    initData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    let isMounted = true;
    async function loadWorkspaceProjects() {
      try {
        const res = await fetch(`/api/projects?workspaceId=${activeWorkspace!.id}`);
        const json = await res.json();
        if (json.success && isMounted) {
          setProjects(json.data);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    }
    loadWorkspaceProjects();
    return () => { isMounted = false; };
  }, [activeWorkspace]);

  useEffect(() => {
    if (!activeProject) return;
    let isMounted = true;
    async function loadDetails() {
      try {
        const [chatRes, memRes, taskRes, connRes, logRes, setRes] = await Promise.all([
          fetch(`/api/projects/${activeProject!.id}/chat`),
          fetch(`/api/projects/${activeProject!.id}/memory`),
          fetch(`/api/projects/${activeProject!.id}/tasks`),
          fetch(`/api/projects/${activeProject!.id}/connections`),
          fetch(`/api/projects/${activeProject!.id}/logs`),
          fetch(`/api/projects/${activeProject!.id}/settings`)
        ]);

        const [chatJson, memJson, taskJson, connJson, logJson, setJson] = await Promise.all([
          chatRes.json(),
          memRes.json(),
          taskRes.json(),
          connRes.json(),
          logRes.json(),
          setRes.json()
        ]);

        if (isMounted) {
          if (chatJson.success) setChatMessages(chatJson.data);
          if (memJson.success) setMemories(memJson.data);
          if (taskJson.success) setTasks(taskJson.data);
          if (connJson.success) setConnections(connJson.data);
          if (logJson.success) setLogs(logJson.data);
          if (setJson.success) setSettings(setJson.data);
        }
      } catch (err) {
        console.error('Failed to load project details', err);
      }
    }
    loadDetails();
    return () => { isMounted = false; };
  }, [activeProject]);

  // Actions
  const handleCreateProject = async (projData: { name: string; description: string; framework: string; language: string }) => {
    if (!activeWorkspace) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projData,
          workspaceId: activeWorkspace.id
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchProjects(activeWorkspace.id);
        setActiveProject(json.data);
      }
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sender: 'USER', senderName: 'CEO' })
      });
      const json = await res.json();
      if (json.success) {
        fetchProjectDetails(activeProject.id);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleAddMemory = async (memory: Partial<ProjectMemoryItem>) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory)
      });
      const json = await res.json();
      if (json.success) {
        fetchProjectDetails(activeProject.id);
      }
    } catch (err) {
      console.error('Failed to add memory', err);
    }
  };

  const handleAddTask = async (task: Partial<ProjectTask>) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const json = await res.json();
      if (json.success) {
        fetchProjectDetails(activeProject.id);
      }
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const handleUpsertConnection = async (provider: 'GitHub' | 'Vercel' | 'Firebase' | 'Supabase' | 'OpenRouter', config: Record<string, string>) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config })
      });
      const json = await res.json();
      if (json.success) {
        fetchProjectDetails(activeProject.id);
      }
    } catch (err) {
      console.error('Failed to upsert connection', err);
    }
  };

  const handleUpdateSettings = async (updates: Partial<ProjectSettings>) => {
    if (!activeProject) return;
    try {
      await fetch(`/api/projects/${activeProject.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchProjectDetails(activeProject.id);
    } catch (err) {
      console.error('Failed to update settings', err);
    }
  };

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success && activeWorkspace) {
        setActiveProject(json.data);
        fetchProjects(activeWorkspace.id);
      }
    } catch (err) {
      console.error('Failed to update project', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject || !activeWorkspace) return;
    try {
      await fetch(`/api/projects/${activeProject.id}`, { method: 'DELETE' });
      fetchProjects(activeWorkspace.id);
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const navigationTabs = [
    { id: 'chat', label: 'AI CEO Chat', icon: MessageSquare },
    { id: 'overview', label: 'Overview & Architecture', icon: LayoutDashboard },
    { id: 'workspace', label: 'Workspace & Multi-Tenant', icon: Building2 },
    { id: 'code_engine', label: 'Enterprise Coding Engine', icon: Code },
    { id: 'agents', label: 'Multi-Agent Orchestration', icon: Users },
    { id: 'memory', label: 'Project Memory', icon: Brain },
    { id: 'tasks', label: 'Task Board', icon: CheckSquare },
    { id: 'connections', label: 'Integrations', icon: LinkIcon },
    { id: 'plugins', label: 'Plugin Registry', icon: Puzzle },
    { id: 'activity', label: 'Activity Timeline', icon: Activity },
    { id: 'logs', label: 'Activity Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={ws => {
          setActiveWorkspace(ws);
          fetchProjects(ws.id);
        }}
        activeProject={activeProject}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          projects={projects}
          activeProject={activeProject}
          onSelectProject={p => setActiveProject(p)}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        />

        {/* Center Main Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950">
          {activeProject ? (
            <>
              {/* Center Tab Header */}
              <div className="px-6 border-b border-zinc-800/80 bg-zinc-950/90 flex items-center space-x-1 overflow-x-auto scrollbar-none shrink-0 pt-2">
                {navigationTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center space-x-2 px-3 py-2.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20 rounded-t-lg'
                          : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 rounded-t-lg'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Center Tab View Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {activeTab === 'chat' && (
                  <ChatTab
                    project={activeProject}
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                  />
                )}
                {activeTab === 'overview' && (
                  <OverviewTab project={activeProject} settings={settings} />
                )}
                {activeTab === 'workspace' && (
                  <WorkspaceManagementPanel
                    currentWorkspaceId={activeWorkspace?.id}
                    onWorkspaceSwitched={wsId => fetchProjects(wsId)}
                  />
                )}
                {activeTab === 'memory' && (
                  <MemoryTab
                    project={activeProject}
                    memories={memories}
                    onAddMemory={handleAddMemory}
                  />
                )}
                {activeTab === 'tasks' && (
                  <TasksTab
                    project={activeProject}
                    tasks={tasks}
                    onAddTask={handleAddTask}
                  />
                )}
                {activeTab === 'connections' && (
                  <ConnectionsTab
                    project={activeProject}
                    connections={connections}
                    onUpsertConnection={handleUpsertConnection}
                  />
                )}
                {activeTab === 'code_engine' && (
                  <CodeEngineWorkspace project={activeProject} />
                )}
                {activeTab === 'agents' && (
                  <AgentOrchestrationPanel workspaceId={activeWorkspace?.id} />
                )}
                {activeTab === 'plugins' && (
                  <PluginRegistryPanel />
                )}
                {activeTab === 'activity' && (
                  <ActivityTimeline
                    workspaceId={activeWorkspace?.id}
                    projectId={activeProject.id}
                  />
                )}
                {activeTab === 'logs' && (
                  <LogsTab
                    project={activeProject}
                    logs={logs}
                    onRefresh={() => fetchProjectDetails(activeProject.id)}
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab
                    project={activeProject}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onUpdateProject={handleUpdateProject}
                    onDeleteProject={handleDeleteProject}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-200">No Project Selected</h3>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Select a project from the left sidebar or create a new enterprise project to begin.
                </p>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all"
              >
                + Create Enterprise Project
              </button>
            </div>
          )}
        </main>

        {/* Right Info Panel */}
        <RightPanel
          activeProject={activeProject}
          connections={connections}
          memories={memories}
        />
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
