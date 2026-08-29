'use client';

import React from 'react';
import { DependencyAnalysisRecord, PackageManagerType } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { Package, AlertCircle, CheckCircle, Terminal } from 'lucide-react';
import { PackageManagerInterface } from '@/services/code-engine/dependency-analyzer';

interface DependencyPanelProps {
  analysis?: DependencyAnalysisRecord;
  packageManager?: PackageManagerType;
}

export const DependencyPanel: React.FC<DependencyPanelProps> = ({
  analysis,
  packageManager = 'npm'
}) => {
  if (!analysis) {
    return (
      <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-900/30 text-zinc-500 text-xs">
        No dependency analysis recorded for this project yet. Generate project structure to analyze packages.
      </div>
    );
  }

  const missingList = analysis.missingPackages || [];
  const installCmd = PackageManagerInterface.generateInstallCommand(packageManager, missingList.length > 0 ? missingList : ['next', 'react']);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Dependency Analyzer & Package Manager Interface</h3>
        </div>
        <Badge variant="success">Package Manager: {analysis.packageManager || packageManager}</Badge>
      </div>

      {/* Package Manager Dry-Run Command Banner */}
      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2 text-zinc-300">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>{installCmd.command} {installCmd.args.join(' ')}</span>
        </div>
        <Badge variant="info">Execution Next Phase</Badge>
      </div>

      {/* Conflicts and Missing Alert */}
      {missingList.length > 0 ? (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-semibold">Missing Packages Detected:</span> {missingList.join(', ')}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>All required core framework dependencies satisfied cleanly.</span>
        </div>
      )}

      {/* Dependencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <h4 className="text-xs font-semibold text-zinc-300 mb-2 font-mono">declared dependencies</h4>
          <div className="space-y-1.5 font-mono text-xs">
            {Array.isArray(analysis.dependencies) ? (
              analysis.dependencies.map((dep, idx) => {
                const name = typeof dep === 'string' ? dep : dep.name;
                const version = typeof dep === 'string' ? '' : dep.version;
                return (
                  <div key={name || idx} className="flex justify-between py-1 px-2 rounded bg-zinc-950/60 text-zinc-300">
                    <span>{name}</span>
                    <span className="text-zinc-500">{version}</span>
                  </div>
                );
              })
            ) : Object.entries(analysis.dependencies || {}).length > 0 ? (
              Object.entries(analysis.dependencies).map(([pkg, ver]) => (
                <div key={pkg} className="flex justify-between py-1 px-2 rounded bg-zinc-950/60 text-zinc-300">
                  <span>{pkg}</span>
                  <span className="text-zinc-500">{String(ver)}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 italic">No standard dependencies declared.</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <h4 className="text-xs font-semibold text-zinc-300 mb-2 font-mono">devDependencies</h4>
          <div className="space-y-1.5 font-mono text-xs">
            {Object.entries(analysis.devDependencies || {}).length > 0 ? (
              Object.entries(analysis.devDependencies).map(([pkg, ver]) => (
                <div key={pkg} className="flex justify-between py-1 px-2 rounded bg-zinc-950/60 text-zinc-300">
                  <span>{pkg}</span>
                  <span className="text-zinc-500">{String(ver)}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 italic">No dev dependencies declared.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
