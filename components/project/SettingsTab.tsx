'use client';

import React, { useState } from 'react';
import { Project, ProjectSettings } from '@/packages/types/src';
import { Button } from '@/components/ui/Button';
import { Settings, Save, ShieldAlert } from 'lucide-react';

interface SettingsTabProps {
  project: Project;
  settings?: ProjectSettings;
  onUpdateSettings: (updates: Partial<ProjectSettings>) => Promise<void>;
  onUpdateProject: (updates: Partial<Project>) => Promise<void>;
  onDeleteProject: () => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  project,
  settings,
  onUpdateSettings,
  onUpdateProject,
  onDeleteProject
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [aiModel, setAiModel] = useState(settings?.model || 'openrouter/anthropic/claude-3.5-sonnet');
  const [timezone, setTimezone] = useState('UTC');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdateProject({ name, description });
    await onUpdateSettings({ model: aiModel });
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6 text-xs max-w-3xl">
      <div>
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Project Settings — {project.name}
        </h2>
        <p className="text-xs text-zinc-400">Configure environment flags, AI routing defaults, and metadata</p>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Default AI Model</label>
              <select
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="openrouter/anthropic/claude-3.5-sonnet">OpenRouter / Claude 3.5 Sonnet</option>
                <option value="openrouter/google/gemini-2.5-flash">OpenRouter / Gemini 2.5 Flash</option>
                <option value="openrouter/openai/gpt-4o">OpenRouter / GPT-4o</option>
                <option value="google/gemini-2.5-pro">Google Gemini 2.5 Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800/80">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Danger Zone
        </h3>
        <p className="text-zinc-400">
          Soft-deleting this project preserves its audit trail and history in the Platform Database.
        </p>
        <Button variant="destructive" size="sm" onClick={onDeleteProject}>
          Soft Delete Project
        </Button>
      </div>
    </div>
  );
};
