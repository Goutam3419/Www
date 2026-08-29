'use client';

import React, { useState, useEffect } from 'react';
import { Project, CodeProjectRecord, GeneratedFolderRecord, GeneratedFileRecord, CodeTemplateRecord, DependencyAnalysisRecord, SupportedFramework, CodePatchRecord, CodeDiffRecord, RollbackHistoryRecord, RefactorLogRecord, CodeConflictIssue } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';
import { ProjectStructureTree } from './ProjectStructureTree';
import { GeneratedFileViewer } from './GeneratedFileViewer';
import { TemplateManagerPanel } from './TemplateManagerPanel';
import { DependencyPanel } from './DependencyPanel';
import { ValidationPanel } from './ValidationPanel';
import { DiffViewerPanel } from './DiffViewerPanel';
import { PatchHistoryPanel } from './PatchHistoryPanel';
import { RollbackPanel } from './RollbackPanel';
import { RefactorPanel } from './RefactorPanel';
import { ConflictDetectorPanel } from './ConflictDetectorPanel';
import { Code, FilePlus, Shield, Package, ShieldCheck, GitCommit, GitPullRequest, RotateCcw, Wrench, AlertTriangle } from 'lucide-react';
import { codeValidationEngine } from '@/services/code-engine/code-validator';

interface CodeEngineWorkspaceProps {
  project: Project;
}

