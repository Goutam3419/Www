'use client';

import React from 'react';
import { CodePatchRecord, CodeDiffRecord } from '@/packages/types/src';
import { FileDiff } from 'lucide-react';

interface DiffViewerPanelProps {
  patch?: CodePatchRecord;
  diffs: CodeDiffRecord[];
}

export const DiffViewerPanel: React.FC<DiffViewerPanelProps> = ({ patch, diffs }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm">Visual Code Diff Viewer</h3>
          <p className="text-xs text-slate-500">Side-by-side / unified file diffs for patch commits and edits</p>
        </div>
        {patch && (
          <span className="text-xs font-mono px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-md">
            Patch: {patch.patchId}
          </span>
        )}
      </div>

      {diffs.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
          <FileDiff className="w-10 h-10 mx-auto mb-2 text-slate-700" />
          <p className="text-sm font-medium">No diff records to display.</p>
          <p className="text-xs text-slate-600 mt-1">Select a patch from Patches tab or perform a file edit to inspect diffs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {diffs.map(diff => (
            <div key={diff.diffId} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 font-mono text-xs">
                <span className="text-slate-200 font-medium">{diff.filePath}</span>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-emerald-400">+{diff.addedLines} lines</span>
                  <span className="text-rose-400">-{diff.removedLines} lines</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto space-y-1">
                {diff.hunks.flatMap((hunk, hIdx) =>
                  hunk.lines.map((line, lIdx) => {
                    const isAdd = line.startsWith('+');
                    const isRemove = line.startsWith('-');
                    return (
                      <div
                        key={`${hIdx}-${lIdx}`}
                        className={`px-2 py-0.5 rounded ${
                          isAdd
                            ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                            : isRemove
                            ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                            : 'text-slate-400'
                        }`}
                      >
                        <pre className="whitespace-pre-wrap">{line}</pre>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
