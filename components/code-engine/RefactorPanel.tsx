'use client';

import React, { useState } from 'react';
import { RefactorLogRecord } from '@/packages/types/src';
import { Wrench, Sparkles, Code2, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RefactorPanelProps {
  refactorLogs: RefactorLogRecord[];
  onExecuteRefactor: (data: {
    refactorType: 'rename_symbol' | 'extract_component' | 'optimize_imports';
    targetFilePath: string;
    secondaryFilePath?: string;
    symbolOldName?: string;
    symbolNewName?: string;
    extractedName?: string;
    extractedCode?: string;
  }) => void;
}

export const RefactorPanel: React.FC<RefactorPanelProps> = ({ refactorLogs, onExecuteRefactor }) => {
  const [tab, setTab] = useState<'rename' | 'imports' | 'extract'>('rename');

  // Rename form
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');

  // Extract form
  const [targetFile, setTargetFile] = useState('src/components/Header.tsx');
  const [secondaryFile, setSecondaryFile] = useState('src/components/NavLinks.tsx');
  const [compName, setCompName] = useState('NavLinks');
  const [compCode, setCompCode] = useState('<nav className="flex gap-4"><a href="#">Home</a></nav>');

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldName || !newName) return;
    onExecuteRefactor({
      refactorType: 'rename_symbol',
      targetFilePath: '*',
      symbolOldName: oldName,
      symbolNewName: newName
    });
    setOldName('');
    setNewName('');
  };

  const handleOptimizeImports = () => {
    onExecuteRefactor({
      refactorType: 'optimize_imports',
      targetFilePath: '*'
    });
  };

  const handleExtractComponent = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteRefactor({
      refactorType: 'extract_component',
      targetFilePath: targetFile,
      secondaryFilePath: secondaryFile,
      extractedName: compName,
      extractedCode: compCode
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setTab('rename')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            tab === 'rename'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Rename Symbol Across Project
        </button>
        <button
          onClick={() => setTab('imports')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            tab === 'imports'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Optimize Imports
        </button>
        <button
          onClick={() => setTab('extract')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            tab === 'extract'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" /> Extract Component
        </button>
      </div>

      {tab === 'rename' && (
        <form onSubmit={handleRenameSubmit} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Refactor: Rename Symbol</h4>
          <p className="text-xs text-slate-500">Safely renames types, components, or variables across all project files.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Existing Symbol Name</label>
              <input
                type="text"
                placeholder="e.g. UserProfileCard"
                value={oldName}
                onChange={e => setOldName(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">New Symbol Name</label>
              <input
                type="text"
                placeholder="e.g. AccountCard"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <Button type="submit" size="sm" disabled={!oldName || !newName} className="flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" /> Execute Global Rename
          </Button>
        </form>
      )}

      {tab === 'imports' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Refactor: Optimize & Clean Imports</h4>
          <p className="text-xs text-slate-500">Scans all files to eliminate unused import statements and consolidate duplicate path declarations.</p>
          <Button size="sm" onClick={handleOptimizeImports} className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Optimize All Project Imports
          </Button>
        </div>
      )}

      {tab === 'extract' && (
        <form onSubmit={handleExtractComponent} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Refactor: Extract Component</h4>
          <p className="text-xs text-slate-500">Extracts code block from a monolithic file into a standalone reusable component file.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Source File Path</label>
              <input
                type="text"
                value={targetFile}
                onChange={e => setTargetFile(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">New Component File Path</label>
              <input
                type="text"
                value={secondaryFile}
                onChange={e => setSecondaryFile(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Extracted Component Name</label>
              <input
                type="text"
                value={compName}
                onChange={e => setCompName(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Extracted Code Snippet</label>
              <textarea
                rows={3}
                value={compCode}
                onChange={e => setCompCode(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <Button type="submit" size="sm" className="flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" /> Extract & Create Component
          </Button>
        </form>
      )}

      {/* Refactor History Log */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4">
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-500" /> Refactoring Log History
        </h4>

        {refactorLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No refactoring operations executed yet.</p>
        ) : (
          <div className="space-y-2">
            {refactorLogs.map(log => (
              <div key={log.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {log.refactorType || log.action}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{log.description || `${log.action} on ${log.targetSymbol || 'files'}`}</p>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{new Date(log.timestamp || log.performedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
