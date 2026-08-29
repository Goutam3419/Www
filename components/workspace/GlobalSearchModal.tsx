'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceSearchResult } from '@/packages/types/src';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: WorkspaceSearchResult) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<WorkspaceSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/workspace/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error('Failed to execute search', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-zinc-200">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, chats, tools, logs..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-100 placeholder-zinc-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500">Searching workspace index...</div>
          ) : query.trim() && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">No matching workspace records found.</div>
          ) : !query.trim() ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              Type keywords to search across Projects, Tasks, Chats, Logs, Tools, and Settings.
            </div>
          ) : (
            results.map((r, idx) => (
              <div
                key={r.id || `search_res_${r.type}_${idx}`}
                onClick={() => {
                  if (onSelectResult) onSelectResult(r);
                  onClose();
                }}
                className="p-3 rounded-lg bg-zinc-950/40 hover:bg-zinc-800/60 border border-zinc-850 hover:border-zinc-700 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-zinc-100">{r.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-emerald-400 font-mono">
                      {r.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{r.subtitle}</p>
                </div>
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))
          )}
        </div>

        {/* Search Footer */}
        <div className="p-2.5 border-t border-zinc-800 bg-zinc-950 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Global Enterprise Search</span>
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded font-mono text-[10px]">Cmd+K</kbd> to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
