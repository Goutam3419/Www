import { CodePatchRecord } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class PatchEngineService {
  public createPatch(params: {
    codeProjectId: string;
    description: string;
    filesModified: string[];
    affectedComponents: string[];
    appliedBy: string;
    checksum?: string;
  }): CodePatchRecord {
    const patch: CodePatchRecord = {
      patchId: `patch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      codeProjectId: params.codeProjectId,
      description: params.description,
      filesModified: params.filesModified,
      affectedComponents: params.affectedComponents,
      appliedAt: new Date().toISOString(),
      appliedBy: params.appliedBy || 'AI Engine',
      status: 'applied',
      checksum: params.checksum || `sha_${Date.now()}`
    };

    dbStore.createCodePatch(patch);
    return patch;
  }

  public getPatch(patchId: string): CodePatchRecord | null {
    return dbStore.getCodePatch(patchId) || null;
  }

  public getPatchDetails(patchId: string): { patch: CodePatchRecord | null } {
    const patch = this.getPatch(patchId);
    return { patch };
  }

  public getPatchesForProject(codeProjectId: string): CodePatchRecord[] {
    return dbStore.getPatchesForCodeProject(codeProjectId);
  }
}

export const patchEngineService = new PatchEngineService();
