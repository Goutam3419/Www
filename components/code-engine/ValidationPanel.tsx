'use client';

import React from 'react';
import { CodeValidationIssue } from '@/packages/types/src';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

interface ValidationPanelProps {
  issues?: CodeValidationIssue[];
  validation?: {
    valid?: boolean;
    issues?: CodeValidationIssue[];
    syntaxErrors?: string[];
    typeErrors?: string[];
    securityWarnings?: string[];
  };
  selectedFileName?: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ issues = [], validation, selectedFileName }) => {
  const activeIssues = validation?.issues || issues;
  const errors = activeIssues.filter(i => i.severity === 'error');
  const warnings = activeIssues.filter(i => i.severity === 'warning');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm">Real-time Code Validation</h3>
          <p className="text-xs text-slate-500">
            Syntax checks, typing issues ({errors.length} errors, {warnings.length} warnings) & architecture linting {selectedFileName ? `(${selectedFileName})` : ''}
          </p>
        </div>
      </div>

      {activeIssues.length === 0 ? (
        <div className="p-8 text-center text-emerald-400 bg-emerald-950/20 border border-emerald-900/60 rounded-xl">
          <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <p className="font-semibold text-base text-emerald-200">Zero Code Validation Errors</p>
          <p className="text-xs text-emerald-400/80 mt-1">File syntax, type declarations, and safety guards passed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeIssues.map(issue => (
            <div
              key={issue.id}
              className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                issue.severity === 'error'
                  ? 'border-rose-900/60 bg-rose-950/20 text-rose-300'
                  : issue.severity === 'warning'
                  ? 'border-amber-900/60 bg-amber-950/20 text-amber-300'
                  : 'border-blue-900/60 bg-blue-950/20 text-blue-300'
              }`}
            >
              {issue.severity === 'error' ? (
                <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              ) : issue.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-xs">{issue.title}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded uppercase bg-slate-900 border border-slate-800">
                    {issue.type}
                  </span>
                </div>
                <p className="text-xs opacity-90">{issue.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
