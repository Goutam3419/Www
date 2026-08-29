'use client';

import React, { useState } from 'react';
import { Project, ProjectConnection } from '@/packages/types/src';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'lucide-react';
import { GitHubWorkspacePanel } from '@/components/workspace/GitHubWorkspacePanel';
import { VercelWorkspacePanel } from '@/components/workspace/VercelWorkspacePanel';
import { FirebaseWorkspacePanel } from '@/components/workspace/FirebaseWorkspacePanel';

interface ConnectionsTabProps {
  project: Project;
  connections: ProjectConnection[];
  onUpsertConnection: (provider: 'GitHub' | 'Vercel' | 'Firebase' | 'Supabase' | 'OpenRouter', config: Record<string, string>) => Promise<void>;
}

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  project,
  connections,
  onUpsertConnection
}) => {
  const [activeModalProvider, setActiveModalProvider] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [repoInput, setRepoInput] = useState('');

  const providers = [
    { name: 'GitHub', description: 'Repository creation, commit & push automation' },
    { name: 'Vercel', description: 'Serverless deployment & live preview hosting' },
    { name: 'Firebase', description: 'User authentication & Cloud Firestore setup' },
    { name: 'Supabase', description: 'PostgreSQL database & real-time API integrations' },
    { name: 'OpenRouter', description: 'Multi-model LLM router key & routing policy' }
  ] as const;

  const handleSave = async () => {
    if (!activeModalProvider) return;
    await onUpsertConnection(activeModalProvider as 'GitHub' | 'Vercel' | 'Firebase' | 'Supabase' | 'OpenRouter', {
      apiKey: keyInput || 'masked_key_verified',
      repository: repoInput || 'default_repo'
    });
    setActiveModalProvider(null);
    setKeyInput('');
    setRepoInput('');
  };

  return (
    <div className="p-6 space-y-6 text-xs">
      <div>
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Link className="w-5 h-5 text-indigo-400" />
          Project Integrations & Connections — {project.name}
        </h2>
        <p className="text-xs text-zinc-400">Configure external platform connectors for code, database, and deployments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map(p => {
          const connected = connections.find(c => c.provider === p.name);
          return (
            <div key={p.name} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-200 text-sm">{p.name}</h3>
                  {connected ? (
                    <Badge variant="success">CONNECTED</Badge>
                  ) : (
                    <Badge variant="outline">DISCONNECTED</Badge>
                  )}
                </div>
                <p className="text-zinc-400 text-xs">{p.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <span className="text-[10px] text-zinc-500">
                  {connected ? `Last tested: ${new Date(connected.lastTestedAt || '').toLocaleDateString()}` : 'Not configured'}
                </span>
                <Button size="sm" variant={connected ? 'outline' : 'default'} onClick={() => setActiveModalProvider(p.name)}>
                  {connected ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub, Vercel & Firebase Workspace Read-Only Panels */}
      <div className="pt-4 space-y-6">
        <GitHubWorkspacePanel repoFullName={`owner/${project.name.toLowerCase().replace(/\s+/g, '-')}`} />
        <VercelWorkspacePanel projectId={`prj_${project.id}`} projectName={project.name} />
        <FirebaseWorkspacePanel projectId={project.id} />
      </div>

      {activeModalProvider && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm">Configure {activeModalProvider} Connection</h3>
            <p className="text-zinc-400 text-xs">
              Provide authorization credentials or API tokens for {activeModalProvider}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">API Token / Access Key</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  placeholder="Paste access key..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Target Identifier / Repository</label>
                <input
                  type="text"
                  value={repoInput}
                  onChange={e => setRepoInput(e.target.value)}
                  placeholder="e.g. org/repo or project-id"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" onClick={() => setActiveModalProvider(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save Connection</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
