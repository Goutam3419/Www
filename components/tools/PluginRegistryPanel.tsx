'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PluginRegistryItem, PluginType } from '@/packages/types/src';
import { Badge } from '@/components/ui/Badge';

export const PluginRegistryPanel: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginRegistryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const fetchPlugins = useCallback(async () => {
    try {
      const res = await fetch('/api/tools/plugins');
      const data = await res.json();
      if (data.success) {
        setPlugins(data.plugins);
      }
    } catch (err) {
      console.error('Failed to fetch plugins', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!active) return;
      await fetchPlugins();
    };
    run();
    return () => {
      active = false;
    };
  }, [fetchPlugins]);

  const togglePlugin = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch('/api/tools/plugins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !currentEnabled })
      });
      const data = await res.json();
      if (data.success) {
        setPlugins(prev => prev.map(p => p.id === id ? { ...p, enabled: !currentEnabled } : p));
      }
    } catch (err) {
      console.error('Failed to toggle plugin', err);
    }
  };

  const filteredPlugins = plugins.filter(p => {
    if (selectedType === 'ALL') return true;
    return p.pluginType === selectedType;
  });

  const pluginTypeBadge = (type: PluginType) => {
    switch (type) {
      case 'Core': return <Badge variant="info">Core Plugin</Badge>;
      case 'Official': return <Badge variant="success">Official</Badge>;
      case 'Community': return <Badge variant="warning">Community</Badge>;
      case 'Enterprise': return <Badge variant="info">Enterprise</Badge>;
      default: return <Badge variant="default">Private</Badge>;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-200">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
        <div>
          <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Plugin Architecture Registry
          </h3>
          <p className="text-xs text-zinc-400">Core, Official, Community, Private & Enterprise plugin tools</p>
        </div>
        <button
          onClick={fetchPlugins}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 transition"
          title="Refresh Plugins"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto text-xs border-b border-zinc-800 pb-2">
        {['ALL', 'Core', 'Official', 'Community', 'Enterprise'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1 rounded-md transition text-xs font-medium ${selectedType === t ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Plugins List Grid */}
      {loading ? (
        <div className="py-8 text-center text-xs text-zinc-500">Loading plugin registry...</div>
      ) : filteredPlugins.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500">No plugins registered in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPlugins.map(plugin => (
            <div key={plugin.id} className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-zinc-100">{plugin.name}</span>
                  {pluginTypeBadge(plugin.pluginType)}
                </div>
                <p className="text-xs text-zinc-400 mt-1">{plugin.description}</p>
                <div className="mt-2 text-[10px] text-zinc-500 flex items-center gap-3">
                  <span>Author: {plugin.author}</span>
                  <span>Version: v{plugin.version}</span>
                  <span>Tools: {plugin.toolIds.length}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className={`text-[11px] font-medium ${plugin.enabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {plugin.enabled ? 'Active Plugin' : 'Disabled'}
                </span>
                <button
                  onClick={() => togglePlugin(plugin.id, plugin.enabled)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${plugin.enabled ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'}`}
                >
                  {plugin.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
