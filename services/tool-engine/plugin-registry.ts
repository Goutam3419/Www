import { PluginRegistryItem, PluginType } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class PluginRegistryService {
  public getAllPlugins(): PluginRegistryItem[] {
    return db.getPlugins();
  }

  public getPluginsByType(pluginType: PluginType): PluginRegistryItem[] {
    return this.getAllPlugins().filter(p => p.pluginType === pluginType);
  }

  public registerPlugin(plugin: Omit<PluginRegistryItem, 'id' | 'installedAt'>): PluginRegistryItem {
    const item = db.registerPlugin(plugin);
    db.logAuditEvent({
      workspaceId: 'ws_default_01',
      userId: 'user_ceo_01',
      action: 'Tool Installed',
      details: { pluginId: item.id, pluginName: item.name, pluginType: item.pluginType }
    });
    return item;
  }

  public togglePlugin(id: string, enabled: boolean): PluginRegistryItem | undefined {
    const updated = db.togglePlugin(id, enabled);
    if (updated) {
      db.logAuditEvent({
        workspaceId: 'ws_default_01',
        userId: 'user_ceo_01',
        action: 'Tool Updated',
        details: { pluginId: id, enabled }
      });
    }
    return updated;
  }
}

export const pluginRegistryService = new PluginRegistryService();
