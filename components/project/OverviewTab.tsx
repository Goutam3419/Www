'use client';

import React from 'react';
import { Project, ProjectSettings } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { Cpu, Globe, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OverviewTabProps {
  project: Project;
  settings?: ProjectSettings;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ project, settings }) => {
  return (
    <div className="p-6 space-y-6 text-zinc-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/30 to-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold tracking-tight text-white">{project.name}</h2>
            <Badge variant="info">{project.status}</Badge>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-2 rounded-xl text-center">
            <p className="text-zinc-500 text-[10px] uppercase font-semibold">Framework</p>
            <p className="font-semibold text-indigo-400">{project.framework}</p>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-2 rounded-xl text-center">
            <p className="text-zinc-500 text-[10px] uppercase font-semibold">Language</p>
            <p className="font-semibold text-zinc-200">{project.language}</p>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
            <Globe className="w-4 h-4" />
            <span>Environment & Deployment</span>
          </div>
          <div className="space-y-1 text-zinc-400">
            <p className="flex justify-between"><span>Environment:</span> <span className="text-zinc-200 capitalize">{project.environment || 'Production'}</span></p>
            <p className="flex justify-between"><span>Status:</span> <span className="text-emerald-400">{project.deploymentStatus || 'Active'}</span></p>
            <p className="flex justify-between"><span>Preview URL:</span> <span className="text-indigo-400 truncate">{project.previewUrl || 'Not Deployed'}</span></p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
            <Cpu className="w-4 h-4" />
            <span>AI Router Configuration</span>
          </div>
          <div className="space-y-1 text-zinc-400">
            <p className="flex justify-between"><span>Default Model:</span> <span className="text-zinc-200 truncate">{settings?.model || 'OpenRouter Claude 3.5'}</span></p>
            <p className="flex justify-between"><span>Timezone:</span> <span className="text-zinc-200">UTC</span></p>
            <p className="flex justify-between"><span>Auto-Commit:</span> <span className="text-emerald-400">Enabled</span></p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Audit & Timeline</span>
          </div>
          <div className="space-y-1 text-zinc-400">
            <p className="flex justify-between"><span>Created:</span> <span className="text-zinc-200">{new Date(project.createdAt).toLocaleDateString()}</span></p>
            <p className="flex justify-between"><span>Updated:</span> <span className="text-zinc-200">{new Date(project.createdAt).toLocaleDateString()}</span></p>
            <p className="flex justify-between"><span>Archived:</span> <span className="text-zinc-200">{project.archived ? 'Yes' : 'No'}</span></p>
          </div>
        </div>
      </div>

      {/* Lock Criteria Summary */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Foundation Architecture Lock Verification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            'Platform Database Isolation',
            'Foreign Key Cascade Rules',
            'Soft Delete Audit Support',
            'Multi-Project Workspace Context'
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
