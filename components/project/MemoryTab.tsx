'use client';

import React, { useState } from 'react';
import { Project, ProjectMemoryItem } from '@/packages/types/src';
import { Button } from '@/components/ui/Button';
import { MemoryWorkspacePanel } from '@/components/workspace/MemoryWorkspacePanel';
import { Brain, Plus, Tag, Calendar } from 'lucide-react';

interface MemoryTabProps {
  project: Project;
  memories: ProjectMemoryItem[];
  onAddMemory: (memory: Partial<ProjectMemoryItem>) => Promise<void>;
}

export const MemoryTab: React.FC<MemoryTabProps> = ({
  project,
  memories,
  onAddMemory
}) => {
  const [viewMode, setViewMode] = useState<'project_memory' | 'engine_workspace'>('engine_workspace');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'REQUIREMENTS' | 'ARCHITECTURE' | 'DECISIONS' | 'NOTES' | 'PREFERENCES'>('REQUIREMENTS');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || loading) return;

    setLoading(true);
    await onAddMemory({
      title,
      category,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setTitle('');
    setContent('');
    setTags('');
    setLoading(false);
    setShowAdd(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            Memory & Knowledge Engine — {project.name}
          </h2>
          <p className="text-xs text-zinc-400">Contextual Memory Stores, Structured Knowledge & AI Classification</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('engine_workspace')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'engine_workspace' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Memory Engine Workspace
            </button>
            <button
              onClick={() => setViewMode('project_memory')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'project_memory' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Project Context Items
            </button>
          </div>
          {viewMode === 'project_memory' && (
            <Button onClick={() => setShowAdd(!showAdd)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add Memory Item</span>
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'engine_workspace' ? (
        <MemoryWorkspacePanel workspaceId={project.workspaceId || 'ws_enterprise_01'} />
      ) : (
        <>
          {showAdd && (
            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Memory title..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as 'REQUIREMENTS' | 'ARCHITECTURE' | 'DECISIONS' | 'NOTES' | 'PREFERENCES')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="REQUIREMENTS">REQUIREMENTS</option>
                    <option value="ARCHITECTURE">ARCHITECTURE</option>
                    <option value="DECISIONS">DECISIONS</option>
                    <option value="NOTES">NOTES</option>
                    <option value="PREFERENCES">PREFERENCES</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Content / Details</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={3}
                  placeholder="Memory details..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="e.g. database, auth, api"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>Save Memory</Button>
              </div>
            </form>
          )}

          {/* Memory List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.length === 0 ? (
              <div className="col-span-2 text-center p-8 bg-zinc-900/30 border border-zinc-800 rounded-xl text-xs text-zinc-500">
                No memory items stored for this project yet.
              </div>
            ) : (
              memories.map(m => (
                <div key={m.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">{m.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {m.category}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">{m.content}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500">
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-zinc-500" />
                      <span>{m.tags.join(', ') || 'no-tags'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
