'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { firebaseProjectManagerService } from '@/services/firebase/project-manager';
import { firebaseAuthPlannerService } from '@/services/firebase/auth-planner';
import { firestorePlannerService } from '@/services/firebase/firestore-planner';
import { firebaseStoragePlannerService } from '@/services/firebase/storage-planner';
import { firestoreCollectionManagerService } from '@/services/firebase/collection-manager';
import { firestoreRulesManagerService } from '@/services/firebase/rules-manager';
import { firebaseAuthManagerService } from '@/services/firebase/auth-manager';
import { firebaseSecurityDashboardService } from '@/services/firebase/security-dashboard';
import { firebaseActivityManagerService } from '@/services/firebase/activity-manager';
import { firebaseMonitoringEngineService } from '@/services/firebase/monitoring-engine';
import { firebaseAnalyticsEngineService } from '@/services/firebase/analytics-engine';
import { firebaseConfigurationManagerService } from '@/services/firebase/configuration-manager';
import { firebaseBackupRecoveryPlannerService } from '@/services/firebase/backup-recovery-planner';
import { firebaseComplianceEngineService } from '@/services/firebase/compliance-engine';
import { firebaseExecutiveDashboardService } from '@/services/firebase/executive-dashboard';
import {
  Flame,
  ShieldCheck,
  Database,
  HardDrive,
  CheckCircle2,
  Server,
  Key,
  FolderTree,
  Lock,
  Layers,
  FileCode2,
  Users,
  ShieldAlert,
  Network,
  Activity,
  BarChart2,
  Clock,
  Filter,
  Check,
  Settings,
  RefreshCw,
  Award,
  TrendingUp
} from 'lucide-react';

interface FirebaseWorkspacePanelProps {
  projectId?: string;
}