export const CodeEngineWorkspace: React.FC<CodeEngineWorkspaceProps> = ({ project }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'structure' | 'templates' | 'dependencies' | 'validation' | 'diff' | 'patches' | 'rollback' | 'refactor' | 'conflicts'
  >('structure');
  
  const [codeProject, setCodeProject] = useState<CodeProjectRecord | null>(null);
  const [folders, setFolders] = useState<GeneratedFolderRecord[]>([]);
  const [files, setFiles] = useState<GeneratedFileRecord[]>([]);
  const [templates, setTemplates] = useState<CodeTemplateRecord[]>([]);
  const [dependencyAnalysis, setDependencyAnalysis] = useState<DependencyAnalysisRecord | undefined>(undefined);
  
  // Prompt 4.2 State
  const [patches, setPatches] = useState<CodePatchRecord[]>([]);
  const [activePatch, setActivePatch] = useState<CodePatchRecord | undefined>(undefined);
  const [diffs, setDiffs] = useState<CodeDiffRecord[]>([]);
  const [rollbackHistory, setRollbackHistory] = useState<RollbackHistoryRecord[]>([]);
  const [refactorLogs, setRefactorLogs] = useState<RefactorLogRecord[]>([]);
  const [conflicts, setConflicts] = useState<CodeConflictIssue[]>([]);

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<SupportedFramework>('Next.js');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Custom file creation modal / inline state
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'Component' | 'Page' | 'Hook' | 'API' | 'Service' | 'Utility'>('Component');
  const [showFileModal, setShowFileModal] = useState(false);

  const loadHistoryAndConflicts = async (codeProjectId: string) => {
    try {
      const histRes = await fetch(`/api/code/history?codeProjectId=${codeProjectId}`);
      const histData = await histRes.json();
      if (histData.success) {
        setPatches(histData.patches || []);
        setRollbackHistory(histData.rollbackHistory || []);
        setRefactorLogs(histData.refactorLogs || []);
      }

      const readRes = await fetch(`/api/code/read?codeProjectId=${codeProjectId}`);
      const readData = await readRes.json();
      if (readData.success && readData.overview) {
        setConflicts(readData.overview.detectedConflicts || []);
      }
    } catch (err) {
      console.error('Failed loading history/conflicts', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCodeProjectData = async () => {
      try {
        const tmplRes = await fetch('/api/code/templates');
        const tmplData = await tmplRes.json();
        if (isMounted && tmplData.templates) setTemplates(tmplData.templates);

        const genRes = await fetch('/api/code/projects/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            workspaceId: project.workspaceId,
            projectName: project.name,
            framework: selectedFramework,
            language: selectedFramework === 'FastAPI' ? 'Python' : 'TypeScript'
          })
        });

        const genData = await genRes.json();
        if (isMounted && genData.codeProject) {
          setCodeProject(genData.codeProject);
          setFolders(genData.folders || []);
          setFiles(genData.files || []);
          if (genData.files && genData.files.length > 0) {
            setSelectedFilePath(genData.files[0].path);
          }

          loadHistoryAndConflicts(genData.codeProject.id);

          const depRes = await fetch('/api/code/dependencies/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              codeProjectId: genData.codeProject.id,
              projectId: project.id,
              framework: selectedFramework
            })
          });
          const depData = await depRes.json();
          if (isMounted && depData.analysis) setDependencyAnalysis(depData.analysis);
        }
      } catch (err) {
        console.error('Failed loading Code Engine data', err);
      }
    };

    loadCodeProjectData();

    return () => {
      isMounted = false;
    };
  }, [project.id, project.workspaceId, project.name, selectedFramework]);

  const handleBootstrapFramework = async (framework: SupportedFramework) => {
    setSelectedFramework(framework);
    setIsGenerating(true);
    try {
      const res = await fetch('/api/code/projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          workspaceId: project.workspaceId,
          projectName: project.name,
          framework,
          language: framework === 'FastAPI' ? 'Python' : framework === 'Flutter' ? 'Dart' : 'TypeScript'
        })
      });
      const data = await res.json();
      if (data.codeProject) {
        setCodeProject(data.codeProject);
        setFolders(data.folders || []);
        setFiles(data.files || []);
        if (data.files && data.files.length > 0) {
          setSelectedFilePath(data.files[0].path);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName || !codeProject) return;

    try {
      const res = await fetch('/api/code/files/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeProjectId: codeProject.id,
          projectId: project.id,
          workspaceId: project.workspaceId,
          name: newFileName,
          fileType: newFileType,
          language: codeProject.language,
          folderPath: newFileType === 'Page' || newFileType === 'API' ? 'app' : 'components'
        })
      });

      const data = await res.json();
      if (data.file) {
        setFiles(prev => [...prev, data.file]);
        setSelectedFilePath(data.file.path);
        setNewFileName('');
        setShowFileModal(false);
      }
    } catch (err) {
      console.error('Failed creating file', err);
    }
  };

  const handleSelectPatchForDiff = async (patch: CodePatchRecord) => {
    setActivePatch(patch);
    setActiveSubTab('diff');
    try {
      const res = await fetch('/api/code/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchId: patch.patchId })
      });
      const data = await res.json();
      if (data.success && data.diffs) {
        setDiffs(data.diffs);
      }
    } catch (err) {
      console.error('Failed fetching diff for patch', err);
    }
  };

  const handleRollbackPatch = async (patchId: string, reason?: string) => {
    if (!codeProject) return;
    try {
      const res = await fetch('/api/code/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeProjectId: codeProject.id,
          projectId: project.id,
          workspaceId: project.workspaceId,
          rollbackType: 'patch_id',
          targetPatchId: patchId,
          reason
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadHistoryAndConflicts(codeProject.id);
        const filesRes = await fetch(`/api/code/files/read?codeProjectId=${codeProject.id}`);
        const filesData = await filesRes.json();
        if (filesData.success && filesData.structure) {
          setFiles(filesData.structure.files || []);
        }
      } else {
        alert(`Rollback failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Rollback request error', err);
    }
  };

  const handleRollbackFile = async (filePath: string) => {
    if (!codeProject) return;
    try {
      const res = await fetch('/api/code/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeProjectId: codeProject.id,
          projectId: project.id,
          workspaceId: project.workspaceId,
          rollbackType: 'file',
          filePath
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadHistoryAndConflicts(codeProject.id);
        const filesRes = await fetch(`/api/code/files/read?codeProjectId=${codeProject.id}`);
        const filesData = await filesRes.json();
        if (filesData.success && filesData.structure) {
          setFiles(filesData.structure.files || []);
        }
      } else {
        alert(`File revert failed: ${data.error}`);
      }
    } catch (err) {
      console.error('File revert error', err);
    }
  };

  const handleExecuteRefactor = async (refactorData: Record<string, unknown>) => {
    if (!codeProject) return;
    try {
      const res = await fetch('/api/code/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeProjectId: codeProject.id,
          projectId: project.id,
          workspaceId: project.workspaceId,
          ...refactorData
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadHistoryAndConflicts(codeProject.id);
        const filesRes = await fetch(`/api/code/files/read?codeProjectId=${codeProject.id}`);
        const filesData = await filesRes.json();
        if (filesData.success && filesData.structure) {
          setFiles(filesData.structure.files || []);
        }
      } else {
        alert(`Refactor failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Refactor request error', err);
    }
  };

  const selectedFile = files.find(f => f.path === selectedFilePath);
  const currentValidation = selectedFile
    ? codeValidationEngine.validateCode(selectedFile.content, selectedFile.name, codeProject?.language || 'TypeScript')
    : undefined;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-zinc-100">Enterprise Coding Engine</h2>
              <Badge variant="info">{codeProject?.framework || selectedFramework}</Badge>
              <Badge variant="default">{codeProject?.language || 'TypeScript'}</Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Code Reader, File Editor, Patch Engine, Visual Diff, Refactoring & Rollback Manager.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFileModal(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 flex items-center space-x-1.5 transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Edit / Create File</span>
          </button>
          <div className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Code Engine Ready</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 overflow-x-auto">
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('structure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'structure'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-blue-400" />
            <span>Project Explorer ({files.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('patches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'patches'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-blue-400" />
            <span>Patches ({patches.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('diff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'diff'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
            <span>Diff Viewer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('refactor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'refactor'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Refactor Engine</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rollback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'rollback'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Rollback Panel</span>
          </button>

          <button
            onClick={() => setActiveSubTab('conflicts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'conflicts'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            <span>Conflict Detector ({conflicts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('validation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'validation'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Validation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dependencies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'dependencies'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dependencies</span>
          </button>
        </div>

        {/* Framework Selector Switcher */}
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400 shrink-0 ml-2">
          <span className="text-[11px] font-mono text-zinc-500">Framework:</span>
          <select
            value={selectedFramework}
            onChange={e => handleBootstrapFramework(e.target.value as SupportedFramework)}
            disabled={isGenerating}
            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Next.js">Next.js</option>
            <option value="React">React</option>
            <option value="FastAPI">FastAPI (Python)</option>
            <option value="Express">Express (Node.js)</option>
            <option value="Flutter">Flutter (Dart)</option>
            <option value="Blank Project">Blank Project</option>
          </select>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-[420px]">
        {activeSubTab === 'structure' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Left: Folder / File Explorer Tree */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <span className="text-xs font-semibold text-zinc-300 font-mono">Project Structure</span>
                <Badge variant="default">{codeProject?.rootPath || './src'}</Badge>
              </div>
              <div className="flex-1 overflow-auto">
                <ProjectStructureTree
                  folders={folders}
                  files={files}
                  selectedFilePath={selectedFilePath}
                  onSelectFile={path => setSelectedFilePath(path)}
                />
              </div>
            </div>

            {/* Right: Code Viewer (2 Cols) */}
            <div className="md:col-span-2 h-full">
              <GeneratedFileViewer file={selectedFile} />
            </div>
          </div>
        )}

        {activeSubTab === 'patches' && (
          <PatchHistoryPanel
            patches={patches}
            onSelectPatch={patch => handleSelectPatchForDiff(patch)}
            onRollbackPatch={patchId => handleRollbackPatch(patchId)}
          />
        )}

        {activeSubTab === 'diff' && (
          <DiffViewerPanel patch={activePatch} diffs={diffs} />
        )}

        {activeSubTab === 'rollback' && (
          <RollbackPanel
            patches={patches}
            rollbackHistory={rollbackHistory}
            onRollbackPatch={(patchId, reason) => handleRollbackPatch(patchId, reason)}
            onRollbackFile={filePath => handleRollbackFile(filePath)}
          />
        )}

        {activeSubTab === 'refactor' && (
          <RefactorPanel
            refactorLogs={refactorLogs}
            onExecuteRefactor={data => handleExecuteRefactor(data)}
          />
        )}

        {activeSubTab === 'conflicts' && (
          <ConflictDetectorPanel
            conflicts={conflicts}
            onRefreshConflicts={() => codeProject && loadHistoryAndConflicts(codeProject.id)}
          />
        )}

        {activeSubTab === 'templates' && (
          <TemplateManagerPanel
            templates={templates}
            selectedTemplateId={templates.find(t => t.framework === selectedFramework)?.id}
            onSelectTemplate={tmplId => {
              const tmpl = templates.find(t => t.id === tmplId);
              if (tmpl) handleBootstrapFramework(tmpl.framework);
            }}
          />
        )}

        {activeSubTab === 'dependencies' && (
          <DependencyPanel
            analysis={dependencyAnalysis}
            packageManager={codeProject?.packageManager || 'npm'}
          />
        )}

        {activeSubTab === 'validation' && (
          <ValidationPanel
            validation={currentValidation}
            selectedFileName={selectedFile?.name || 'Project Root'}
          />
        )}
      </div>

      {/* Modal: Generate Custom File */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Generate Architecture File</h3>
            <p className="text-xs text-zinc-400 mb-4">
              AI Code Generator will create formatted code with strict typing and import resolution.
            </p>

            <form onSubmit={handleAddCustomFile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  placeholder="e.g. UserCard, useAuth, taskService"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">File Type</label>
                <select
                  value={newFileType}
                  onChange={e => setNewFileType(e.target.value as 'Component' | 'Page' | 'Hook' | 'API' | 'Service' | 'Utility')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Component">Component (.tsx)</option>
                  <option value="Page">Page (.tsx)</option>
                  <option value="Hook">Hook (.ts)</option>
                  <option value="API">API Route (.ts)</option>
                  <option value="Service">Service (.ts)</option>
                  <option value="Utility">Utility (.ts)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Generate File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
