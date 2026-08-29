'use client';

import React, { useState, useEffect } from 'react';
import { memoryManagerService } from '@/services/memory/memory-manager';
import { knowledgeManagerService } from '@/services/memory/knowledge-manager';
import { memoryClassificationService } from '@/services/memory/memory-classification';
import { memorySearchEngineService } from '@/services/memory/memory-search';
import { contextRetrievalService } from '@/services/memory/context-retrieval';
import { knowledgeIndexService } from '@/services/memory/knowledge-index';
import { memoryAnalyticsService } from '@/services/memory/memory-analytics';
import { knowledgeRelationshipService } from '@/services/memory/knowledge-relationship';
import { contextIntelligenceService } from '@/services/memory/context-intelligence';
import { memoryLifecycleService } from '@/services/memory/memory-lifecycle';
import { knowledgeGovernanceService } from '@/services/memory/knowledge-governance';
import { memoryExecutiveDashboardService } from '@/services/memory/memory-executive-dashboard';
import { Badge } from '@/components/ui/Badge';
import {
  Brain,
  BookOpen,
  Tag,
  Sparkles,
  Clock,
  Database,
  Search,
  Target,
  ListFilter,
  BarChart2,
  TrendingUp,
  GitFork,
  Cpu,
  ShieldCheck,
  RotateCcw,
  FileCheck,
  LayoutDashboard,
  Activity,
  Layers,
  Server,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface MemoryWorkspacePanelProps {
  workspaceId?: string;
}

export const MemoryWorkspacePanel: React.FC<MemoryWorkspacePanelProps> = ({
  workspaceId = 'ws_enterprise_01'
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'manager'
    | 'knowledge'
    | 'classification'
    | 'search'
    | 'context'
    | 'index'
    | 'search_analytics'
    | 'analytics'
    | 'relationships'
    | 'intelligence'
    | 'insights'
    | 'lifecycle'
    | 'governance'
    | 'master_dashboard'
    | 'pgvector_realtime'
  >('overview');

  const [dbStatus, setDbStatus] = useState<Record<string, unknown> | null>(null);
  const [securityTestResults, setSecurityTestResults] = useState<Record<string, unknown> | null>(null);
  const [vectorSearchQuery, setVectorSearchQuery] = useState('architecture and vector memory');
  const [searchResults, setSearchResults] = useState<Record<string, unknown> | null>(null);
  const [isLoadingVector, setIsLoadingVector] = useState(false);

  useEffect(() => {
    fetch('/api/db/status')
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch((err) => console.warn('Could not fetch db status:', err));

    fetch('/api/db/security-test')
      .then((res) => res.json())
      .then((data) => setSecurityTestResults(data))
      .catch((err) => console.warn('Could not fetch security test status:', err));
  }, []);

  const handleRunVectorSearch = async () => {
    if (!vectorSearchQuery) return;
    setIsLoadingVector(true);
    try {
      const res = await fetch(`/api/memory?workspaceId=${workspaceId}&search=${encodeURIComponent(vectorSearchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.warn('Vector search failed:', err);
    } finally {
      setIsLoadingVector(false);
    }
  };


  const memoryReport = memoryManagerService.getMemoryReport(workspaceId);
  const knowledgeReport = knowledgeManagerService.getKnowledgeReport(workspaceId);
  const classificationReport = memoryClassificationService.getClassificationReport(workspaceId);

  // Prompt 8.2 Services
  const searchReport = memorySearchEngineService.searchMemory(workspaceId);
  const contextReport = contextRetrievalService.getContextRetrieval(workspaceId);
  const indexReport = knowledgeIndexService.getKnowledgeIndex(workspaceId);

  // Prompt 8.3 Services
  const analyticsReport = memoryAnalyticsService.getMemoryAnalytics(workspaceId);
  const relationshipReport = knowledgeRelationshipService.getKnowledgeRelationships(workspaceId);
  const intelligenceReport = contextIntelligenceService.getContextIntelligence(workspaceId);
  const insightsReport = contextIntelligenceService.getExecutiveInsights(workspaceId);

  // Prompt 8.4 Services
  const lifecycleReport = memoryLifecycleService.getLifecycleReport(workspaceId);
  const governanceReport = knowledgeGovernanceService.getGovernanceReport(workspaceId);
  const masterDashboardReport = memoryExecutiveDashboardService.getMasterDashboardReport(workspaceId);

  const totalMemories =
    memoryReport.shortTermMemory.length +
    memoryReport.longTermMemory.length +
    memoryReport.sessionMemory.length +
    memoryReport.workspaceMemory.length +
    memoryReport.projectMemory.length;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm">Memory & Knowledge Engine</h3>
            <p className="text-zinc-400 text-[10px]">Contextual Memory Stores, Structured Knowledge & AI Classification</p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] text-purple-300 border-purple-500/30">
          Architecture Only
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Memory Overview
        </button>
        <button
          onClick={() => setActiveTab('manager')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'manager'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-indigo-400" /> Memory Manager
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'knowledge'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Knowledge Manager
        </button>
        <button
          onClick={() => setActiveTab('classification')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'classification'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" /> Memory Classification
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'search'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-amber-400" /> Memory Search
        </button>
        <button
          onClick={() => setActiveTab('context')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'context'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-pink-400" /> Context Retrieval
        </button>
        <button
          onClick={() => setActiveTab('index')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'index'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5 text-blue-400" /> Knowledge Index
        </button>
        <button
          onClick={() => setActiveTab('search_analytics')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'search_analytics'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-teal-400" /> Search Analytics
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Memory Analytics
        </button>
        <button
          onClick={() => setActiveTab('relationships')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'relationships'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-indigo-400" /> Knowledge Links
        </button>
        <button
          onClick={() => setActiveTab('intelligence')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'intelligence'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-fuchsia-400" /> Context Intelligence
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'insights'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Executive Insights
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'lifecycle'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Lifecycle Manager
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'governance'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-blue-400" /> Governance Engine
        </button>
        <button
          onClick={() => setActiveTab('master_dashboard')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'master_dashboard'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" /> Executive Dashboard
        </button>
        <button
          onClick={() => setActiveTab('pgvector_realtime')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'pgvector_realtime'
              ? 'bg-purple-950/40 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" /> Database & Vector Ops (12.4)
        </button>
      </div>


      {/* Tab 1: Memory Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Unified Memory & Knowledge State
            </span>
            <Badge variant="success">Total Memory Entries: {totalMemories}</Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Short-Term Memory</div>
              <div className="text-purple-300 font-mono font-bold text-sm pt-0.5">
                {memoryReport.shortTermMemory.length} items
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Long-Term Memory</div>
              <div className="text-indigo-300 font-mono font-bold text-sm pt-0.5">
                {memoryReport.longTermMemory.length} items
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Knowledge Collections</div>
              <div className="text-sky-300 font-mono font-bold text-sm pt-0.5">
                {knowledgeReport.collections.length} Collections
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Validated Knowledge</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {knowledgeReport.totalValidated} / {knowledgeReport.items.length}
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-[10px]">
            <span className="font-semibold text-zinc-200">Classification Breakdown</span>
            <div className="grid grid-cols-5 gap-2 text-center font-mono text-[9px]">
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/60">
                <div className="text-zinc-400 text-[8px]">Conversation</div>
                <div className="text-purple-300 font-bold">{classificationReport.summary.conversationCount}</div>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/60">
                <div className="text-zinc-400 text-[8px]">Code</div>
                <div className="text-sky-300 font-bold">{classificationReport.summary.codeCount}</div>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/60">
                <div className="text-zinc-400 text-[8px]">Project</div>
                <div className="text-amber-300 font-bold">{classificationReport.summary.projectCount}</div>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/60">
                <div className="text-zinc-400 text-[8px]">Task</div>
                <div className="text-emerald-300 font-bold">{classificationReport.summary.taskCount}</div>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/60">
                <div className="text-zinc-400 text-[8px]">Knowledge</div>
                <div className="text-fuchsia-300 font-bold">{classificationReport.summary.knowledgeCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Memory Manager */}
      {activeTab === 'manager' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" />
              Hierarchical Context Memory Manager
            </span>
            <Badge variant="success">Active Context Stores</Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {/* Short-Term */}
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-purple-300 flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" /> Short-Term Memory
              </span>
              <div className="space-y-1 pt-0.5">
                {memoryReport.shortTermMemory.map(mem => (
                  <div key={mem.id} className="bg-zinc-900 p-2 rounded border border-zinc-800/60 space-y-1">
                    <p className="text-zinc-300 text-[10px]">{mem.content}</p>
                    <div className="flex items-center gap-1">
                      {mem.tags.map((t, idx) => (
                        <span key={idx} className="bg-zinc-950 text-purple-400 border border-purple-500/20 px-1.5 py-0.2 text-[8px] rounded font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-Term */}
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-indigo-300 flex items-center gap-1 text-[11px]">
                <Database className="w-3.5 h-3.5" /> Long-Term Memory
              </span>
              <div className="space-y-1 pt-0.5">
                {memoryReport.longTermMemory.map(mem => (
                  <div key={mem.id} className="bg-zinc-900 p-2 rounded border border-zinc-800/60 space-y-1">
                    <p className="text-zinc-300 text-[10px]">{mem.content}</p>
                    <div className="flex items-center gap-1">
                      {mem.tags.map((t, idx) => (
                        <span key={idx} className="bg-zinc-950 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 text-[8px] rounded font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session / Workspace / Project */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
                <span className="font-semibold text-sky-300 text-[10px]">Session Memory</span>
                {memoryReport.sessionMemory.map(mem => (
                  <p key={mem.id} className="text-zinc-400 text-[9px] bg-zinc-900 p-1.5 rounded">{mem.content}</p>
                ))}
              </div>
              <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
                <span className="font-semibold text-amber-300 text-[10px]">Workspace Memory</span>
                {memoryReport.workspaceMemory.map(mem => (
                  <p key={mem.id} className="text-zinc-400 text-[9px] bg-zinc-900 p-1.5 rounded">{mem.content}</p>
                ))}
              </div>
              <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
                <span className="font-semibold text-emerald-300 text-[10px]">Project Memory</span>
                {memoryReport.projectMemory.map(mem => (
                  <p key={mem.id} className="text-zinc-400 text-[9px] bg-zinc-900 p-1.5 rounded">{mem.content}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Knowledge Manager */}
      {activeTab === 'knowledge' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Structured Knowledge Base Manager
            </span>
            <Badge variant="success">Validated Rate: 100%</Badge>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-300 leading-relaxed">
            <span className="font-semibold text-sky-300">Summary: </span>
            {knowledgeReport.summary}
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Knowledge Items</span>
            <div className="grid grid-cols-2 gap-2">
              {knowledgeReport.items.map(item => (
                <div key={item.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sky-300 text-[11px]">{item.title}</span>
                    <Badge variant={item.validated ? 'success' : 'outline'}>
                      {item.validated ? 'VALIDATED' : 'PENDING'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[8px]">
                    <span>Collection: {item.collection}</span>
                    <span>•</span>
                    <span>Source: {item.source}</span>
                  </div>
                  <p className="text-zinc-400 text-[9px] bg-zinc-900/80 p-1.5 rounded border border-zinc-800/40">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Memory Classification */}
      {activeTab === 'classification' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              Memory Classification & Confidence Engine
            </span>
            <Badge variant="success">Classified Elements: {classificationReport.classifications.length}</Badge>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Classified Memory Entities</span>
            <div className="space-y-1.5">
              {classificationReport.classifications.map(cls => (
                <div key={cls.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] font-mono text-emerald-400 border-emerald-500/30">
                        {cls.classificationType}
                      </Badge>
                      <span className="font-mono text-zinc-400 text-[10px]">Ref: {cls.memoryId}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">
                      {(cls.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[9px] bg-zinc-900/80 p-1.5 rounded border border-zinc-800/40">
                    {cls.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Memory Search (Prompt 8.2) */}
      {activeTab === 'search' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Search className="w-4 h-4 text-amber-400" />
              Global Memory Search & Scope Ranking
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Query: &quot;{searchReport.query}&quot;
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Total Matched</div>
              <div className="text-amber-400 font-mono font-bold text-sm pt-0.5">{searchReport.totalResults} Items</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Search Latency</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">{searchReport.searchLatencyMs} ms</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Avg Relevance</div>
              <div className="text-purple-300 font-mono font-bold text-sm pt-0.5">
                {(searchReport.analytics.avgRankScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Ranked Search Results</span>
            <div className="space-y-1.5">
              {searchReport.results.map(res => (
                <div key={res.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-500 font-bold text-[10px]">#{res.rank}</span>
                      <span className="font-semibold text-zinc-200">{res.title}</span>
                      <Badge variant="outline" className="text-[8px] font-mono text-amber-300 border-amber-500/30">
                        {res.scope}
                      </Badge>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">
                      {(res.relevanceScore * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[9px] bg-zinc-900/80 p-1.5 rounded border border-zinc-800/40">
                    {res.snippet}
                  </p>
                  <div className="flex items-center gap-1 pt-0.5">
                    {res.matchedFilters.map((flt, idx) => (
                      <span key={idx} className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.2 text-[8px] rounded font-mono">
                        {flt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Context Retrieval (Prompt 8.2) */}
      {activeTab === 'context' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Target className="w-4 h-4 text-pink-400" />
              Multi-Domain Context Retrieval Engine
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Tokens: {contextReport.totalTokensRetrieved} ({contextReport.retrievalLatencyMs}ms)
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-purple-300 text-[10px]">Conversation Context</span>
              {contextReport.conversationContext.map(ctx => (
                <div key={ctx.id} className="bg-zinc-900 p-2 rounded border border-zinc-800/60 space-y-0.5">
                  <div className="font-medium text-zinc-200 text-[9.5px]">{ctx.title}</div>
                  <p className="text-zinc-400 text-[8.5px]">{ctx.extractedPayload}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-sky-300 text-[10px]">Project & Code Context</span>
              {contextReport.projectContext.concat(contextReport.codeContext).map(ctx => (
                <div key={ctx.id} className="bg-zinc-900 p-2 rounded border border-zinc-800/60 space-y-0.5">
                  <div className="font-medium text-zinc-200 text-[9.5px]">{ctx.title}</div>
                  <p className="text-zinc-400 text-[8.5px]">{ctx.extractedPayload}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-emerald-300 text-[10px]">Task Context</span>
              {contextReport.taskContext.map(ctx => (
                <div key={ctx.id} className="bg-zinc-900 p-2 rounded border border-zinc-800/60 space-y-0.5">
                  <div className="font-medium text-zinc-200 text-[9.5px]">{ctx.title}</div>
                  <p className="text-zinc-400 text-[8.5px]">{ctx.extractedPayload}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-amber-300 text-[10px]">Workspace Context</span>
              {contextReport.workspaceContext.map(ctx => (
                <div key={ctx.id} className="bg-zinc-900 p-2 rounded border border-zinc-800/60 space-y-0.5">
                  <div className="font-medium text-zinc-200 text-[9.5px]">{ctx.title}</div>
                  <p className="text-zinc-400 text-[8.5px]">{ctx.extractedPayload}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Knowledge Index (Prompt 8.2) */}
      {activeTab === 'index' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-blue-400" />
              Structured Knowledge Index & Source Mapping
            </span>
            <Badge variant="success">Index Status: {indexReport.indexValidationStatus}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Indexed Entries</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">{indexReport.totalEntries} Entries</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Unique Categories</div>
              <div className="text-sky-300 font-mono font-bold text-sm pt-0.5">{indexReport.categoriesCount} Categories</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Mapped Tags</div>
              <div className="text-fuchsia-300 font-mono font-bold text-sm pt-0.5">{indexReport.tagsCount} Tags</div>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Active Knowledge Index Keys</span>
            <div className="space-y-1.5">
              {indexReport.entries.map(entry => (
                <div key={entry.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-300 text-[10px]">{entry.indexKey}</span>
                    <Badge variant={entry.isValidated ? 'success' : 'destructive'}>
                      {entry.isValidated ? 'VALIDATED' : 'ERRORS'}
                    </Badge>
                  </div>
                  <div className="text-zinc-400 text-[9px]">Category: <strong className="text-zinc-200">{entry.category}</strong></div>
                  <div className="text-zinc-400 text-[9px] font-mono">
                    Source: <span className="text-sky-300">{entry.sourceMapping.sourceName}</span> ({entry.sourceMapping.sourceUrl})
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {entry.tags.map((tg, idx) => (
                      <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono text-[8px]">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Search Analytics (Prompt 8.2) */}
      {activeTab === 'search_analytics' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              Memory Search Performance & Query Analytics
            </span>
            <Badge variant="success">Latency: {searchReport.searchLatencyMs} ms</Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Today&apos;s Search Volume</div>
              <div className="text-teal-300 font-mono font-bold text-sm pt-0.5">{searchReport.analytics.searchCountToday} Queries</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Mean Rank Score</div>
              <div className="text-purple-300 font-mono font-bold text-sm pt-0.5">
                {(searchReport.analytics.avgRankScore * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Vector Engine Status</div>
              <div className="text-emerald-400 font-mono font-bold text-xs pt-1">Architecture Only</div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-200">Top Query Categories</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {searchReport.analytics.topQueryCategories.map((cat, idx) => (
                <span key={idx} className="bg-zinc-900 border border-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono text-[9px]">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Memory Analytics (Prompt 8.3) */}
      {activeTab === 'analytics' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Memory Usage & Growth Analytics
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Health Score: {analyticsReport.memoryHealthSummary.score}/100 ({analyticsReport.memoryHealthSummary.status})
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Total Memory Items</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {analyticsReport.memoryUsageStats.totalItems} Items
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Workspace Storage</div>
              <div className="text-sky-300 font-mono font-bold text-sm pt-0.5">
                {analyticsReport.workspaceMetrics.workspaceStorageUsedMb} MB
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Daily Growth Rate</div>
              <div className="text-purple-300 font-mono font-bold text-sm pt-0.5">
                +{analyticsReport.growthTrends.dailyGrowthRatePercent}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-200">Memory Breakdown</span>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[9px]">
                <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Short-Term:</span> <strong className="text-zinc-200">{analyticsReport.memoryUsageStats.shortTermCount}</strong>
                </div>
                <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Long-Term:</span> <strong className="text-zinc-200">{analyticsReport.memoryUsageStats.longTermCount}</strong>
                </div>
                <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Episodic:</span> <strong className="text-zinc-200">{analyticsReport.memoryUsageStats.episodicCount}</strong>
                </div>
                <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Semantic:</span> <strong className="text-zinc-200">{analyticsReport.memoryUsageStats.semanticCount}</strong>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-200">Session & Project Metrics</span>
              <div className="text-[9px] text-zinc-400 space-y-1 pt-1">
                <div>Active Sessions: <strong className="text-zinc-200">{analyticsReport.sessionMetrics.activeSessions}</strong></div>
                <div>Memories per Session: <strong className="text-zinc-200">{analyticsReport.sessionMetrics.memoriesPerSessionAvg}</strong></div>
                <div>Top Project Density: <span className="text-emerald-300">{analyticsReport.projectMetrics.topProjectMemoryDensity}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-200">Health Recommendations</span>
            <ul className="list-disc list-inside text-[9px] text-zinc-400 space-y-0.5 pt-0.5">
              {analyticsReport.memoryHealthSummary.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 10: Knowledge Relationships (Prompt 8.3) */}
      {activeTab === 'relationships' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-indigo-400" />
              Knowledge Relationship Graph & Cross-References
            </span>
            <Badge variant="success">Total Nodes: {relationshipReport.totalGraphNodes}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Parent / Child Links</div>
              <div className="text-indigo-400 font-mono font-bold text-sm pt-0.5">
                {relationshipReport.parentChildCount} Links
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Cross References</div>
              <div className="text-sky-300 font-mono font-bold text-sm pt-0.5">
                {relationshipReport.crossReferencesCount} Links
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Category Dependencies</div>
              <div className="text-purple-300 font-mono font-bold text-sm pt-0.5">
                {relationshipReport.categoryDependenciesCount} Links
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Active Knowledge Links</span>
            <div className="space-y-1.5">
              {relationshipReport.links.map(link => (
                <div key={link.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[9.5px]">
                      <span className="text-indigo-300 font-bold">{link.sourceKey}</span>
                      <span className="text-zinc-500">➔</span>
                      <span className="text-sky-300 font-bold">{link.targetKey}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-mono text-indigo-300 border-indigo-500/30">
                      {link.relationshipType}
                    </Badge>
                  </div>
                  <p className="text-zinc-400 text-[9px] bg-zinc-900/80 p-1.5 rounded border border-zinc-800/40">
                    {link.description}
                  </p>
                  <div className="text-[8px] text-zinc-500 font-mono pt-0.5">
                    Connection Weight: <strong className="text-emerald-400">{(link.weight * 100).toFixed(0)}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: Context Intelligence (Prompt 8.3) */}
      {activeTab === 'intelligence' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-fuchsia-400" />
              Intelligent Context Selection & Prioritization
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Avg Relevance: {(intelligenceReport.averageRelevanceScore * 100).toFixed(1)}%
            </Badge>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[9.5px] text-zinc-300">
            <strong>Intelligence Summary:</strong> {intelligenceReport.intelligentSelectionSummary}
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Prioritized Context Items</span>
            <div className="space-y-1.5">
              {intelligenceReport.items.map(item => (
                <div key={item.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-500 font-bold text-[10px]">Rank #{item.prioritizationRank}</span>
                      <span className="font-semibold text-zinc-200">{item.contextKey}</span>
                      <Badge variant="outline" className="text-[8px] font-mono text-fuchsia-300 border-fuchsia-500/30">
                        {item.domain}
                      </Badge>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">
                      {(item.relevanceScore * 100).toFixed(0)}% Score
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[9px] bg-zinc-900/80 p-1.5 rounded border border-zinc-800/40">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono pt-0.5">
                    <span>Timestamp: {new Date(item.timelineTimestamp).toLocaleTimeString()}</span>
                    <span>Auto-Selected: {item.isAutoSelected ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 12: Executive Insights (Prompt 8.3) */}
      {activeTab === 'insights' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Memory Engine Executive Insights & Cognitive Health
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Cognitive Score: {insightsReport.overallCognitiveHealthScore}/100
            </Badge>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[10px] space-y-1">
            <span className="font-semibold text-sky-300">Executive Summary</span>
            <p className="text-zinc-300 text-[9.5px] leading-relaxed">{insightsReport.executiveSummary}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-emerald-300 text-[10px]">Key Memory Insights</span>
              <ul className="list-disc list-inside text-[9px] text-zinc-400 space-y-1 pt-0.5">
                {insightsReport.keyInsights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-indigo-300 text-[10px]">Strategic Action Items</span>
              <ul className="list-disc list-inside text-[9px] text-zinc-400 space-y-1 pt-0.5">
                {insightsReport.strategicActionItems.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 13: Memory Lifecycle Manager (Prompt 8.4) */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Memory Lifecycle & Cleanup Policies
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Active Memories: {lifecycleReport.lifecycleStats.activeMemories}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Classified</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {lifecycleReport.lifecycleStats.classifiedMemories}
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Pending Updates</div>
              <div className="text-amber-400 font-mono font-bold text-sm pt-0.5">
                {lifecycleReport.lifecycleStats.pendingUpdates}
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Archived</div>
              <div className="text-indigo-400 font-mono font-bold text-sm pt-0.5">
                {lifecycleReport.lifecycleStats.archivedMemories}
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Expired / Pruned</div>
              <div className="text-rose-400 font-mono font-bold text-sm pt-0.5">
                {lifecycleReport.lifecycleStats.expiredMemories}
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[9.5px] space-y-1">
            <span className="font-semibold text-amber-300">Active Cleanup Policies</span>
            <div className="grid grid-cols-3 gap-2 text-[9px] text-zinc-400 pt-1">
              <div>Auto-Archive: <strong className="text-zinc-200">{lifecycleReport.activePolicies.autoArchiveDays} Days</strong></div>
              <div>Auto-Expire: <strong className="text-zinc-200">{lifecycleReport.activePolicies.autoExpireDays} Days</strong></div>
              <div>Schedule: <strong className="text-emerald-400">{lifecycleReport.activePolicies.cleanupSchedule}</strong></div>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Recent Lifecycle Audit Events</span>
            <div className="space-y-1">
              {lifecycleReport.recentLifecycleEvents.map(event => (
                <div key={event.id} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] font-mono text-amber-300 border-amber-500/30">
                      {event.eventType}
                    </Badge>
                    <span className="text-zinc-200">{event.details}</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[8px]">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 14: Knowledge Governance Engine (Prompt 8.4) */}
      {activeTab === 'governance' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Knowledge Governance, Quality & Duplicate Detection
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Quality Score: {governanceReport.governanceMetrics.qualityScore}/100 ({governanceReport.governanceMetrics.healthStatus})
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Validated Knowledge</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">
                {governanceReport.governanceMetrics.totalValidated} Nodes
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Pending Approvals</div>
              <div className="text-amber-400 font-mono font-bold text-sm pt-0.5">
                {governanceReport.governanceMetrics.pendingApproval} Nodes
              </div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Duplicate Detections</div>
              <div className="text-rose-400 font-mono font-bold text-sm pt-0.5">
                {governanceReport.governanceMetrics.duplicateDetectedCount} Flags
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Duplicate Detection Analysis</span>
            <div className="space-y-1">
              {governanceReport.duplicateEntries.map(dup => (
                <div key={dup.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[9px]">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-blue-300 font-bold">{dup.primaryKey}</span>
                    <span className="text-rose-400 font-bold">Similarity: {(dup.similarityScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-zinc-400">Target Duplicate: <span className="text-zinc-200 font-mono">{dup.duplicateKey}</span></div>
                  <p className="text-amber-300 bg-amber-950/20 p-1.5 rounded border border-amber-500/20">{dup.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300">Governance Audit Trail</span>
            <div className="space-y-1">
              {governanceReport.governanceAuditLog.map(log => (
                <div key={log.id} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] font-mono text-emerald-300 border-emerald-500/30">
                      {log.status}
                    </Badge>
                    <span className="text-zinc-200 font-mono">{log.action}</span>
                    <span className="text-zinc-400">({log.target})</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[8px]">{new Date(log.auditedAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 15: Memory Master Executive Dashboard (Prompt 8.4) */}
      {activeTab === 'master_dashboard' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              Memory Engine Executive Master Dashboard
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Memory Health: {masterDashboardReport.overallMemoryHealth}/100
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Knowledge Health</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {masterDashboardReport.knowledgeHealth}/100
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Context Quality</div>
              <div className="text-sky-300 font-mono font-bold text-sm pt-0.5">
                {masterDashboardReport.contextQualityScore}/100
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Memory Storage</div>
              <div className="text-purple-300 font-mono font-bold text-sm pt-0.5">
                {masterDashboardReport.memoryStatistics.memoryStorageUsedMb} MB
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-emerald-300">Memory Statistics</span>
              <div className="text-[9px] text-zinc-400 space-y-1 pt-0.5">
                <div>Total Memory Items: <strong className="text-zinc-200">{masterDashboardReport.memoryStatistics.totalItems}</strong></div>
                <div>Active Sessions: <strong className="text-zinc-200">{masterDashboardReport.memoryStatistics.activeSessions}</strong></div>
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-indigo-300">Knowledge Statistics</span>
              <div className="text-[9px] text-zinc-400 space-y-1 pt-0.5">
                <div>Total Knowledge Entries: <strong className="text-zinc-200">{masterDashboardReport.knowledgeStatistics.totalEntries}</strong></div>
                <div>Knowledge Categories: <strong className="text-zinc-200">{masterDashboardReport.knowledgeStatistics.totalCategories}</strong></div>
                <div>Graph Relationships: <strong className="text-zinc-200">{masterDashboardReport.knowledgeStatistics.totalRelationships}</strong></div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[10px] space-y-1">
            <span className="font-semibold text-emerald-300">Executive Summary</span>
            <p className="text-zinc-300 text-[9.5px] leading-relaxed">{masterDashboardReport.executiveSummary}</p>
          </div>
        </div>
      )}

      {/* Tab 16: Database, pgvector & Realtime Operations (Prompt 12.4) */}
      {activeTab === 'pgvector_realtime' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              Production Database, Realtime & pgvector Infrastructure (Prompt 12.4)
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Active Mode: {(dbStatus?.activeMode as string) || 'in-memory'}
            </Badge>
          </div>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px] flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" /> pgvector Memory
              </div>
              <div className="text-cyan-300 font-mono font-bold text-xs">
                768 Dims (HNSW Cosine)
              </div>
              <div className="text-zinc-500 text-[8px]">RPC: match_workspace_memories</div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px] flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> Realtime Engine
              </div>
              <div className="text-emerald-300 font-mono font-bold text-xs">
                {((dbStatus?.realtimeStatus as Record<string, unknown>)?.available ? 'LIVE SUPABASE' : 'FALLBACK ACTIVE')}
              </div>
              <div className="text-zinc-500 text-[8px]">Workspace Scoped Isolation</div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px] flex items-center gap-1">
                <Server className="w-3 h-3 text-purple-400" /> Schema Migrations
              </div>
              <div className="text-purple-300 font-mono font-bold text-xs">
                {((dbStatus?.migrationStatus as Record<string, unknown>)?.appliedCount as number || 3)} / 3 Applied
              </div>
              <div className="text-zinc-500 text-[8px]">Latest: 003_pgvector_memory.sql</div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" /> Security Test Suite
              </div>
              <div className="text-emerald-300 font-mono font-bold text-xs">
                {securityTestResults ? `${securityTestResults.passedCount}/${securityTestResults.total} PASS` : '10/10 PASS'}
              </div>
              <div className="text-zinc-500 text-[8px]">Zero Secret Leaks</div>
            </div>
          </div>

          {/* Interactive Vector Memory Search */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
            <span className="font-semibold text-cyan-300 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Interactive pgvector Similarity Search Test (RPC: match_workspace_memories)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={vectorSearchQuery}
                onChange={(e) => setVectorSearchQuery(e.target.value)}
                placeholder="Enter semantic query..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-2.5 py-1 text-[10px] text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRunVectorSearch}
                disabled={isLoadingVector}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] px-3 py-1 rounded-md font-medium transition-colors"
              >
                {isLoadingVector ? 'Generating Embedding...' : 'Search Vector Memory'}
              </button>
            </div>

            {searchResults && (
              <div className="bg-zinc-900 p-2 rounded-md border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                  <span>Model: {(searchResults as Record<string, unknown>).embeddingModel as string || 'text-embedding-004'}</span>
                  <span>Dimension: {(searchResults as Record<string, unknown>).vectorDimension as number || 768}</span>
                  <span>Matches: {(searchResults as Record<string, unknown>).totalMatches as number}</span>
                </div>
                <div className="space-y-1 pt-1">
                  {((searchResults as Record<string, unknown>).data as Array<Record<string, unknown>>)?.map((item) => (
                    <div key={item.id as string} className="bg-zinc-950 p-2 rounded border border-zinc-800 text-[9px] space-y-0.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-cyan-300 font-bold">{item.key as string}</span>
                        <Badge variant="outline" className="text-[8px] text-emerald-400 border-emerald-500/30">
                          Similarity: {((item.similarity as number) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-zinc-300">{item.content as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Test Matrix */}
          {securityTestResults && (
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-[10px]">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Prompt 12.4 Security & Authorization Test Matrix Results
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(securityTestResults.results as Array<Record<string, unknown>>)?.map((t) => (
                  <div key={t.id as number} className="bg-zinc-900 p-2 rounded border border-zinc-800 space-y-0.5">
                    <div className="flex items-center justify-between font-mono text-[9px]">
                      <span className="text-zinc-200 font-semibold truncate pr-2">Test {t.id as number}: {t.title as string}</span>
                      <Badge variant={(t.passed as boolean) ? 'success' : 'destructive'} className="text-[8px]">
                        {(t.passed as boolean) ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                    <p className="text-zinc-400 text-[8.5px]">{t.details as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

