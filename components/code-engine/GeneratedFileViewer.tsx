'use client';

import React from 'react';
import { GeneratedFileRecord } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { FileCode, Shield, Code, CheckCircle, AlertTriangle } from 'lucide-react';
import { codeValidationEngine } from '@/services/code-engine/code-validator';

interface GeneratedFileViewerProps {
  file?: GeneratedFileRecord;
}

export const GeneratedFileViewer: React.FC<GeneratedFileViewerProps> = ({ file }) => {
  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        <Code className="w-8 h-8 text-zinc-600 mb-2" />
        <p className="text-sm font-medium">No file selected for inspection.</p>
        <p className="text-xs text-zinc-600 mt-1">Select a file from the Project Structure explorer to view generated code.</p>
      </div>
    );
  }

  const validation = codeValidationEngine.validateCode(file.content, file.name, 'TypeScript');

  return (
    <div className="h-full flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden">
      {/* File Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-medium text-zinc-200">{file.path}</span>
          <Badge variant="info">{file.fileType}</Badge>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 font-mono text-zinc-400">
            <span>{file.sizeBytes || file.content?.length || 0} B</span>
          </div>
          <div className="flex items-center space-x-1">
            {validation.valid ? (
              <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" />
                <span>Score {validation.score}/100</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-500/20">
                <AlertTriangle className="w-3 h-3" />
                <span>Issues Found</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            Read-Only Mode
          </span>
        </div>
      </div>

      {/* Code Editor Content View */}
      <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre font-normal">
        {file.content}
      </div>

      {/* Metadata Footer */}
      <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center space-x-4 font-mono">
          <span>Imports: {file.imports?.length || 0}</span>
          <span>Exports: {file.exports?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Workspace Isolated</span>
        </div>
      </div>
    </div>
  );
};
