'use client';

import React, { useState } from 'react';
import { documentWorkspaceService } from '@/services/rag/document-workspace';
import { documentIntelligenceService } from '@/services/rag/document-intelligence-workspace';
import { retrievalWorkspaceService } from '@/services/rag/retrieval-workspace';
import { ragExecutiveDashboardService } from '@/services/rag/rag-executive-dashboard';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  FolderTree,
  ListChecks,
  Search,
  BookOpen,
  Filter,
  Tag,
  Clock,
  Layers,
  FileCheck,
  Cpu,
  Scissors,
  Database,
  CheckCircle2,
  Activity,
  Code,
  Sparkles,
  Award,
  Link,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Compass
} from 'lucide-react';

interface DocumentWorkspacePanelProps {
  workspaceId?: string;
}

export const DocumentWorkspacePanel: React.FC<DocumentWorkspacePanelProps> = ({
  workspaceId = 'ws_enterprise_01'
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'manager'
    | 'library'
    | 'queue'
    | 'parser'
    | 'chunk'
    | 'index'
    | 'retrieval'
    | 'ranking'
    | 'citation'
    | 'analytics'
    | 'governance'
    | 'quality'
    | 'executive'
    | 'rag-overview'
  >('executive');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const docReport = documentWorkspaceService.getDocumentWorkspaceReport(workspaceId);
  const intelReport = documentIntelligenceService.getDocumentIntelligenceReport(workspaceId);
  const retReport = retrievalWorkspaceService.getRetrievalWorkspaceReport(workspaceId);
  const execReport = ragExecutiveDashboardService.getExecutiveMasterReport(workspaceId);

  const filteredDocuments = docReport.documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-950/50 border border-blue-500/30 rounded-lg text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-zinc-100">
              RAG & Document Intelligence Master Engine
            </h2>
            <p className="text-[11px] text-zinc-400">
              Prompt 9.4 — Complete Enterprise RAG & Document Intelligence System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] text-blue-300 border-blue-500/30">
            {docReport.totalDocuments} Docs
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] text-purple-300 border-purple-500/30">
            {intelReport.chunkReport.totalChunksCount} Chunks
          </Badge>
          <Badge variant="success" className="font-mono text-[10px]">
            Overall Health: {execReport.overallDocumentHealth.toFixed(0)}%
          </Badge>
        </div>
      </div>

      {/* Unified Navigation Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('executive')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'executive'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-blue-400" /> Executive Dashboard
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'governance'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Governance Engine
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'quality'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Knowledge Quality
        </button>
        <button
          onClick={() => setActiveTab('rag-overview')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'rag-overview'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-purple-400" /> RAG Overview
        </button>
        <button
          onClick={() => setActiveTab('retrieval')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'retrieval'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Retrieval Engine
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'ranking'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-cyan-400" /> Context Ranking
        </button>
        <button
          onClick={() => setActiveTab('citation')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'citation'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Link className="w-3.5 h-3.5 text-indigo-400" /> Citation Intel
        </button>
        <button
          onClick={() => setActiveTab('manager')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'manager'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-zinc-400" /> Doc Manager
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-zinc-400" /> Library
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'queue'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5 text-zinc-400" /> Queue
        </button>
        <button
          onClick={() => setActiveTab('parser')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'parser'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" /> Parser Manager
        </button>
        <button
          onClick={() => setActiveTab('chunk')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'chunk'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Scissors className="w-3.5 h-3.5 text-purple-400" /> Chunk Manager
        </button>
        <button
          onClick={() => setActiveTab('index')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'index'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-rose-400" /> Index Planner
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-blue-950/50 text-blue-300 font-medium border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Analytics
        </button>
      </div>

      {/* Panel 1: RAG Executive Dashboard (Prompt 9.4) */}
      {activeTab === 'executive' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-400" />
              RAG Executive Master Dashboard
            </span>
            <Badge variant="success" className="font-mono text-[9px]">
              System Health: {execReport.overallDocumentHealth.toFixed(1)}%
            </Badge>
          </div>

          <div className="grid grid-cols-5 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Doc Health</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">
                {execReport.overallDocumentHealth}%
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Retrieval Health</div>
              <div className="text-teal-400 font-mono font-bold text-sm pt-0.5">
                {execReport.retrievalHealth}%
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Citation Health</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {execReport.citationHealth}%
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Knowledge Health</div>
              <div className="text-cyan-400 font-mono font-bold text-sm pt-0.5">
                {execReport.knowledgeHealth}%
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Governance Score</div>
              <div className="text-purple-400 font-mono font-bold text-sm pt-0.5">
                {execReport.governanceScore}%
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[10px] space-y-1">
            <span className="font-semibold text-blue-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Executive Overview
            </span>
            <p className="text-zinc-300 text-[9.5px] leading-relaxed">
              {execReport.executiveSummary}
            </p>
          </div>
        </div>
      )}

      {/* Panel 2: Document Governance Engine (Prompt 9.4) */}
      {activeTab === 'governance' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Document Governance Engine
            </span>
            <Badge variant="success" className="font-mono text-[9px]">
              Retention Compliance: {execReport.governanceReport.retentionComplianceScore}%
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Validated Docs</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {execReport.governanceReport.validatedDocsCount} Passed
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Duplicates Detected</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">
                {execReport.governanceReport.duplicatesDetected} Duplicates
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Active Versions</div>
              <div className="text-purple-400 font-mono font-bold text-sm pt-0.5">
                {execReport.governanceReport.activeVersionsCount} Active
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Doc Health Score</div>
              <div className="text-cyan-400 font-mono font-bold text-sm pt-0.5">
                {execReport.governanceReport.documentHealthScore.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="space-y-2 text-[10px]">
            {execReport.governanceReport.items.map(item => (
              <div key={item.docId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[10.5px]">{item.docTitle}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[8px] font-mono text-emerald-300 border-emerald-500/30">
                      Version {item.version}
                    </Badge>
                    <Badge variant="success" className="text-[8px] font-mono">
                      Health: {item.healthScore}%
                    </Badge>
                  </div>
                </div>
                <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40 text-[9px] text-zinc-400 font-mono flex items-center justify-between">
                  <span>Retention Policy: <strong className="text-zinc-200">{item.retentionPolicy}</strong></span>
                  <span>Duplicate Status: <strong className="text-emerald-400">{item.duplicateStatus}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel 3: Knowledge Quality Engine (Prompt 9.4) */}
      {activeTab === 'quality' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Knowledge Quality Engine & Metrics
            </span>
            <Badge variant="outline" className="text-teal-300 border-teal-500/30 font-mono text-[9px]">
              Overall Quality: {execReport.knowledgeQualityReport.overallQualityScore}%
            </Badge>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[9.5px] text-teal-300">
            {execReport.knowledgeQualityReport.executiveQualitySummary}
          </div>

          <div className="space-y-2 text-[10px]">
            {execReport.knowledgeQualityReport.metrics.map((m, idx) => (
              <div key={idx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[10.5px]">{m.metricName}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[8px] font-mono text-teal-300 border-teal-500/30">
                      Trend: {m.trend}
                    </Badge>
                    <Badge variant="success" className="text-[8px] font-mono">
                      Score: {m.score}%
                    </Badge>
                  </div>
                </div>
                <p className="text-zinc-400 text-[9px] bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40">
                  {m.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel 4: RAG Overview (Prompt 9.4) */}
      {activeTab === 'rag-overview' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-400" />
              Unified RAG & Document Intelligence Architecture Overview
            </span>
            <Badge variant="outline" className="text-purple-300 border-purple-500/30 font-mono text-[9px]">
              4/4 Prompts Completed
            </Badge>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-[10px]">
            <div className="font-semibold text-purple-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Enterprise Architecture Verification
            </div>
            <p className="text-zinc-300 text-[9.5px] leading-relaxed">
              The RAG & Document Intelligence Engine comprises 4 core modules: Document Workspace & Library (Prompt 9.1), Document Intelligence Workspace (Prompt 9.2), Retrieval, Ranking & Citation Engine (Prompt 9.3), and Document Governance, Knowledge Quality & Executive Dashboard (Prompt 9.4). All operations execute internally with zero reliance on third-party vector databases or remote AI services.
            </p>
          </div>
        </div>
      )}

      {/* Existing Tabs 5-13 from Prompts 9.1 - 9.3 */}
      {activeTab === 'overview' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              Document Intelligence & Retrieval System Overview
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Workspace ID: {workspaceId}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Registered Documents</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">
                {docReport.totalDocuments} Specs
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Queries Processed</div>
              <div className="text-teal-400 font-mono font-bold text-sm pt-0.5">
                {retReport.retrievalReport.stats.totalQueriesProcessed} Requests
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Avg Retrieval Latency</div>
              <div className="text-cyan-400 font-mono font-bold text-sm pt-0.5">
                {retReport.retrievalReport.stats.avgRetrievalLatencyMs} ms
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Citation Accuracy</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {retReport.analytics.citationAccuracyScore}% Verified
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manager' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" />
              Registered Document Records & Metadata
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search documents by title or tag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 text-[11px] focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[10px]">
              <Filter className="w-3 h-3 text-zinc-400" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-zinc-900">All Categories</option>
                <option value="SPECIFICATION" className="bg-zinc-900">Specification</option>
                <option value="ARCHITECTURE" className="bg-zinc-900">Architecture</option>
                <option value="COMPLIANCE" className="bg-zinc-900">Compliance</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 text-[10px]">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-zinc-100 text-[11px]">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[8px] font-mono text-sky-300 border-sky-500/30">
                      {doc.fileType} • {doc.sizeKb} KB
                    </Badge>
                    <Badge variant="success" className="text-[8px] font-mono">
                      {doc.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-400 bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40">
                  <div>Folder Path: <span className="text-zinc-200 font-mono">{doc.folderPath}</span></div>
                  <div>Category: <span className="text-indigo-300 font-mono">{doc.category}</span></div>
                  <div>Author: <span className="text-zinc-200">{doc.metadata.author}</span></div>
                  <div>Checksum: <span className="text-zinc-400 font-mono">{doc.metadata.checksum}</span></div>
                </div>

                <div className="flex items-center gap-1.5 text-[8.5px]">
                  <Tag className="w-3 h-3 text-zinc-500" />
                  <div className="flex items-center gap-1">
                    {doc.tags.map((tag, idx) => (
                      <span key={idx} className="bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'library' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-indigo-400" />
              Document Collections & Directory Structures
            </span>
            <Badge variant="outline" className="text-indigo-300 border-indigo-500/30">
              {docReport.collections.length} Collections
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {docReport.collections.map(coll => (
              <div key={coll.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[11px] flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                    {coll.name}
                  </span>
                  <Badge variant="success" className="font-mono text-[8.5px]">
                    {coll.documentCount} Documents
                  </Badge>
                </div>
                <p className="text-zinc-400 text-[9px]">{coll.description}</p>
                <div className="flex items-center justify-between text-[8.5px] text-zinc-500 font-mono bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40">
                  <span>Directory: {coll.folderPath}</span>
                  <div className="flex items-center gap-1">
                    {coll.tags.map((t, idx) => (
                      <span key={idx} className="text-indigo-300">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-emerald-400" />
              Document Processing Queue & Validation Status
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              {docReport.processingJobs.length} Jobs
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {docReport.processingJobs.map(job => (
              <div key={job.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-zinc-100 text-[10.5px]">{job.documentTitle}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[8px] font-mono text-emerald-300 border-emerald-500/30">
                      Rank #{job.uploadQueueRank}
                    </Badge>
                    <Badge variant="success" className="text-[8px] font-mono">
                      {job.processingStatus}
                    </Badge>
                  </div>
                </div>
                <p className="text-zinc-400 text-[9px] bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40">
                  {job.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'parser' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              Document Parser Manager
            </span>
            <Badge variant="outline" className="text-amber-300 border-amber-500/30 font-mono text-[9px]">
              {intelReport.parserReport.validationStatus}
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {intelReport.parserReport.parsers.map(parser => (
              <div key={parser.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-zinc-100 text-[11px]">{parser.parserName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[8px] font-mono text-amber-300 border-amber-500/30">
                      {parser.fileType}
                    </Badge>
                    <Badge variant="success" className="text-[8px] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      {parser.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chunk' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-purple-400" />
              Document Chunk Manager & Token Strategy
            </span>
            <Badge variant="outline" className="text-purple-300 border-purple-500/30 font-mono text-[9px]">
              Avg: {intelReport.chunkReport.avgChunkSizeTokens} Tokens/Chunk
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {intelReport.chunkReport.sampleChunks.map(chunk => (
              <div key={chunk.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 text-[10px]">Chunk #{chunk.chunkOrder} — Document ID: {chunk.documentId}</span>
                  <Badge variant="outline" className="text-[8px] font-mono text-purple-300 border-purple-500/30">
                    ~{chunk.tokenEstimate} Tokens
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'index' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Database className="w-4 h-4 text-rose-400" />
              Knowledge Index Planner & Mapping Rules
            </span>
          </div>

          <div className="space-y-2 text-[10px]">
            {intelReport.indexPlanReport.plans.map(plan => (
              <div key={plan.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-300 text-[10.5px] font-mono">
                    Target: {plan.indexTargetKey}
                  </span>
                  <Badge variant="success" className="text-[8px] font-mono">
                    VALIDATED
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'retrieval' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Workspace & Document Retrieval Engine
            </span>
            <Badge variant="outline" className="text-teal-300 border-teal-500/30 font-mono text-[9px]">
              Latency: {retReport.retrievalReport.stats.avgRetrievalLatencyMs} ms
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {retReport.retrievalReport.recentQueries.map(q => (
              <div key={q.queryId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-teal-300 text-[10px]">Query ID: {q.queryId}</span>
                  <Badge variant="outline" className="text-[8px] font-mono text-teal-300 border-teal-500/30">
                    {q.retrievedDocsCount} Docs • {q.retrievedChunksCount} Chunks
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              Context Ranking Engine & Relevance Pipeline
            </span>
          </div>

          <div className="space-y-2 text-[10px]">
            {retReport.rankingReport.rankedContexts.map(ctx => (
              <div key={ctx.chunkId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[10.5px]">{ctx.docTitle}</span>
                  <Badge variant="success" className="text-[8px] font-mono">
                    {ctx.filteringStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'citation' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Link className="w-4 h-4 text-sky-400" />
              Citation Intelligence Engine
            </span>
          </div>

          <div className="space-y-2 text-[10px]">
            {retReport.citationReport.citations.map(cit => (
              <div key={cit.citationId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[10.5px]">{cit.docTitle}</span>
                  <Badge variant="success" className="text-[8px] font-mono">
                    {cit.verificationStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Retrieval System Analytics
            </span>
          </div>
          <div className="text-[10px] text-zinc-400">
            Total Retrieval Events: {retReport.analytics.totalRetrievalEvents}
          </div>
        </div>
      )}
    </div>
  );
};
