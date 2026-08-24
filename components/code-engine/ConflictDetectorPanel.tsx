'use client';

import React from 'react';
import { CodeConflictIssue } from '@/packages/types/src';
import { AlertOctagon, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConflictDetectorPanelProps {
  conflicts: CodeConflictIssue[];
  onRefreshConflicts: () => void;
}

export const ConflictDetectorPanel: React.FC<ConflictDetectorPanelProps> = ({ conflicts, onRefreshConflicts }) => {
  const errors = conflicts.filter(c => c.severity === 'error');
  const warnings = conflicts.filter(c => c.severity === 'warning');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Architectural Conflict Detector</h3>
          <p className="text-xs text-slate-500">Scans project for duplicate components, circular imports, broken references & duplicate routes</p>
        </div>
        <Button size="sm" variant="outline" onClick={onRefreshConflicts} className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Re-scan Project
        </Button>
      </div>

      {conflicts.length === 0 ? (
        <div className="p-8 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
          <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <p className="font-semibold text-base text-emerald-800 dark:text-emerald-200">Zero Architecture Conflicts Detected</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            No circular imports, duplicate components, broken paths, or route collisions found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-4 h-4" /> {errors.length} Critical Error(s)
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" /> {warnings.length} Warning(s)
            </span>
          </div>

          <div className="space-y-3">
            {conflicts.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${
                  item.severity === 'error'
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          item.severity === 'error'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{item.description}</p>
                    {item.suggestion && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium pt-1">
                        💡 Suggestion: {item.suggestion}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap gap-1.5">
                  {item.affectedFiles.map((file, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
