'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: { name: string; description: string; framework: string; language: string }) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('Next.js 15');
  const [language, setLanguage] = useState('TypeScript');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || loading) return;

    setLoading(true);
    await onCreate({ name, description, framework, language });
    setName('');
    setDescription('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Enterprise Project">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-zinc-300 font-medium mb-1">Project Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Coffee Shop Website, SaaS Billing Engine"
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
            placeholder="Brief project goals and scope..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Project Type / Framework</label>
            <select
              value={framework}
              onChange={e => setFramework(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Next.js 15">Next.js 15 (App Router)</option>
              <option value="React 19">React 19 (SPA)</option>
              <option value="Vue.js">Vue.js 3</option>
              <option value="Angular">Angular</option>
              <option value="Node.js">Node.js Express</option>
              <option value="Python">Python App</option>
              <option value="FastAPI">FastAPI Backend</option>
              <option value="Flutter">Flutter Mobile</option>
              <option value="React Native">React Native</option>
              <option value="AI Agent">AI Agent Workflow</option>
              <option value="CLI Tool">CLI Tool</option>
              <option value="REST API">REST / GraphQL API</option>
              <option value="Full Stack">Full Stack Monorepo</option>
              <option value="Blank Project">Blank Project</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Dart">Dart</option>
              <option value="Go">Go</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
};
