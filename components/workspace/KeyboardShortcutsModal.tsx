'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceShortcut } from '@/packages/types/src';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const [shortcuts, setShortcuts] = useState<WorkspaceShortcut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const fetchShortcuts = async () => {
      try {
        const res = await fetch('/api/workspace/shortcuts');
        const data = await res.json();
        if (data.success && active) {
          setShortcuts(data.shortcuts);
        }
      } catch (err) {
        console.error('Failed to fetch shortcuts', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (isOpen) {
      fetchShortcuts();
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-zinc-200">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Workspace Keyboard Shortcuts
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-xs">✕</button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-6 text-center text-xs text-zinc-500">Loading workspace shortcuts...</div>
          ) : (
            categories.map(cat => (
              <div key={cat} className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{cat}</h4>
                <div className="space-y-1.5">
                  {shortcuts.filter(s => s.category === cat).map(s => (
                    <div key={s.action} className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800/80 text-xs">
                      <span className="text-zinc-300">{s.description}</span>
                      <kbd className="px-2 py-1 bg-zinc-800 text-emerald-400 font-mono text-[11px] rounded border border-zinc-700">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
          >
            Close Shortcuts
          </button>
        </div>
      </div>
    </div>
  );
};
