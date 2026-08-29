'use client';

import React from 'react';
import { CodeTemplateRecord } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { Layers, CheckCircle2 } from 'lucide-react';

interface TemplateManagerPanelProps {
  templates: CodeTemplateRecord[];
  selectedTemplateId?: string;
  onSelectTemplate?: (templateId: string) => void;
}

export const TemplateManagerPanel: React.FC<TemplateManagerPanelProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Versioned Production Code Templates</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Architecture baselines for Next.js, FastAPI, Node.js, React, Flutter, and Blank projects.
          </p>
        </div>
        <Badge variant="info">{templates.length} Templates Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map(t => {
          const isSelected = selectedTemplateId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => onSelectTemplate && onSelectTemplate(t.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-200">{t.name}</span>
                  <Badge variant="default">{t.framework}</Badge>
                </div>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{t.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="font-mono">{t.language || 'TypeScript'} {t.version ? `v${t.version}` : ''}</span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-indigo-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
