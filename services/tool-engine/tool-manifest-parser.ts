import { ToolDefinition } from '@/packages/types/src';

export class ToolManifestParserService {
  public parseManifest(jsonString: string): ToolDefinition {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.id || !parsed.name || !parsed.category) {
        throw new Error('Manifest missing required fields: id, name, or category.');
      }
      return {
        id: parsed.id,
        name: parsed.name,
        description: parsed.description || '',
        category: parsed.category,
        dangerLevel: parsed.dangerLevel || 'Safe',
        requiredPermissions: parsed.requiredPermissions || [],
        approvalRequired: Boolean(parsed.approvalRequired),
        inputsSchema: parsed.inputsSchema || {},
        outputsSchema: parsed.outputsSchema || {},
        version: parsed.version || '1.0.0'
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid tool manifest JSON: ${msg}`);
    }
  }
}

export const toolManifestParserService = new ToolManifestParserService();
