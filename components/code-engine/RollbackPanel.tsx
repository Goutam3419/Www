'use client';

import React, { useState } from 'react';
import { CodePatchRecord, RollbackHistoryRecord } from '@/packages/types/src';
import { RotateCcw, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RollbackPanelProps {
  patches: CodePatchRecord[];
  rollbackHistory: RollbackHistoryRecord[];
  onRollbackPatch: (patchId: string, reason?: string) => void;
  onRollbackFile: (filePath: string) => void;
}

export const RollbackPanel: React.FC<RollbackPanelProps> = ({
  patches,
  rollbackHistory,
  onRollbackPatch,
  onRollbackFile
}) => {
  const [selectedPatchId, setSelectedPatchId] = useState('');
  const [reason, setReason] = useState('');
  const [filePathToRevert, setFilePathToRevert] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm">Rollback & Snapshot Manager</h3>
          <p className="text-xs text-slate-500">Safely revert patches or restore individual file snapshots</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rollback Patch Form */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-rose-400" /> Revert Patch State
          </h4>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium">Select Patch to Roll Back</label>
            <select
              value={selectedPatchId}
              onChange={(e) => setSelectedPatchId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <option value="">-- Choose Applied Patch --</option>
              {patches.filter(p => p.status === 'applied').map(p => (
                <option key={p.patchId} value={p.patchId}>
                  {p.patchId} - {p.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium">Rollback Reason (Optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Breaking change detected"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
          </div>

          <Button
            variant="destructive"
            size="sm"
            disabled={!selectedPatchId}
            onClick={() => {
              if (selectedPatchId) {
                onRollbackPatch(selectedPatchId, reason);
                setSelectedPatchId('');
                setReason('');
              }
            }}
            className="w-full"
          >
            Execute Patch Rollback
          </Button>
        </div>

        {/* Rollback Single File Form */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" /> Revert File Snapshot
          </h4>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium">File Path to Restore</label>
            <input
              type="text"
              value={filePathToRevert}
              onChange={(e) => setFilePathToRevert(e.target.value)}
              placeholder="e.g. components/Header.tsx"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Restores the file to its last recorded snapshot prior to the most recent modification.
          </p>

          <Button
            variant="outline"
            size="sm"
            disabled={!filePathToRevert}
            onClick={() => {
              if (filePathToRevert) {
                onRollbackFile(filePathToRevert);
                setFilePathToRevert('');
              }
            }}
            className="w-full"
          >
            Revert File to Previous Snapshot
          </Button>
        </div>
      </div>

      {/* Rollback Log */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Rollback Audit Log ({rollbackHistory.length})</h4>
        {rollbackHistory.length === 0 ? (
          <p className="text-xs text-slate-500">No rollbacks performed.</p>
        ) : (
          <div className="space-y-2">
            {rollbackHistory.map(item => (
              <div key={item.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-rose-400 font-bold">Rolled back patch {item.targetPatchId}</span>
                  <p className="text-[11px] text-slate-500">{item.reason}</p>
                </div>
                <span className="text-slate-600 text-[10px]">{new Date(item.performedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
