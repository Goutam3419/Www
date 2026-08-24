'use client';

import React from 'react';
import { CodePatchRecord } from '@/packages/types/src';
import { GitCommit, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PatchHistoryPanelProps {
  patches: CodePatchRecord[];
  onSelectPatch: (patch: CodePatchRecord) => void;
  onRollbackPatch: (patchId: string) => void;
}

export const PatchHistoryPanel: React.FC<PatchHistoryPanelProps> = ({
  patches,
  onSelectPatch,
  onRollbackPatch
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm">Code Patch Engine & Commits</h3>
          <p className="text-xs text-slate-500">Atomic code mutations, checksums, author logs & patch rollbacks</p>
        </div>
      </div>

      {patches.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
          <GitCommit className="w-10 h-10 mx-auto mb-2 text-slate-700" />
          <p className="text-sm font-medium">No code patches applied yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patches.map(patch => (
            <div key={patch.patchId} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <GitCommit className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono text-xs text-indigo-300 font-semibold">{patch.patchId}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                    patch.status === 'applied' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {patch.status}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium">{patch.description}</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                  <span>Author: {patch.appliedBy}</span>
                  <span>Files: {patch.filesModified.length}</span>
                  <span>Applied: {new Date(patch.appliedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => onSelectPatch(patch)}>
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Diff
                </Button>
                {patch.status === 'applied' && (
                  <Button size="sm" variant="destructive" onClick={() => onRollbackPatch(patch.patchId)}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Rollback
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