export const FirebaseWorkspacePanel: React.FC<FirebaseWorkspacePanelProps> = ({
  projectId = 'proj_enterprise_01'
}) => {
  const [activeTab, setActiveTab] = useState<
    'project' | 'auth' | 'firestore' | 'storage' | 'collection' | 'rules' | 'auth_mgmt' | 'security' | 'activity' | 'monitoring' | 'analytics' | 'config_mgmt' | 'backup_recovery' | 'compliance' | 'executive_dash'
  >('project');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  const projectSummary = firebaseProjectManagerService.getProjectSummary(projectId);
  const authReport = firebaseAuthPlannerService.getAuthReadinessReport(projectId);
  const firestorePlan = firestorePlannerService.getFirestorePlan(projectId);
  const storagePlan = firebaseStoragePlannerService.getStoragePlan(projectId);

  // Prompt 7.2 Services
  const collectionReport = firestoreCollectionManagerService.getCollectionManagerReport(projectId);
  const rulesReport = firestoreRulesManagerService.getRulesManagerReport(projectId);
  const authManagerReport = firebaseAuthManagerService.getAuthManagerReport(projectId);
  const securityDashboard = firebaseSecurityDashboardService.getSecurityDashboard(projectId);

  // Prompt 7.3 Services
  const activityReport = firebaseActivityManagerService.getActivityReport(projectId);
  const monitoringReport = firebaseMonitoringEngineService.getMonitoringReport(projectId);
  const analyticsReport = firebaseAnalyticsEngineService.getAnalyticsReport(projectId);

  // Prompt 7.4 Services
  const configReport = firebaseConfigurationManagerService.getConfigurationReport(projectId);
  const backupPlan = firebaseBackupRecoveryPlannerService.getBackupRecoveryPlan(projectId);
  const complianceReport = firebaseComplianceEngineService.getComplianceReport(projectId);
  const executiveDashboard = firebaseExecutiveDashboardService.getExecutiveDashboard(projectId);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm">Firebase Integration Engine</h3>
            <p className="text-zinc-500 text-[11px]">Architectural Planning & Configuration Center</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="font-mono text-[10px]">
            Architecture Ready
          </Badge>
          <span className="text-zinc-500 text-[10px] font-mono">
            ID: {projectSummary.info.projectId}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 border-b border-zinc-800/80 pb-2 overflow-x-auto scrollbar-none text-[11px]">
        <button
          onClick={() => setActiveTab('project')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'project' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-amber-400" /> Firebase Project
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'auth' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authentication Planner
        </button>
        <button
          onClick={() => setActiveTab('firestore')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'firestore' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" /> Firestore Planner
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'storage' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-sky-400" /> Storage Planner
        </button>
        <button
          onClick={() => setActiveTab('collection')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'collection' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-violet-400" /> Collection Manager
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'rules' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-rose-400" /> Rules Manager
        </button>
        <button
          onClick={() => setActiveTab('auth_mgmt')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'auth_mgmt' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-teal-400" /> Auth Management
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'security' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Security Dashboard
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'activity' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" /> Activity Manager
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'monitoring' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" /> Monitoring Engine
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-fuchsia-400" /> Analytics Engine
        </button>
        <button
          onClick={() => setActiveTab('config_mgmt')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'config_mgmt' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-blue-400" /> Configuration
        </button>
        <button
          onClick={() => setActiveTab('backup_recovery')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'backup_recovery' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-400" /> Backup & Recovery
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'compliance' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-yellow-400" /> Compliance Engine
        </button>
        <button
          onClick={() => setActiveTab('executive_dash')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'executive_dash' ? 'bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Executive Dashboard
        </button>
      </div>

      {/* Tab 1: Firebase Project Manager */}
      {activeTab === 'project' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Server className="w-4 h-4 text-amber-400" />
              Firebase Project Information & Configuration
            </span>
            <Badge variant="success">{projectSummary.info.status}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Project ID</div>
              <div className="text-amber-300 font-mono font-medium truncate">{projectSummary.info.projectId}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Cloud Region</div>
              <div className="text-zinc-200 font-mono font-medium">{projectSummary.info.region}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Billing Plan</div>
              <div className="text-emerald-400 font-medium">{projectSummary.info.billingPlan}</div>
            </div>
          </div>

          {/* Environment Mapping */}
          <div className="space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Environment Mapping
            </span>
            <div className="space-y-1">
              {projectSummary.environments.map(env => (
                <div key={env.environment} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-amber-400 uppercase font-bold">{env.environment}: </span>
                    <span className="text-zinc-400">{env.config.authDomain}</span>
                  </div>
                  <Badge variant="success">CONFIGURED</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Project Validation */}
          <div className="space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Project Validation Checks
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {projectSummary.validation.checks.map((chk, idx) => (
                <div key={idx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-zinc-200 font-medium">{chk.name}</div>
                    <div className="text-zinc-500 text-[9px]">{chk.message}</div>
                  </div>
                  <Badge variant="success">{chk.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-300">Configuration Summary: </span>
            {projectSummary.summaryText}
          </div>
        </div>
      )}

      {/* Tab 2: Authentication Planner */}
      {activeTab === 'auth' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Firebase Authentication Planner & Readiness
            </span>
            <Badge variant="success" className="font-mono">
              Score: {authReport.readinessScore} / 100
            </Badge>
          </div>

          {/* Authentication Providers */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Authentication Providers
            </span>
            <div className="grid grid-cols-2 gap-2">
              {authReport.providers.map(prov => (
                <div key={prov.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-200 text-[11px]">{prov.name}</span>
                    <Badge variant={prov.enabled ? 'success' : 'outline'}>
                      {prov.enabled ? 'ENABLED' : 'DISABLED'}
                    </Badge>
                  </div>
                  <div className="text-zinc-500 text-[9px]">{prov.configRequirement}</div>
                  {prov.scopes && (
                    <div className="text-zinc-400 font-mono text-[9px]">
                      Scopes: {prov.scopes.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Domain Allowlist & MFA */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-300">OAuth Domain Allowlist</span>
              <div className="flex flex-wrap gap-1">
                {authReport.domainAllowlist.map((dom, dIdx) => (
                  <span key={dIdx} className="bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-[9px]">
                    {dom}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-300">Security & MFA Policy</span>
              <div className="text-emerald-400 font-medium">Multi-Factor Authentication Enforced</div>
              <div className="text-zinc-500 text-[9px]">Strict Email Verification Required for Writes</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Firestore Planner */}
      {activeTab === 'firestore' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" />
              Cloud Firestore Schema & Security Rules Planner
            </span>
            <Badge variant="success">Collections: {firestorePlan.collections.length}</Badge>
          </div>

          {/* Collection Planner */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" /> Collections Architecture
            </span>
            <div className="grid grid-cols-2 gap-2">
              {firestorePlan.collections.map((col, cIdx) => (
                <div key={cIdx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 text-[11px]">{col.name}</span>
                    <span className="text-zinc-500 font-mono text-[9px]">{col.entitySchema}</span>
                  </div>
                  <div className="text-zinc-400 font-mono text-[9px] truncate">{col.path}</div>
                  <div className="text-zinc-500 text-[9px]">{col.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Indexing & Rules Architecture */}
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Security Rules Blueprint (8-Pillar Hardened Architecture)
              </span>
              <Badge variant="success">ABAC Master Gate Enforced</Badge>
            </div>
            <pre className="bg-zinc-900 p-2 rounded text-[9px] font-mono text-zinc-300 overflow-x-auto border border-zinc-800">
              {firestorePlan.rulesPlan.rulesDraft}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Storage Planner */}
      {activeTab === 'storage' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-sky-400" />
              Firebase Cloud Storage Bucket & Folder Planner
            </span>
            <Badge variant="success">Bucket: {storagePlan.bucket.bucketName}</Badge>
          </div>

          {/* Folder Architecture */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Folder Structure & Upload Constraints</span>
            <div className="grid grid-cols-3 gap-2">
              {storagePlan.folders.map((fld, fIdx) => (
                <div key={fIdx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="font-mono text-sky-300 font-semibold">{fld.folderPath}</div>
                  <div className="text-zinc-500 text-[9px]">{fld.description}</div>
                  <div className="text-zinc-400 font-mono text-[8px]">
                    Max Size: {(fld.maxFileSizeBytes / (1024 * 1024)).toFixed(0)} MB
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Security Rules */}
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Storage Security Access Rules</span>
            <pre className="bg-zinc-900 p-2 rounded text-[9px] font-mono text-zinc-300 overflow-x-auto border border-zinc-800">
              {storagePlan.accessRules.rulesDraft}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 5: Collection Manager (Prompt 7.2) */}
      {activeTab === 'collection' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-violet-400" />
              Firestore Collection Manager & Statistics
            </span>
            <Badge variant="success" className="font-mono">
              Collections: {collectionReport.statistics.totalCollections}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Total Est. Documents</div>
              <div className="text-violet-300 font-mono font-bold">{collectionReport.statistics.totalEstimatedDocuments.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Storage Size</div>
              <div className="text-zinc-200 font-mono font-medium">{(collectionReport.statistics.totalStorageSizeBytes / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Daily Read Ops</div>
              <div className="text-emerald-400 font-mono font-medium">{collectionReport.statistics.dailyReadOperations.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Daily Write Ops</div>
              <div className="text-sky-400 font-mono font-medium">{collectionReport.statistics.dailyWriteOperations.toLocaleString()}</div>
            </div>
          </div>

          {/* Collection Metadata List */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Collection Browser & Metadata</span>
            <div className="grid grid-cols-2 gap-2">
              {collectionReport.collections.map(col => (
                <div key={col.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-violet-300 font-mono">{col.name}</span>
                    <Badge variant="outline" className="text-[8px] font-mono">{col.path}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400 text-[9px]">
                    <span>Docs: <strong className="text-zinc-200 font-mono">{col.documentCount}</strong></span>
                    <span>Avg Size: <strong className="text-zinc-200 font-mono">{col.avgDocumentSizeBytes} B</strong></span>
                  </div>
                  {col.subCollections.length > 0 && (
                    <div className="text-[9px] text-zinc-500 font-mono">
                      Subcollections: {col.subCollections.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Relationships */}
          <div className="space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <Network className="w-3.5 h-3.5 text-indigo-400" /> Collection Relationships
            </span>
            <div className="space-y-1 font-mono text-[9px]">
              {collectionReport.relationships.map((rel, rIdx) => (
                <div key={rIdx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-300">{rel.sourceCollection} &rarr; {rel.targetCollection}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">FK: {rel.foreignKeyField}</span>
                    <Badge variant="success">{rel.relationshipType}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Rules Manager (Prompt 7.2) */}
      {activeTab === 'rules' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-rose-400" />
              Firestore Operation Rules Manager
            </span>
            <Badge variant="success">Rule Engine Valid</Badge>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-300 leading-relaxed">
            <span className="font-semibold text-rose-300">Rules Summary: </span>
            {rulesReport.rulesSummary}
          </div>

          {/* Operation Rules breakdown */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="space-y-1.5">
              <span className="font-semibold text-emerald-400">Read & Query Policies</span>
              <div className="space-y-1">
                {rulesReport.readRules.map((rule, idx) => (
                  <div key={idx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-0.5 font-mono text-[9px]">
                    <div className="text-zinc-200 font-bold">{rule.collectionPath}</div>
                    <div className="text-zinc-400 truncate">{rule.condition}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-amber-400">Write, Update & Delete Policies</span>
              <div className="space-y-1">
                {rulesReport.writeRules.concat(rulesReport.updateRules, rulesReport.deleteRules).map((rule, idx) => (
                  <div key={idx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-0.5 font-mono text-[9px]">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-200 font-bold">{rule.collectionPath}</span>
                      <Badge variant="outline" className="text-[8px] uppercase">{rule.operation}</Badge>
                    </div>
                    <div className="text-zinc-400 truncate">{rule.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Auth Management (Prompt 7.2) */}
      {activeTab === 'auth_mgmt' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-400" />
              Authentication Roles & Permission Mapping
            </span>
            <Badge variant="success">Active Sessions: {authManagerReport.sessionOverview.activeSessions}</Badge>
          </div>

          {/* Roles */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">User Roles & Assigned Permissions</span>
            <div className="grid grid-cols-2 gap-2">
              {authManagerReport.roles.map(role => (
                <div key={role.roleId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-teal-300 text-[11px]">{role.name}</span>
                    <Badge variant="outline" className="font-mono text-[8px]">{role.assignedUsersCount} Users</Badge>
                  </div>
                  <div className="text-zinc-500 text-[9px]">{role.description}</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {role.permissions.map((p, pIdx) => (
                      <span key={pIdx} className="bg-zinc-900 text-teal-400 border border-teal-500/20 px-1 py-0.5 rounded font-mono text-[8px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Policies & Access Validation */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-300">Authentication Policies</span>
              <div className="space-y-1">
                {authManagerReport.authPolicies.map((pol, pIdx) => (
                  <div key={pIdx} className="flex items-center justify-between text-[9px]">
                    <span className="text-zinc-300">{pol.policyName}</span>
                    <Badge variant={pol.status === 'ENFORCED' ? 'success' : 'outline'}>{pol.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-300">Access Validation Audit</span>
              <div className="space-y-1 text-[9px] text-zinc-400">
                {authManagerReport.accessValidation.auditResults.map((res, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{res}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Security Dashboard (Prompt 7.2) */}
      {activeTab === 'security' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Firebase Security Dashboard & Executive Health
            </span>
            <Badge variant="success" className="font-mono text-[11px]">
              Security Score: {securityDashboard.securityScore} / 100
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px]">Authentication Health</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {securityDashboard.authHealth}
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px]">Firestore Health</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                <Database className="w-4 h-4 text-emerald-400" />
                {securityDashboard.firestoreHealth}
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px]">Security Rules Status</div>
              <div className="text-amber-300 font-bold font-mono text-[10px]">
                {securityDashboard.rulesStatus}
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-[10px]">
            <span className="font-semibold text-zinc-200">Security Configuration Summary</span>
            <div className="grid grid-cols-2 gap-2 text-zinc-400 font-mono text-[9px]">
              <div className="flex items-center justify-between bg-zinc-900 p-2 rounded">
                <span>SSL / TLS Enforced</span>
                <Badge variant="success">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between bg-zinc-900 p-2 rounded">
                <span>Firebase App Check</span>
                <Badge variant="success">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between bg-zinc-900 p-2 rounded">
                <span>Audit Log Retention</span>
                <span className="text-zinc-200">{securityDashboard.configSummary.auditLogRetentionDays} Days</span>
              </div>
              <div className="flex items-center justify-between bg-zinc-900 p-2 rounded">
                <span>Deployment Target</span>
                <span className="text-amber-400 uppercase">{securityDashboard.configSummary.environment}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Activity Manager (Prompt 7.3) */}
      {activeTab === 'activity' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              Firebase Activity Manager & Operation Audit Log
            </span>
            <div className="flex items-center gap-1 text-[10px]">
              <Filter className="w-3 h-3 text-zinc-500" />
              {['ALL', 'AUTH', 'FIRESTORE', 'STORAGE', 'PROJECT'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActivityFilter(cat)}
                  className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                    activityFilter === cat ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300">24-Hour Operation Volume Timeline</span>
            <div className="grid grid-cols-6 gap-1 pt-1 font-mono text-[9px] text-center">
              {activityReport.timeline.map((point, pIdx) => (
                <div key={pIdx} className="bg-zinc-900 p-1.5 rounded border border-zinc-800/60">
                  <div className="text-cyan-400 font-bold">{point.eventCount}</div>
                  <div className="text-zinc-500 text-[8px]">{point.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Events List */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Recent Operations</span>
            <div className="space-y-1.5">
              {activityReport.activities
                .filter(act => activityFilter === 'ALL' || act.category === activityFilter)
                .map(act => (
                  <div key={act.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] font-mono text-cyan-400 border-cyan-500/30">
                          {act.category}
                        </Badge>
                        <span className="font-semibold text-zinc-200 text-[11px]">{act.operation}</span>
                      </div>
                      <Badge variant={act.status === 'SUCCESS' ? 'success' : act.status === 'WARNING' ? 'outline' : 'destructive'}>
                        {act.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 text-[9px] font-mono">
                      <span>Actor: <strong className="text-zinc-400">{act.actor}</strong></span>
                      <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-zinc-400 text-[9px] bg-zinc-900/80 p-1.5 rounded border border-zinc-800/40">
                      {act.details}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 10: Monitoring Engine (Prompt 7.3) */}
      {activeTab === 'monitoring' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Firebase Real-Time Monitoring & Service Health
            </span>
            <Badge variant="success" className="font-mono">
              Status: {monitoringReport.overallFirebaseStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Authentication Service</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs pt-1">
                <Check className="w-4 h-4 text-emerald-400" />
                {monitoringReport.authHealth}
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Firestore Database</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs pt-1">
                <Check className="w-4 h-4 text-emerald-400" />
                {monitoringReport.firestoreHealth}
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Cloud Storage</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs pt-1">
                <Check className="w-4 h-4 text-emerald-400" />
                {monitoringReport.storageHealth}
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-300 leading-relaxed">
            <span className="font-semibold text-emerald-400">Health Summary: </span>
            {monitoringReport.healthSummary}
          </div>

          {/* Metrics Grid */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Live Health Metrics</span>
            <div className="grid grid-cols-2 gap-2">
              {monitoringReport.metrics.map((m, mIdx) => (
                <div key={mIdx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-zinc-400 text-[9px]">{m.metricName}</div>
                    <div className="text-zinc-100 font-mono font-bold text-[11px]">{m.value}</div>
                  </div>
                  <Badge variant={m.status === 'NORMAL' ? 'success' : 'destructive'}>{m.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 11: Analytics Engine (Prompt 7.3) */}
      {activeTab === 'analytics' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-fuchsia-400" />
              Firebase Usage Analytics & Resource Metrics
            </span>
            <Badge variant="success">Analytics Active</Badge>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Total Registered Users</div>
              <div className="text-fuchsia-300 font-mono font-bold text-xs">{analyticsReport.userStats.totalUsers}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">Daily Active Users</div>
              <div className="text-zinc-200 font-mono font-bold text-xs">{analyticsReport.userStats.activeDailyUsers}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">New Users (30d)</div>
              <div className="text-emerald-400 font-mono font-bold text-xs">+{analyticsReport.userStats.newUsersThisMonth}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <div className="text-zinc-400">MFA Adoption</div>
              <div className="text-amber-300 font-mono font-bold text-xs">{analyticsReport.userStats.mfaUsersPercent}%</div>
            </div>
          </div>

          {/* Collection Analytics */}
          <div className="space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Collection Read / Write Load Analytics</span>
            <div className="grid grid-cols-2 gap-2">
              {analyticsReport.collectionStats.map((cs, cIdx) => (
                <div key={cIdx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 font-mono text-[9px]">
                  <div className="flex items-center justify-between text-zinc-200 font-bold">
                    <span>{cs.collectionName}</span>
                    <span className="text-zinc-400">{cs.docCount} Docs</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[8px] text-zinc-400 pt-0.5">
                    <div>Reads: <strong className="text-emerald-400">{cs.readOps.toLocaleString()}</strong></div>
                    <div>Writes: <strong className="text-sky-400">{cs.writeOps.toLocaleString()}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Analytics */}
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-300">Storage Bucket Analytics</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[9px]">
              <div className="bg-zinc-900 p-2 rounded">
                <div className="text-zinc-500 text-[8px]">Used Capacity</div>
                <div className="text-zinc-200 font-bold">{(analyticsReport.storageStats.usedStorageBytes / (1024 * 1024)).toFixed(1)} MB</div>
              </div>
              <div className="bg-zinc-900 p-2 rounded">
                <div className="text-zinc-500 text-[8px]">Total Files</div>
                <div className="text-zinc-200 font-bold">{analyticsReport.storageStats.fileCount}</div>
              </div>
              <div className="bg-zinc-900 p-2 rounded">
                <div className="text-zinc-500 text-[8px]">Monthly Egress Bandwidth</div>
                <div className="text-fuchsia-300 font-bold">{(analyticsReport.storageStats.bandwidthUsageBytes / (1024 * 1024 * 1024)).toFixed(2)} GB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 12: Configuration Manager (Prompt 7.4) */}
      {activeTab === 'config_mgmt' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-400" />
              Firebase Configuration Manager & Validation
            </span>
            <Badge variant="success">Validation: {configReport.validationStatus}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 font-mono text-[9px]">
              <span className="font-semibold text-blue-300 font-sans text-[10px]">Project Overview</span>
              <div className="text-zinc-400">ID: <strong className="text-zinc-200">{configReport.projectConfigSummary.projectId}</strong></div>
              <div className="text-zinc-400">Region: <strong className="text-zinc-200">{configReport.projectConfigSummary.region}</strong></div>
              <div className="text-zinc-400">Plan: <strong className="text-amber-400">{configReport.projectConfigSummary.billingPlan}</strong></div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 font-mono text-[9px]">
              <span className="font-semibold text-emerald-300 font-sans text-[10px]">Auth & Security Config</span>
              <div className="text-zinc-400">MFA Enforced: <strong className="text-emerald-400">{configReport.authConfig.mfaEnforced ? 'YES' : 'NO'}</strong></div>
              <div className="text-zinc-400">App Check: <strong className="text-emerald-400">{configReport.securityConfig.appCheckEnforced ? 'ENFORCED' : 'OFF'}</strong></div>
              <div className="text-zinc-400">Rules Version: <strong className="text-zinc-200">v{configReport.securityConfig.rulesVersion} ({configReport.securityConfig.tlsVersion})</strong></div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300">Active Integrated Services</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {configReport.projectConfigSummary.servicesEnabled.map((srv, sIdx) => (
                <span key={sIdx} className="bg-zinc-900 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono text-[9px]">
                  {srv}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 13: Backup & Recovery Planner (Prompt 7.4) */}
      {activeTab === 'backup_recovery' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-orange-400" />
              Firebase Backup Strategy & Recovery Readiness
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Readiness: {backupPlan.recoveryReadinessScore}%
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[9px]">
              <span className="font-semibold text-orange-300 text-[10px]">Firestore Automated Backup Plan</span>
              <div className="text-zinc-400 font-mono">Frequency: <strong className="text-zinc-200">{backupPlan.firestoreBackupPlan.frequency} ({backupPlan.firestoreBackupPlan.scheduleCron})</strong></div>
              <div className="text-zinc-400 font-mono">Retention: <strong className="text-zinc-200">{backupPlan.firestoreBackupPlan.retentionDays} Days</strong></div>
              <div className="text-zinc-500 font-mono text-[8px] truncate">{backupPlan.firestoreBackupPlan.destinationBucket}</div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[9px]">
              <span className="font-semibold text-sky-300 text-[10px]">Storage & Auth Export Strategy</span>
              <div className="text-zinc-400 font-mono">Sync Type: <strong className="text-zinc-200">{backupPlan.storageBackupPlan.syncType} ({backupPlan.storageBackupPlan.frequency})</strong></div>
              <div className="text-zinc-400 font-mono">Auth Format: <strong className="text-zinc-200">{backupPlan.authBackupStrategy.exportFormat}</strong></div>
              <div className="text-zinc-400 font-mono">Key Managed: <strong className="text-emerald-400">{backupPlan.authBackupStrategy.encryptionKeyManaged ? 'KMS ENABLED' : 'NO'}</strong></div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300">Disaster Recovery Workflow Steps</span>
            <div className="space-y-1 pt-1 text-[9px] text-zinc-400 font-mono">
              {backupPlan.recoveryWorkflowSteps.map((step, idx) => (
                <div key={idx} className="bg-zinc-900 p-1.5 rounded border border-zinc-800">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 14: Compliance Engine (Prompt 7.4) */}
      {activeTab === 'compliance' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" />
              Firebase Security & Regulatory Compliance Engine
            </span>
            <Badge variant="success" className="font-mono text-[10px]">
              Score: {complianceReport.complianceScore} / 100
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[9px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Security Policy</span>
                <Badge variant="success">{complianceReport.securityCompliance.status}</Badge>
              </div>
              <p className="text-zinc-400 leading-normal">{complianceReport.securityCompliance.details}</p>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[9px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Auth & Privacy</span>
                <Badge variant="success">{complianceReport.authCompliance.status}</Badge>
              </div>
              <p className="text-zinc-400 leading-normal">{complianceReport.authCompliance.details}</p>
            </div>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300">Best Practice Verification Rules</span>
            <div className="space-y-1 pt-1">
              {complianceReport.bestPracticeValidation.map((rule, rIdx) => (
                <div key={rIdx} className="bg-zinc-900 p-1.5 rounded border border-zinc-800 flex items-center justify-between text-[9px]">
                  <span className="text-zinc-300">{rule.rule}</span>
                  <Badge variant={rule.passed ? 'success' : 'destructive'}>
                    {rule.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 15: Executive Dashboard (Prompt 7.4) */}
      {activeTab === 'executive_dash' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Firebase Integration Executive Control Dashboard
            </span>
            <Badge variant="success" className="font-mono text-[11px]">
              Overall: {executiveDashboard.overallFirebaseHealth}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Security Score</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">{executiveDashboard.securityScore}%</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Compliance Score</div>
              <div className="text-yellow-400 font-mono font-bold text-sm pt-0.5">{executiveDashboard.complianceScore}%</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Backup Readiness</div>
              <div className="text-sky-400 font-mono font-bold text-sm pt-0.5">{executiveDashboard.backupReadinessScore}%</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Config Health</div>
              <div className="text-fuchsia-300 font-mono font-bold text-xs pt-1">{executiveDashboard.configurationHealth}</div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-200">Executive Summary</span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {executiveDashboard.executiveSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
