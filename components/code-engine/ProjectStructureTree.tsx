'use client';

import React from 'react';
import { GeneratedFolderRecord, GeneratedFileRecord } from '@/packages/types/src';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';

interface ProjectStructureTreeProps {
  folders: GeneratedFolderRecord[];
  files: GeneratedFileRecord[];
  selectedFilePath: string | null;
  onSelectFile: (path: string) => void;
}

export const ProjectStructureTree: React.FC<ProjectStructureTreeProps> = ({
  folders,
  files,
  selectedFilePath,
  onSelectFile
}) => {
  const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({});

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-zinc-500">
        No project structure generated yet. Use the Generator control to bootstrap code structure.
      </div>
    );
  }

  return (
    <div className="text-xs font-mono space-y-1 select-none">
      {/* Root folders */}
      {folders.map(folder => {
        const isOpen = openFolders[folder.path] !== false; // default open
        const folderFiles = files.filter(f => f.path.startsWith(`${folder.path}/`));

        return (
          <div key={folder.id} className="ml-1">
            <div
              onClick={() => toggleFolder(folder.path)}
              className="flex items-center space-x-1.5 py-1 px-2 rounded hover:bg-zinc-900 cursor-pointer text-zinc-300 font-medium"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
              <Folder className="w-3.5 h-3.5 text-amber-500/80" />
              <span>{folder.path}</span>
            </div>

            {isOpen && (
              <div className="ml-5 border-l border-zinc-800/80 pl-2 space-y-0.5 mt-0.5">
                {folderFiles.map(file => {
                  const isSelected = selectedFilePath === file.path;
                  return (
                    <div
                      key={file.id}
                      onClick={() => onSelectFile(file.path)}
                      className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-400/80" />
                      <span>{file.name}</span>
                      <span className="text-[10px] text-zinc-600 font-sans ml-auto">{file.fileType}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Root files outside folders */}
      {files
        .filter(f => !f.path.includes('/'))
        .map(file => {
          const isSelected = selectedFilePath === file.path;
          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.path)}
              className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-blue-400/80" />
              <span>{file.name}</span>
              <span className="text-[10px] text-zinc-600 font-sans ml-auto">{file.fileType}</span>
            </div>
          );
        })}
    </div>
  );
};
