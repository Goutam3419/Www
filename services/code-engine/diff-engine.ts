import { CodeDiffRecord, DiffHunk } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class DiffEngineService {
  public computeDiff(filePathOrOldContent: string, oldContentOrNewContent?: string, newContent?: string, patchId?: string): CodeDiffRecord {
    let filePath = 'file.txt';
    let oldContent = '';
    let newContentVal = '';

    if (newContent !== undefined) {
      filePath = filePathOrOldContent;
      oldContent = oldContentOrNewContent || '';
      newContentVal = newContent;
    } else {
      oldContent = filePathOrOldContent || '';
      newContentVal = oldContentOrNewContent || '';
    }

    const oldLines = oldContent ? oldContent.split('\n') : [];
    const newLines = newContentVal ? newContentVal.split('\n') : [];

    let addedLines = 0;
    let removedLines = 0;
    const hunks: DiffHunk[] = [];

    const maxLen = Math.max(oldLines.length, newLines.length);
    let currentHunk: DiffHunk | null = null;

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined) {
        addedLines++;
        if (!currentHunk) {
          currentHunk = { oldStart: i + 1, oldLines: 0, newStart: i + 1, newLines: 0, lines: [] };
          hunks.push(currentHunk);
        }
        currentHunk.lines.push(`+ ${newLine}`);
        currentHunk.newLines++;
      } else if (newLine === undefined) {
        removedLines++;
        if (!currentHunk) {
          currentHunk = { oldStart: i + 1, oldLines: 0, newStart: i + 1, newLines: 0, lines: [] };
          hunks.push(currentHunk);
        }
        currentHunk.lines.push(`- ${oldLine}`);
        currentHunk.oldLines++;
      } else if (oldLine !== newLine) {
        if (!currentHunk) {
          currentHunk = { oldStart: i + 1, oldLines: 0, newStart: i + 1, newLines: 0, lines: [] };
          hunks.push(currentHunk);
        }
        currentHunk.lines.push(`- ${oldLine}`);
        currentHunk.lines.push(`+ ${newLine}`);
        currentHunk.oldLines++;
        currentHunk.newLines++;
        addedLines++;
        removedLines++;
      } else {
        if (currentHunk) {
          currentHunk.lines.push(`  ${oldLine}`);
          currentHunk.oldLines++;
          currentHunk.newLines++;
        }
      }
    }

    const diffRecord: CodeDiffRecord = {
      diffId: `diff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patchId: patchId || `patch_gen_${Date.now()}`,
      filePath,
      oldContent,
      newContent,
      addedLines,
      removedLines,
      hunks,
      createdAt: new Date().toISOString()
    };

    dbStore.createCodeDiff(diffRecord);
    return diffRecord;
  }

  public getDiffForPatch(patchId: string): CodeDiffRecord[] {
    return dbStore.getDiffsForPatch(patchId);
  }

  public getDiffsForPatch(patchId: string): CodeDiffRecord[] {
    return dbStore.getDiffsForPatch(patchId);
  }
}

export const diffEngineService = new DiffEngineService();
